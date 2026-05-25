import os
import pickle

import faiss
import numpy as np
from fastapi import HTTPException
from sentence_transformers import SentenceTransformer
from config import EMBED_MODEL, TOP_K , VECTOR_STORE_PATH

model = SentenceTransformer(EMBED_MODEL)

def retrieve(query: str, doc_id: str) -> list[dict]:
    index_path = os.path.join(VECTOR_STORE_PATH, f"{doc_id}.index")
    chunks_path = os.path.join(VECTOR_STORE_PATH, f"{doc_id}_chunks.pkl")

    if not os.path.exists(index_path) or not os.path.exists(chunks_path):
        raise HTTPException(
            status_code=404,
            detail=f"No uploaded document found for doc_id '{doc_id}'. Upload the PDF again or use /documents.",
        )

    index = faiss.read_index(index_path)
    with open(chunks_path, "rb") as f:
        chunks = pickle.load(f)
    q_vec = model.encode([query], normalize_embeddings=True)
    scores,indices = index.search(np.array(q_vec), TOP_K)
    return [
         {"text": chunks[i], "score": float(scores[0][j])}
        for j, i in enumerate(indices[0]) if i < len(chunks)
    ]
