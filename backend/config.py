from pathlib import Path

CHUNK_SIZE = 500          # characters per chunk
CHUNK_OVERLAP = 80        # overlap between consecutive chunks
TOP_K = 8                 # chunks to retrieve per query
EMBED_MODEL = "all-MiniLM-L6-v2"
GROQ_MODEL = "llama-3.3-70b-versatile"
VECTOR_STORE_PATH = str(Path(__file__).resolve().parent / "vector_store")
MAX_PDFS_PER_SESSION = 5
MAX_UPLOAD_BYTES = 200 * 1024 * 1024
