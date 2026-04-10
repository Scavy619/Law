# src/document_pipeline/extractors/pdf_extractor.py

import io
import base64
import fitz  # pymupdf
from pdf2image import convert_from_bytes
from langchain_core.messages import HumanMessage

import sys
from pathlib import Path
src_path = Path(__file__).parent.parent.parent
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

from config.genai_initialize import get_llm

# Agar extracted text is se kam ho toh scanned PDF maano
SCANNED_TEXT_THRESHOLD = 50


def _extract_with_pymupdf(file_bytes: bytes) -> str:
    """pymupdf se direct text extract karo."""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    full_text = []

    for page in doc:
        text = page.get_text().strip()
        if text:
            full_text.append(text)

    doc.close()
    return "\n\n".join(full_text)


def _extract_with_gemini_vision(file_bytes: bytes) -> str:
    """
    Scanned PDF ke liye:
    pdf2image se pages ko images mein convert karo,
    phir Gemini Vision se text extract karo.
    """
    llm = get_llm()

    # PDF ke pages ko PIL images mein convert karo
    images = convert_from_bytes(file_bytes, dpi=200)

    full_text = []

    for i, image in enumerate(images):
        print(f"  [Gemini Vision] Page {i + 1}/{len(images)} extract ho raha hai...")

        # PIL image ko bytes mein convert karo
        img_buffer = io.BytesIO()
        image.save(img_buffer, format="JPEG")
        img_bytes = img_buffer.getvalue()
        img_base64 = base64.b64encode(img_bytes).decode("utf-8")

        message = HumanMessage(content=[
            {
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{img_base64}"},
            },
            {
                "type": "text",
                "text": (
                    "Extract all the text from this document page exactly as it appears. "
                    "Preserve structure, headings, and paragraphs. "
                    "Return only the extracted text, nothing else."
                ),
            },
        ])

        response = llm.invoke([message])
        page_text = response.content.strip()
        if page_text:
            full_text.append(page_text)

    if not full_text:
        raise ValueError("Scanned PDF se bhi text extract nahi ho saka.")

    return "\n\n".join(full_text)


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    PDF se text extract karo.
    Pehle pymupdf try karo, agar text nahi mila toh Gemini Vision use karo.

    Args:
        file_bytes: Raw bytes of the uploaded .pdf file

    Returns:
        Extracted text as string

    Raises:
        ValueError if text extraction fails completely
    """
    # Pehle normal text extraction try karo
    text = _extract_with_pymupdf(file_bytes)

    if len(text.strip()) >= SCANNED_TEXT_THRESHOLD:
        print("  [PDF Extractor] Text-based PDF detected, pymupdf se extract kiya.")
        return text

    # Text nahi mila — scanned PDF hai, Gemini Vision use karo
    print("  [PDF Extractor] Scanned PDF detected, Gemini Vision use ho raha hai...")
    return _extract_with_gemini_vision(file_bytes)