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
from config.pinecone_initialize import get_pinecone_index

embedding_model = get_embedding_model()

# Initialize vector store
vector_store = PineconeVectorStore(
    index=get_pinecone_index(),
    embedding=embedding_model,
)

# Progress file lives next to this file
PROGRESS_FILE = Path(__file__).parent / "progress.json"

BATCH_SIZE = 25  # max chunks per request (API hard limit)
REQ_DELAY = 1.0  # seconds between requests (1 req/sec)
MAX_RETRIES = 5  # max retries on 429
BASE_BACKOFF = 35  # base wait (seconds) on 429 before retry


# ── progress helpers ──────────────────────────────────────────────────────────


def _load_progress() -> int:
    """Return the index of the next batch to process (0 if no prior run)."""
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
    """Persist the index of the next batch that still needs to be processed."""
    PROGRESS_FILE.write_text(json.dumps({"next_batch": next_batch}, indent=2))


def _clear_progress() -> None:
    """Delete progress file after a successful full run."""
    if PROGRESS_FILE.exists():
        PROGRESS_FILE.unlink()


# ── rate-limit helpers ────────────────────────────────────────────────────────


def _is_429(error: Exception) -> bool:
    return (
        "429" in str(error)
        or "quota" in str(error).lower()
        or "rate" in str(error).lower()
    )


def _is_daily_quota(error: Exception) -> bool:
    """Daily quota errors should stop execution immediately — retrying is pointless."""
    msg = str(error).lower()
    return "daily" in msg or "per day" in msg or "daily_limit" in msg


def _parse_retry_delay(error: Exception) -> int:
    """Extract retry_delay seconds from Google's error message, fall back to BASE_BACKOFF."""
    match = re.search(r"retry_delay\s*\{\s*seconds:\s*(\d+)", str(error))
    if match:
        return int(match.group(1)) + 5  # +5s buffer
    return BASE_BACKOFF


# ── main function ─────────────────────────────────────────────────────────────


def store_embeddings(documents: list) -> None:
    """
    Embed and store documents into Pinecone in a production-safe manner.

    Guarantees:
      - Max 25 chunks per API request
      - 1 second gap between every request
      - Retries only on 429 (rate limit), up to MAX_RETRIES times
      - Immediately stops on daily quota exhaustion
      - Saves progress to progress.json after each successful batch
      - Automatically resumes from last saved batch on restart
      - Sequential — zero parallel requests
    """
    total = len(documents)
    num_batches = (total + BATCH_SIZE - 1) // BATCH_SIZE
    start_batch = _load_progress()

    if start_batch >= num_batches:
        print("[store_embeddings] All batches already completed per progress.json.")
        _clear_progress()
        return

    print(
        f"[store_embeddings] {total} chunks → {num_batches} batches of {BATCH_SIZE}. "
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

                # Persist progress immediately after success
                _save_progress(batch_num + 1)
                break  # move on to the next batch

            except Exception as e:
                # ── daily quota: hard stop ────────────────────────────────────
                if _is_daily_quota(e):
                    print(
                        f"\n[FATAL] Daily quota exhausted at batch {batch_num + 1}. "
                        f"Progress saved — run again tomorrow to resume.\n"
                        f"Error: {e}"
                    )
                    raise SystemExit(1)

                # ── 429 rate limit: wait and retry ────────────────────────────
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

                # ── any other error: fail fast ────────────────────────────────
                print(f"  [{batch_num + 1}/{num_batches}] Unexpected error: {e}")
                raise

        # Enforce 1 req/sec between batches (skip delay after the last batch)
        if batch_num < num_batches - 1:
            time.sleep(REQ_DELAY)

    _clear_progress()
    print(f"\n[store_embeddings] All {total} chunks stored successfully.")


# ── retrieval ─────────────────────────────────────────────────────────────────

retriever = vector_store.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 3},
)


def get_retriever():
    return retriever


# ── utility ───────────────────────────────────────────────────────────────────


def check_embeddings_exist() -> bool:
    """
    Check if embeddings already exist in the Pinecone index.
    Returns True if vectors are present, False otherwise.
    """
    try:
        index = get_pinecone_index()
        stats = index.describe_index_stats()
        total_vector_count = stats.get("total_vector_count", 0)

        if total_vector_count > 0:
            print(f"Found {total_vector_count} existing vectors in Pinecone index.")
            return True

        print("No vectors found in Pinecone index.")
        return False

    except Exception as e:
        print(f"Error checking embeddings: {e}")
        return False
