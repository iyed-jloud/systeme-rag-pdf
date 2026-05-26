import os
import pickle

import faiss
import numpy as np
from fastapi import HTTPException
from sentence_transformers import SentenceTransformer

from config import EMBED_MODEL, TOP_K, VECTOR_STORE_PATH

model = SentenceTransformer(EMBED_MODEL)


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

    q_vec = model.encode([query], normalize_embeddings=True)
    scores, indices = index.search(np.asarray(q_vec, dtype="float32"), TOP_K)

    results = []
    for rank, chunk_index in enumerate(indices[0]):
        if chunk_index < 0 or chunk_index >= len(chunks):
            continue

        chunk = chunks[chunk_index]
        if isinstance(chunk, str):
            chunk = {"text": chunk, "source": "Unknown PDF", "page": None}

        results.append(
            {
                "text": chunk["text"],
                "source": chunk.get("source") or "Unknown PDF",
                "page": chunk.get("page"),
                "score": float(scores[0][rank]),
            }
        )

    return results
