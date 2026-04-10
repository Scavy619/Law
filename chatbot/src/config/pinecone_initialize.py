import sys
import time
from pathlib import Path

from pinecone import Pinecone, ServerlessSpec

# Ensure we can import from src directory
src_path = Path(__file__).parent.parent
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

from config.env import PINECONE_API_KEY, PINECONE_INDEX


# ── Namespace Constants
# Pinecone namespaces are auto-created on first upsert — no manual setup needed.
# Always reference these constants instead of hardcoding namespace strings.

NAMESPACE_KNOWLEDGE_BASE = "__default__"
# Existing books/PDFs (e.g., Mp-Jain Constitutional Law)
# Queried for general legal Q&A

NAMESPACE_USER_UPLOADS = "user-uploads-{user_id}"
# Per-user uploaded documents
# Use: get_user_namespace(user_id) helper below
# Queried only for that specific user's context


def get_user_namespace(user_id: str) -> str:
    """
    Returns the Pinecone namespace string for a specific user's uploads.
    Usage:
        ns = get_user_namespace("abc123")
        # → "user-uploads-abc123"
    """
    if not user_id or not user_id.strip():
        raise ValueError("user_id cannot be empty")
    return f"user-uploads-{user_id.strip()}"


def get_pinecone_index():
    # 1. Init client
    pc = Pinecone(api_key=PINECONE_API_KEY)

    # do this only when index does not exist, commented out for now coz i have created the index already
    # # 2. Check existing indexes
    # existing_indexes = [index.name for index in pc.list_indexes()]

    # # 3. Create if needed
    # if PINECONE_INDEX not in existing_indexes:
    #     pc.create_index(
    #         name=PINECONE_INDEX,
    #         dimension=3072,  # Google gemini-embedding-001 dimension
    #         metric="cosine",
    #         spec=ServerlessSpec(
    #             cloud="aws",
    #             region="us-east-1"
    #         )
    #     )
    #     print(f"Created index: {PINECONE_INDEX}")
    # else:
    #     print(f"Index {PINECONE_INDEX} already exists!")

    # 4. Return connected index
    return pc.Index(PINECONE_INDEX)


def get_namespace_stats() -> dict:
    """
    Returns per-namespace vector counts from Pinecone index stats.
    Useful for debugging — see which namespaces exist and how many vectors each has.

    Returns:
        {
            "__default__": {"vector_count": 1200},
            "user-uploads-abc123": {"vector_count": 45},
            ...
        }
    """
    index = get_pinecone_index()
    stats = index.describe_index_stats()
    return stats.get("namespaces", {})
    
    
    