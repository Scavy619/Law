# LawBridge Legal Chatbot

A RAG (Retrieval Augmented Generation) chatbot system for legal document querying using Indian Constitutional Law documents.

## Features

- PDF document loading and processing
- Text chunking and embedding creation
- Vector database: Pinecone
- FastAPI-based chat API
- LLM: Google Gemini 2.5 Flash API
- Hybrid RAG pipeline with LLM-based intent classification — web search and user document retrieval are triggered only when needed, not on every query
- Multilingual support — detects user's language (Hindi, Hinglish, Tamil, Telugu, Bengali, etc.) and responds in the same language
- Tavily web search queries are automatically translated to English before searching, ensuring accurate results regardless of input language
- Intent classifier uses Gemini to determine `needs_web_search` and `needs_user_docs` per query, reducing unnecessary Pinecone and Tavily calls

## Setup

1. **Install dependencies:**
   ```bash
   uv pip install -r req.txt
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Setup embeddings and start server:**
   ```bash
   python main.py
   ```

## Usage

### Commands

- `python main.py` - Complete setup and start server
- `python main.py setup` - Only setup embeddings
- `python main.py server` - Only start API server
- `python main.py help` - Show available commands

### API Endpoints

- `GET /` - Root endpoint
- `POST /chat` - Chat with the legal assistant
- `GET /health` - Health check

### Chat API Example

```bash
curl -X POST "http://localhost:8000/chat" \
     -H "Content-Type: application/json" \
     -d '{"question": "What are fundamental rights in Indian Constitution?"}'
```

## Project Structure

```
chatbot/
├── main.py                 # Main application entry point
├── data/                   # PDF documents
├── src/
│   ├── api/
│   │   └── chat.py        # FastAPI chat endpoints
│   ├── config/
│   │   ├── env.py         # Environment configuration
│   │   ├── genai_initialize.py  # Google AI setup
│   │   └── pinecone_initialize.py  # Pinecone setup
│   ├── embeddings/
│   │   └── create_embeddings.py  # Embedding creation
│   ├── loaders/
│   │   └── loader.py      # PDF loading
│   ├── processors/
│   │   └── text_chunker.py  # Text chunking
│   └── vectorStore_Retrieval/
│       └── store_embedding.py  # Vector storage
```