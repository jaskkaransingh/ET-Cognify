from typing import List

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 100) -> List[str]:
    """
    Splits the text into smaller chunks for embeddings.
    """
    if not text:
        return []

    words = text.split()
    chunks = []
    
    # Very basic word-level chunking
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i : i + chunk_size])
        chunks.append(chunk)

    return chunks
