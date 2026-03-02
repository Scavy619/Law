import os
from pathlib import Path

from langchain_community.document_loaders import PyPDFLoader

# Get absolute path to the data directory
current_dir = Path(__file__).parent
data_dir = current_dir.parent.parent / "data"


def load_pdf():
    """
    Loads all PDF files found in the data directory.
    Returns a combined list of documents from all PDFs.
    """
    all_documents = []

    pdf_files = sorted(data_dir.glob("*.pdf"))

    if not pdf_files:
        raise FileNotFoundError(f"No PDF files found in data directory: {data_dir}")

    for pdf_path in pdf_files:
        print(f"Loading: {pdf_path.name}")
        try:
            loader = PyPDFLoader(str(pdf_path))
            documents = loader.load()

            # Tag each document with its source filename for traceability
            for doc in documents:
                doc.metadata["source_file"] = pdf_path.name

            all_documents.extend(documents)
            print(f"  -> Loaded {len(documents)} pages from {pdf_path.name}")
        except Exception as e:
            print(f"  -> WARNING: Failed to load {pdf_path.name}: {e}")
            continue

    print(f"\nTotal pages loaded across all PDFs: {len(all_documents)}")
    return all_documents
