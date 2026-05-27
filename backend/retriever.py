import os
import pickle

import faiss
import numpy as np
from fastapi import HTTPException

from config import TOP_K, VECTOR_STORE_PATH
from embedding_model import get_embedding_model
from ingestor import chunk_search_text


def _normalize(value: str) -> str:
    return "".join(char.lower() for char in value if char.isalnum())


def _source_matches_query(chunk: dict, query: str) -> bool:
    source = chunk.get("source") or ""
    normalized_query = _normalize(query)
    normalized_source = _normalize(source)
    normalized_stem = _normalize(source.rsplit(".", 1)[0])
    return bool(normalized_source and normalized_source in normalized_query) or bool(
        normalized_stem and normalized_stem in normalized_query
    )


def retrieve(query: str, session_id: str) -> list[dict]:
    index_path = os.path.join(VECTOR_STORE_PATH, f"{session_id}.index")
    chunks_path = os.path.join(VECTOR_STORE_PATH, f"{session_id}_chunks.pkl")

    if not os.path.exists(index_path) or not os.path.exists(chunks_path):
        raise HTTPException(
            status_code=404,
            detail=f"No uploaded PDFs found for session_id '{session_id}'. Upload a PDF first.",
        )

    index = faiss.read_index(index_path)
    with open(chunks_path, "rb") as f:
        chunks = pickle.load(f)

    model = get_embedding_model()
    q_vec = model.encode([query], normalize_embeddings=True)
    search_k = min(len(chunks), max(TOP_K * 4, TOP_K))
    scores, indices = index.search(np.asarray(q_vec, dtype="float32"), search_k)

    results = []
    seen_indices = set()
    for rank, chunk_index in enumerate(indices[0]):
        if chunk_index < 0 or chunk_index >= len(chunks):
            continue

        seen_indices.add(int(chunk_index))
        chunk = chunks[chunk_index]
        if isinstance(chunk, str):
            chunk = {"text": chunk, "source": "Unknown PDF", "page": None}

        score = float(scores[0][rank])
        if _source_matches_query(chunk, query):
            score += 1.0

        results.append(
            {
                "text": chunk["text"],
                "source": chunk.get("source") or "Unknown PDF",
                "document_id": chunk.get("document_id"),
                "page": chunk.get("page"),
                "score": score,
            }
        )

    for chunk_index, chunk in enumerate(chunks):
        if chunk_index in seen_indices:
            continue
        if isinstance(chunk, str):
            chunk = {"text": chunk, "source": "Unknown PDF", "page": None}
        if not _source_matches_query(chunk, query):
            continue

        results.append(
            {
                "text": chunk["text"],
                "source": chunk.get("source") or "Unknown PDF",
                "document_id": chunk.get("document_id"),
                "page": chunk.get("page"),
                "score": 1.0,
            }
        )

    results.sort(key=lambda result: result["score"], reverse=True)
    return results[:TOP_K]
