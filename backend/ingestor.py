import os
import pickle

import faiss
import fitz
import numpy as np

from config import CHUNK_OVERLAP, CHUNK_SIZE, VECTOR_STORE_PATH
from embedding_model import get_embedding_model


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


def extract_chunks(pdf_bytes: bytes, source: str, document_id: str) -> list[dict]:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    chunks = []

    for page_index, page in enumerate(doc, start=1):
        for text in _chunk_text(page.get_text()):
            chunks.append(
                {
                    "text": text,
                    "source": source,
                    "page": page_index,
                    "document_id": document_id,
                }
            )

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
        chunk if isinstance(chunk, dict) else {"text": chunk, "source": "Unknown PDF", "page": None, "document_id": None}
        for chunk in chunks
    ]


def list_session_documents(session_id: str) -> list[dict]:
    documents = {}

    for chunk in _load_existing_chunks(session_id):
        document_id = chunk.get("document_id") or chunk.get("source") or "legacy-document"
        document = documents.setdefault(
            document_id,
            {
                "document_id": document_id,
                "filename": chunk.get("source") or "Unknown PDF",
                "chunks": 0,
            },
        )
        document["chunks"] += 1

    return list(documents.values())


def _write_store(session_id: str, chunks: list[dict]) -> None:
    os.makedirs(VECTOR_STORE_PATH, exist_ok=True)

    if not chunks:
        for path in (_index_path(session_id), _chunks_path(session_id)):
            if os.path.exists(path):
                os.remove(path)
        return

    model = get_embedding_model()
    embeddings = model.encode(
        [chunk["text"] for chunk in chunks],
        normalize_embeddings=True,
    )

    embeddings = np.asarray(embeddings, dtype="float32")
    index = faiss.IndexFlatIP(embeddings.shape[1])
    index.add(embeddings)

    faiss.write_index(index, _index_path(session_id))
    with open(_chunks_path(session_id), "wb") as f:
        pickle.dump(chunks, f)


def ingest(pdf_bytes: bytes, session_id: str, filename: str, document_id: str) -> dict:
    new_chunks = extract_chunks(pdf_bytes, filename, document_id)
    if not new_chunks:
        return {"chunks_added": 0, "total_chunks": len(_load_existing_chunks(session_id))}

    existing_chunks = _load_existing_chunks(session_id)
    all_chunks = [*existing_chunks, *new_chunks]
    _write_store(session_id, all_chunks)

    return {"chunks_added": len(new_chunks), "total_chunks": len(all_chunks)}


def remove_document(session_id: str, document_id: str) -> dict:
    existing_chunks = _load_existing_chunks(session_id)
    remaining_chunks = [
        chunk for chunk in existing_chunks if (chunk.get("document_id") or chunk.get("source")) != document_id
    ]

    removed_chunks = len(existing_chunks) - len(remaining_chunks)
    if removed_chunks == 0:
        return {"removed": False, "removed_chunks": 0, "total_chunks": len(existing_chunks)}

    _write_store(session_id, remaining_chunks)
    return {"removed": True, "removed_chunks": removed_chunks, "total_chunks": len(remaining_chunks)}
