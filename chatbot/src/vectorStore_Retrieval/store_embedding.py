import json
import re
import sys
import time
from pathlib import Path

from langchain_pinecone import PineconeVectorStore

# Ensure we can import from src directory
src_path = Path(__file__).parent.parent
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

from config.env import PINECONE_INDEX
from config.genai_initialize import get_embedding_model
from config.pinecone_initialize import (
    get_pinecone_index,
    get_user_namespace,
    NAMESPACE_KNOWLEDGE_BASE,
)

embedding_model = get_embedding_model()


# ── Vector Store Factory ──────────────────────────────────────────────────────
# We don't create a single global vector_store anymore because each namespace
# needs its own PineconeVectorStore instance.
# Use get_vector_store(namespace) instead.

def get_vector_store(namespace: str) -> PineconeVectorStore:
    """
    Returns a PineconeVectorStore scoped to the given namespace.

    Args:
        namespace: Use NAMESPACE_KNOWLEDGE_BASE for books,
                   or get_user_namespace(user_id) for user uploads.
    """
    return PineconeVectorStore(
        index=get_pinecone_index(),
        embedding=embedding_model,
        namespace=namespace,
    )


# ── Progress file (only used for knowledge-base batch ingestion) ──────────────
PROGRESS_FILE = Path(__file__).parent / "progress.json"

BATCH_SIZE = 25   # max chunks per request (API hard limit)
REQ_DELAY  = 1.0  # seconds between requests (1 req/sec)
MAX_RETRIES = 5   # max retries on 429
BASE_BACKOFF = 35  # base wait (seconds) on 429 before retry


# ── Progress helpers ──────────────────────────────────────────────────────────

def _load_progress() -> int:
    if PROGRESS_FILE.exists():
        try:
            data = json.loads(PROGRESS_FILE.read_text())
            batch_idx = int(data.get("next_batch", 0))
            print(f"[resume] Found progress.json — resuming from batch {batch_idx}.")
            return batch_idx
        except Exception:
            pass
    return 0


def _save_progress(next_batch: int) -> None:
    PROGRESS_FILE.write_text(json.dumps({"next_batch": next_batch}, indent=2))


def _clear_progress() -> None:
    if PROGRESS_FILE.exists():
        PROGRESS_FILE.unlink()


# ── Rate-limit helpers ────────────────────────────────────────────────────────

def _is_429(error: Exception) -> bool:
    return (
        "429" in str(error)
        or "quota" in str(error).lower()
        or "rate" in str(error).lower()
    )


def _is_daily_quota(error: Exception) -> bool:
    msg = str(error).lower()
    return "daily" in msg or "per day" in msg or "daily_limit" in msg


def _parse_retry_delay(error: Exception) -> int:
    match = re.search(r"retry_delay\s*\{\s*seconds:\s*(\d+)", str(error))
    if match:
        return int(match.group(1)) + 5
    return BASE_BACKOFF


# ── Core store function ───────────────────────────────────────────────────────

def store_embeddings(documents: list, namespace: str = NAMESPACE_KNOWLEDGE_BASE) -> None:
    """
    Embed and store documents into Pinecone under the given namespace.

    Args:
        documents : List of LangChain Document objects (chunked)
        namespace : Which Pinecone namespace to write to.
                    Defaults to NAMESPACE_KNOWLEDGE_BASE ("knowledge-base").
                    For user uploads pass get_user_namespace(user_id).

    Guarantees:
      - Max 25 chunks per API request
      - 1 second gap between every request
      - Retries only on 429 (rate limit), up to MAX_RETRIES times
      - Immediately stops on daily quota exhaustion
      - Saves progress to progress.json after each successful batch (knowledge-base only)
      - Automatically resumes from last saved batch on restart
      - Sequential — zero parallel requests
    """
    vector_store = get_vector_store(namespace)

    total = len(documents)
    num_batches = (total + BATCH_SIZE - 1) // BATCH_SIZE

    # Progress resume only makes sense for large knowledge-base ingestion
    is_knowledge_base = namespace == NAMESPACE_KNOWLEDGE_BASE
    start_batch = _load_progress() if is_knowledge_base else 0

    if start_batch >= num_batches:
        print("[store_embeddings] All batches already completed per progress.json.")
        _clear_progress()
        return

    print(
        f"[store_embeddings] namespace='{namespace}' | "
        f"{total} chunks → {num_batches} batches of {BATCH_SIZE}. "
        f"Starting at batch {start_batch}."
    )

    for batch_num in range(start_batch, num_batches):
        start_idx = batch_num * BATCH_SIZE
        batch = documents[start_idx : start_idx + BATCH_SIZE]

        for attempt in range(1, MAX_RETRIES + 1):
            try:
                print(
                    f"  [{batch_num + 1}/{num_batches}] "
                    f"chunks {start_idx}–{start_idx + len(batch) - 1} "
                    f"(attempt {attempt}/{MAX_RETRIES})..."
                )

                vector_store.add_documents(batch)

                print(f"  [{batch_num + 1}/{num_batches}] stored ✓")

                if is_knowledge_base:
                    _save_progress(batch_num + 1)
                break

            except Exception as e:
                if _is_daily_quota(e):
                    print(
                        f"\n[FATAL] Daily quota exhausted at batch {batch_num + 1}. "
                        f"Progress saved — run again tomorrow to resume.\n"
                        f"Error: {e}"
                    )
                    raise SystemExit(1)

                if _is_429(e):
                    if attempt == MAX_RETRIES:
                        print(
                            f"  [{batch_num + 1}/{num_batches}] "
                            f"Max retries reached. Aborting.\nError: {e}"
                        )
                        raise

                    wait = _parse_retry_delay(e)
                    print(
                        f"  Rate limit hit. "
                        f"Waiting {wait}s before retry {attempt + 1}/{MAX_RETRIES}..."
                    )
                    time.sleep(wait)
                    continue

                print(f"  [{batch_num + 1}/{num_batches}] Unexpected error: {e}")
                raise

        if batch_num < num_batches - 1:
            time.sleep(REQ_DELAY)

    if is_knowledge_base:
        _clear_progress()

    print(f"\n[store_embeddings] All {total} chunks stored in namespace '{namespace}' successfully.")


# ── Retrieval ─────────────────────────────────────────────────────────────────

def get_retriever(namespace: str = NAMESPACE_KNOWLEDGE_BASE, k: int = 3):
    """
    Returns a retriever scoped to the given namespace.

    Args:
        namespace : NAMESPACE_KNOWLEDGE_BASE for books/legal docs,
                    get_user_namespace(user_id) for user uploads.
        k         : Number of chunks to retrieve per query.

    Usage:
        # General legal Q&A (existing books)
        retriever = get_retriever()

        # User's uploaded document Q&A
        retriever = get_retriever(namespace=get_user_namespace("abc123"))

        # Both combined — pass both retrievers to an EnsembleRetriever
    """
    return get_vector_store(namespace).as_retriever(
        search_type="similarity",
        search_kwargs={"k": k},
    )


# ── Legacy: keep old module-level retriever working so existing code doesn't break ──
# Any file that does `from vectorStore_Retrieval.store_embedding import retriever`
# will still get a working retriever pointed at knowledge-base.
retriever = get_retriever(NAMESPACE_KNOWLEDGE_BASE)


# ── Utility ───────────────────────────────────────────────────────────────────

def check_embeddings_exist(namespace: str = NAMESPACE_KNOWLEDGE_BASE) -> bool:
    """
    Check if embeddings exist in the given namespace.
    Returns True if vectors are present, False otherwise.
    """
    try:
        index = get_pinecone_index()
        stats = index.describe_index_stats()
        namespaces = stats.get("namespaces", {})

        vector_count = namespaces.get(namespace, {}).get("vector_count", 0)

        if vector_count > 0:
            print(f"Found {vector_count} existing vectors in namespace '{namespace}'.")
            return True

        print(f"No vectors found in namespace '{namespace}'.")
        return False

    except Exception as e:
        print(f"Error checking embeddings: {e}")
        return False


def delete_user_namespace(user_id: str) -> None:
    """
    Deletes ALL vectors for a specific user from Pinecone.
    Use when a user deletes their account or wants to clear their uploads.

    Args:
        user_id: The user's ID whose namespace should be wiped.
    """
    namespace = get_user_namespace(user_id)
    try:
        index = get_pinecone_index()
        index.delete(delete_all=True, namespace=namespace)
        print(f"Deleted all vectors in namespace '{namespace}'.")
    except Exception as e:
        print(f"Error deleting namespace '{namespace}': {e}")
        raise
    
    
    