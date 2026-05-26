from functools import lru_cache

from sentence_transformers import SentenceTransformer

from config import EMBED_MODEL


@lru_cache(maxsize=1)
def get_embedding_model() -> SentenceTransformer:
    return SentenceTransformer(EMBED_MODEL)
