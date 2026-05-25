import os ,httpx
from config import GROQ_MODEL

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

def build_prompt(question: str, chunks: list[dict]) -> str:
    context = "\n\n---\n\n".join(c["text"] for c in chunks)
    return f"""You are a precise assistant. Answer ONLY using the context below.
If the answer is not in the context, say "I couldn't find that in the document."

CONTEXT:
{context}

QUESTION: {question}
ANSWER:"""

async def generate(question: str, chunks: list[dict]) -> str:
    async with httpx.AsyncClient() as client:
        r = await client.post(
            GROQ_URL,
            headers={"Authorization": f"Bearer {os.getenv('GROQ_API_KEY')}"},
            json={"model": GROQ_MODEL, "messages": [
                {"role": "user", "content": build_prompt(question, chunks)}
            ], "temperature": 0.2},
            timeout=30
        )
    return r.json()["choices"][0]["message"]["content"]