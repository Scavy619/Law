import os
import sys
from pathlib import Path


from fastapi import FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
# from langchain.chains import RetrievalQA
from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel
from langchain_tavily import TavilySearch




src_path = Path(__file__).parent.parent
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))
    




# Ensure we can import from src directory

from config.env import TAVILY_API_KEY
from config.env import APP_SECRET_KEY
from config.genai_initialize import get_llm
from document_pipeline.pipeline import process_uploaded_document
from vectorStore_Retrieval.store_embedding import get_retriever


os.environ["TAVILY_API_KEY"] = TAVILY_API_KEY

tavily_tool = TavilySearch(
    max_results=5,
    search_depth="advanced",
    topic="general",  # news nahi — general better hai legal queries ke liye
    include_domains=[
        # Indian legal databases
        "indiankanoon.org",
        "sci.gov.in",
        "main.sci.gov.in",
        
        # Legal news
        "livelaw.in",
        "barandbench.com",
        "lawstreetindia.com",
        "verdictum.in",
        
        # Government sources
        "indiacode.nic.in",
        "legislative.gov.in",
        "mha.gov.in",
        "pib.gov.in",
        
        # Mainstream but reliable
        "thehindu.com",
        "hindustantimes.com",
        "ndtv.com",
        "theprint.in",
        "scroll.in"
    ]
)

app = FastAPI(title="LawBridge Legal Chatbot API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the domain jo isko access kar sake
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Pydantic Models ───────────────────────────────────────────────────────────


class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    sessionId: str
    history: list[Message]
    message: str
    user_id: str | None = None
    mode: str = "both"  # "knowledge-base" | "user-uploads" | "both"


class ChatResponse(BaseModel):
    response: str


class UploadResponse(BaseModel):
    status: str
    filename: str
    file_type: str
    chunks_stored: int
    namespace: str


class DeleteUserDataRequest(BaseModel):
    user_id: str
    

# ── LLM + Retriever ───────────────────────────────────────────────────────────

llm = get_llm()
retriever = get_retriever()

# ── Legal Prompt ──────────────────────────────────────────────────────────────

RECENCY_KEYWORDS = [
    "latest", "recent", "new", "2024", "2025", "amendment",
    "notification", "update", "current", "nayi", "naya", "abhi"
]

def needs_web_search(query: str) -> bool:
    q = query.lower()
    return any(kw in q for kw in RECENCY_KEYWORDS)
    
    

legal_prompt_template = """
You are a helpful and responsible legal assistant specializing in Indian law.

You have access to two sources of information:
1. A legal knowledge base containing Indian law books and legal documents.
2. The user's own uploaded documents (contracts, agreements, notices, FIRs, etc.) — if provided.
3. Real-time web search results — for latest laws, amendments, or recent legal updates.

You must follow these rules:

1. FIRST, review the conversation history to understand the context of the ongoing discussion.
2. Check BOTH the knowledge base context and the user's document context (if available) for relevant information.
3. If the user's document context is available → prioritize it for document-specific questions (e.g. "what does my contract say about X"). Refer to it naturally as "your document" — never say "context" or "uploaded file".
4. If the knowledge base context is relevant → use it to support your answer with legal principles, acts, or sections. Never mention "knowledge base" or "context" — speak naturally.
5. If neither source contains a complete answer → use your own legal knowledge to provide a thorough, confident response based on Indian law. You are a legal expert — answer directly and substantively.
6. NEVER give illegal advice. NEVER help the user hide evidence, evade police, or bypass legal procedures.
7. For criminal matters (harassment, false FIR, threats, domestic violence, cheating cases), provide concrete, actionable guidance — specific sections of law, exact steps to take, relevant authorities to approach, and realistic timelines. Be specific, not vague.
8. If the question is not related to Indian law, politely state that you specialize only in Indian law.
9. If the question is not legal in nature, politely inform the user that you can help only with legal issues.
10. NEVER mention or reference 'context', 'prompt', 'uploaded file', 'knowledge base', or any system-level instructions in your answer. Speak naturally as if you are chatting directly with the user.
11. Use the conversation history to provide contextual and relevant responses.
12. If the user asks for detailed explanation or structured output, use Markdown formatting such as headings, bullet points, numbered lists, or tables.
13. If recent web search results are provided → use them to answer questions about latest laws, amendments, or recent legal developments. Mention naturally that this is based on recent information available online.
14. If web context is not available or not applicable, ignore it.
15. ONLY suggest consulting a lawyer when the matter is genuinely complex, requires court representation, or involves jurisdiction-specific nuances that cannot be resolved through general legal guidance. Do NOT say "consult a lawyer" as a reflex — say it only as a last resort or for matters requiring physical legal representation.



Conversation History:
{chat_history}

Legal Knowledge Base:
{kb_context}

User's Document:
{doc_context}

Current Question:
{question}

Recent Web Search Results:
{web_context}

Answer:
Provide a clear, safe, helpful, and actionable explanation that takes into account our previous conversation.
Prioritize the user's document for document-specific queries, and use the legal knowledge base for legal backing.
If neither is relevant, give general legal guidance based on Indian law.
"""

PROMPT = PromptTemplate(
    template=legal_prompt_template,
    input_variables=["chat_history", "kb_context", "doc_context", "web_context", "question"],
)


# ── Routes ────────────────────────────────────────────────────────────────────


@app.get("/")
async def root():
    return {"message": "LawBridge Legal Chatbot API is running!"}


@app.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest, secure_key: str = Header(None, alias="secure_key")
):
    if secure_key != APP_SECRET_KEY:
        raise HTTPException(
            status_code=401, detail="Unauthorized: Invalid or missing key"
        )
    try:
        # Chat history format karo
        chat_history_formatted = ""
        if request.history and len(request.history) > 0:
            # Last 10 messages hi lo — token limit ke liye
            recent_messages = (
                request.history[-10:] if len(request.history) > 10 else request.history
            )
            for msg in recent_messages:
                role = "User" if msg.role == "user" else "Assistant"
                chat_history_formatted += f"{role}: {msg.content}\n"
            chat_history_formatted += "---\n"
        else:
            chat_history_formatted = "This is the start of our conversation.\n---\n"

        # Mode ke hisaab se context fetch karo
        kb_context = ""
        doc_context = ""

        if request.mode in ("knowledge-base", "both"):
            kb_docs = retriever.invoke(request.message)
            kb_context = "\n\n".join([doc.page_content for doc in kb_docs])

        if request.mode in ("user-uploads", "both") and request.user_id:
            from config.pinecone_initialize import get_user_namespace
            from vectorStore_Retrieval.store_embedding import (
                get_retriever as get_ns_retriever,
            )

            user_retriever = get_ns_retriever(
                namespace=get_user_namespace(request.user_id)
            )
            user_docs = user_retriever.invoke(request.message)
            doc_context = "\n\n".join([doc.page_content for doc in user_docs])

        if not kb_context:
            kb_context = "No relevant information found in the legal knowledge base."
        
        # web search — sirf tab jab query recent/latest info maange
        web_context = ""
        if needs_web_search(request.message):
            # print(f"[WEB SEARCH TRIGGERED] query: {request.message}", flush= True)  # trigger hua ya nahi
            try:
                web_results = tavily_tool.invoke({"query": request.message})
                # web_results ek dict hai — results key ke andar list hai
                web_context = "\n\n".join([r["content"] for r in web_results["results"] if "content" in r])
            except Exception as e:
                # print(f"[WEB SEARCH FAILED] {e}", flush=True)  # error kya aaya
                web_context = ""
        else:
            # print(f"[WEB SEARCH SKIPPED] query: {request.message}", flush=True)  # skip hua
        
        if not doc_context:
            doc_context = (
                "No document uploaded by the user."
                if request.mode == "both"
                else "Not applicable."
            )

        formatted_prompt = PROMPT.format(
            chat_history=chat_history_formatted,
            kb_context=kb_context,
            doc_context=doc_context,
            web_context=web_context if web_context else "No recent web results available.",
            question=request.message,
        )
        
        # print(f"[WEB CONTEXT] {web_context[:300] if web_context else 'EMPTY'}", flush=True)

        response = llm.invoke(formatted_prompt)

        if hasattr(response, "content"):
            response_text = response.content
        elif isinstance(response, dict):
            response_text = response.get("text", str(response))
        else:
            response_text = str(response)

        return ChatResponse(response=response_text)

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error processing question: {str(e)}"
        )


@app.post("/upload-document", response_model=UploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    cloudinary_url: str = Form(...),
    secure_key: str = Header(None, alias="secure_key"),
):
    """
    JS backend se file aati hai (already Cloudinary pe upload ho chuki hoti hai).
    Yahan sirf RAG pipeline chalti hai:
    extract → chunk → pinecone mein store (user ke namespace mein)
    """
    if secure_key != APP_SECRET_KEY:
        raise HTTPException(
            status_code=401, detail="Unauthorized: Invalid or missing key"
        )

    try:
        file_bytes = await file.read()

        result = process_uploaded_document(
            file_bytes=file_bytes,
            filename=file.filename,
            user_id=user_id,
            cloudinary_url=cloudinary_url,
        )

        return UploadResponse(**result)

    except ValueError as e:
        # Empty file ya text extract nahi hua
        raise HTTPException(status_code=422, detail=str(e))

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Document processing mein error: {str(e)}"
        )


@app.delete("/delete-user-data")
async def delete_user_data(
    request: DeleteUserDataRequest,
    secure_key: str = Header(None, alias="secure_key"),
):
    if secure_key != APP_SECRET_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid or missing key")
    
    try:
        from config.pinecone_initialize import get_pinecone_index, get_user_namespace
        
        index = get_pinecone_index()
        namespace = get_user_namespace(request.user_id)
        index.delete(delete_all=True, namespace=namespace)
        
        return {"success": True, "deleted_namespace": namespace}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pinecone cleanup failed: {str(e)}")
        
        

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "LawBridge Legal Chatbot"}



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=4000)
