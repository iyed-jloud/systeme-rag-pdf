from functools import lru_cache

from config import EMBED_MODEL


@lru_cache(maxsize=1)
def get_embedding_model():
    from sentence_transformers import SentenceTransformer

    return SentenceTransformer(EMBED_MODEL)
