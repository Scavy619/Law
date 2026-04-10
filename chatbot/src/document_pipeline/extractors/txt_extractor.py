def extract_text_from_txt(file_bytes: bytes) -> str:
    """
    Extracts text from a .txt file.
    Args:
        file_bytes: Raw bytes of the uploaded .txt file
    Returns:
        Extracted text as string
    Raises:
        ValueError if file is empty or unreadable
    """
    try:
        text = file_bytes.decode("utf-8")
    except UnicodeDecodeError:
        # Fallback for files with different encoding
        text = file_bytes.decode("latin-1")

    text = text.strip()

    if not text:
        raise ValueError("TXT file is either empty or unreadable.")

    return text