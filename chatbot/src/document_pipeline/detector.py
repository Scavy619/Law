from pathlib import Path


# Supported file types

SUPPORTED_EXTENSIONS = {
    ".pdf":  "pdf",
    ".txt":  "txt",
    ".docx": "docx",
    ".jpg":  "image",
    ".jpeg": "image",
    ".png":  "image",
    ".webp": "image",
}


class UnsupportedFileTypeError(Exception):
    """Raised when the file extension is not supported."""
    pass


# File type detector

def detect_file_type(filename: str) -> str:
    """
    Detects file type from filename extension.

    Args:
        filename: Original filename (e.g. "contract.pdf")

    Returns:
        One of: "pdf", "txt", "docx", "image"

    Raises:
        UnsupportedFileTypeError if extension is not supported
    """
    ext = Path(filename).suffix.lower()
    file_type = SUPPORTED_EXTENSIONS.get(ext)

    if not file_type:
        supported = ", ".join(sorted(SUPPORTED_EXTENSIONS.keys()))
        raise UnsupportedFileTypeError(
            f"'{ext}' supported nahi hai. Supported formats: {supported}"
        )

    return file_type
    
    