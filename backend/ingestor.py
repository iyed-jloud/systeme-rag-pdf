import os
import pickle

import faiss
import fitz
import numpy as np
from sentence_transformers import SentenceTransformer

from config import CHUNK_OVERLAP, CHUNK_SIZE, EMBED_MODEL, VECTOR_STORE_PATH

model = SentenceTransformer(EMBED_MODEL)


def _chunk_text(text: str) -> list[str]:
    chunks = []
    cursor = 0
    step = CHUNK_SIZE - CHUNK_OVERLAP

    while cursor < len(text):
        chunk = text[cursor : cursor + CHUNK_SIZE].strip()
        if len(chunk) > 50:
            chunks.append(chunk)
        cursor += step

    return chunks


def extract_chunks(pdf_bytes: bytes, source: str) -> list[dict]:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    chunks = []

    for page_index, page in enumerate(doc, start=1):
        for text in _chunk_text(page.get_text()):
            chunks.append({"text": text, "source": source, "page": page_index})

    return chunks


def _chunks_path(session_id: str) -> str:
    return os.path.join(VECTOR_STORE_PATH, f"{session_id}_chunks.pkl")


def _index_path(session_id: str) -> str:
    return os.path.join(VECTOR_STORE_PATH, f"{session_id}.index")


def _load_existing_chunks(session_id: str) -> list[dict]:
    chunks_path = _chunks_path(session_id)
    if not os.path.exists(chunks_path):
        return []

    with open(chunks_path, "rb") as f:
        chunks = pickle.load(f)

    # Keep old stores readable if a previous run pickled raw strings.
    return [
        chunk if isinstance(chunk, dict) else {"text": chunk, "source": "Unknown PDF", "page": None}
        for chunk in chunks
    ]


def ingest(pdf_bytes: bytes, session_id: str, filename: str) -> dict:
    new_chunks = extract_chunks(pdf_bytes, filename)
    if not new_chunks:
        return {"chunks_added": 0, "total_chunks": len(_load_existing_chunks(session_id))}

    os.makedirs(VECTOR_STORE_PATH, exist_ok=True)

    existing_chunks = _load_existing_chunks(session_id)
    all_chunks = [*existing_chunks, *new_chunks]
    embeddings = model.encode(
        [chunk["text"] for chunk in all_chunks],
        normalize_embeddings=True,
    )

    embeddings = np.asarray(embeddings, dtype="float32")
    index = faiss.IndexFlatIP(embeddings.shape[1])
    index.add(embeddings)

    faiss.write_index(index, _index_path(session_id))
    with open(_chunks_path(session_id), "wb") as f:
        pickle.dump(all_chunks, f)

    return {"chunks_added": len(new_chunks), "total_chunks": len(all_chunks)}
