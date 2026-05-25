import faiss , numpy as np, pickle
from sentence_transformers import SentenceTransformer
from config import EMBED_MODEL, TOP_K , VECTOR_STORE_PATH

model = SentenceTransformer(EMBED_MODEL)

def retrieve(query: str, doc_id: str) -> list[dict]:
    index = faiss.read_index(f"{VECTOR_STORE_PATH}/{doc_id}.index")
    with open(f"{VECTOR_STORE_PATH}/{doc_id}_chunks.pkl", "rb") as f:
        chunks = pickle.load(f)
    q_vec = model.encode([query], normalize_embeddings=True)
    scores,indices = index.search(np.array(q_vec), TOP_K)
    return [
         {"text": chunks[i], "score": float(scores[0][j])}
        for j, i in enumerate(indices[0]) if i < len(chunks)
    ]