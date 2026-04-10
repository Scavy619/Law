import io
import base64
from langchain_core.messages import HumanMessage

import sys
from pathlib import Path
src_path = Path(__file__).parent.parent.parent
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

from config.genai_initialize import get_llm


def extract_text_from_image(file_bytes: bytes) -> str:
    """
    Image se text extract karo using Gemini Vision.

    Args:
        file_bytes: Raw bytes of the uploaded image (.jpg, .jpeg, .png, .webp)

    Returns:
        Extracted text as string

    Raises:
        ValueError if no text found in image
    """
    llm = get_llm()

    img_base64 = base64.b64encode(file_bytes).decode("utf-8")

    message = HumanMessage(content=[
        {
            "type": "image_url",
            "image_url": {"url": f"data:image/jpeg;base64,{img_base64}"},
        },
        {
            "type": "text",
            "text": (
                "Extract all the text from this image exactly as it appears. "
                "Preserve structure, headings, and paragraphs. "
                "Return only the extracted text, nothing else."
            ),
        },
    ])

    response = llm.invoke([message])
    text = response.content.strip()

    if not text:
        raise ValueError("Image mein koi text nahi mila.")

    return text
    