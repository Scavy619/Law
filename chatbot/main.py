#!/usr/bin/env python3
"""
LawBridge Legal Chatbot Main Application

This application provides a complete RAG (Retrieval Augmented Generation) system
for legal document querying using Indian Constitutional Law documents.
"""

import sys
from pathlib import Path

# MUST be set up before any src imports
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

import uvicorn
from api.chat import app


def setup_embeddings():
    """
    Setup embeddings - lazy import so sys.path is guaranteed to be set first.
    """
    try:
        # Imported here (not at top level) to ensure sys.path is ready
        from embeddings.create_embeddings import create_and_store_embeddings

        print("Setting up embeddings...")
        create_and_store_embeddings()
        print("Embeddings setup completed!")
    except Exception as e:
        print(f"Error setting up embeddings: {e}")
        return False
    return True


def start_api_server():
    """
    Start the FastAPI server.
    """
    print("Starting LawBridge Legal Chatbot API...")
    uvicorn.run(
        "api.chat:app",
        host="0.0.0.0",
        port=4000,
        reload=False,  # Set to True for development hot-reloading
    )


def main():
    """
    Main application entry point.

    Commands:
      python main.py setup   - Create & store embeddings only
      python main.py server  - Start API server only
      python main.py         - Create embeddings then start server
      python main.py help    - Show this help
    """
    print("=" * 50)
    print("LawBridge Legal Chatbot System")
    print("=" * 50)

    if len(sys.argv) > 1:
        command = sys.argv[1].lower()

        if command == "setup":
            setup_embeddings()

        elif command == "server":
            start_api_server()

        elif command == "help":
            print("Available commands:")
            print("  python main.py setup   - Create & store embeddings")
            print("  python main.py server  - Start API server only")
            print("  python main.py         - Create embeddings then start server")

        else:
            print(f"Unknown command: {command}")
            print("Use 'python main.py help' for available commands")

    else:
        # Default: create embeddings first, then start the server
        print("Starting complete setup...")
        if setup_embeddings():
            start_api_server()
        else:
            print("Failed to setup embeddings. Please check your configuration.")
            sys.exit(1)


if __name__ == "__main__":
    # Uncomment the line below to run setup + server together (first time setup)
    # main()

    # Once embeddings are already created, just start the server directly
    start_api_server()
