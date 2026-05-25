import fitz # PyMuPDF
import faiss , numpy as np , pickle , os
from sentence_transformers import SentenceTransformer
from config import CHUNK_SIZE , CHUNK_OVERLAP , EMBED_MODEL , VECTOR_STORE_PATH

model = SentenceTransformer(EMBED_MODEL)

def extract_chunks(pdf_bytes: bytes) -> list[str]:
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    full_text = "".join(page.get_text() for page in doc)
    chunks , i = [], 0
    while i < len(full_text):
        chunks.append(full_text[i : i+ CHUNK_SIZE])
        i += CHUNK_SIZE - CHUNK_OVERLAP
    return [c.strip() for c in chunks if len(c.strip()) > 50]

def ingest(pdf_bytes: bytes, doc_id: str) :
    chunks = extract_chunks(pdf_bytes)
    embeddings = model.encode(chunks, normalize_embeddings=True)
    index = faiss.IndexFlatIP(embeddings.shape[1])
    index.add(embeddings)
    os.makedirs(VECTOR_STORE_PATH, exist_ok=True)
    faiss.write_index(index, os.path.join(VECTOR_STORE_PATH, f"{doc_id}.index"))
    with open(f"{VECTOR_STORE_PATH}/{doc_id}_chunks.pkl", "wb") as f:
        pickle.dump(chunks, f)
    return len(chunks)