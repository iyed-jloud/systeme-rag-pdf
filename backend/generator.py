import os

import httpx
from fastapi import HTTPException

from config import GROQ_MODEL

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

def build_prompt(question: str, chunks: list[dict]) -> str:
    context_blocks = []
    for chunk in chunks:
        page = f", page {chunk['page']}" if chunk.get("page") else ""
        context_blocks.append(
            f"Source: {chunk.get('source', 'Unknown PDF')}{page}\n{chunk['text']}"
        )

    context = "\n\n---\n\n".join(context_blocks)
    return f"""You are a precise assistant. Answer ONLY using the context below.
When the answer uses evidence from a PDF, name the source file in the answer.
If sources disagree, explain the difference and cite each source file.
If the answer is not in the context, say "I couldn't find that in the uploaded PDFs."

CONTEXT:
{context}

QUESTION: {question}
ANSWER:"""

async def generate(question: str, chunks: list[dict]) -> str:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured.")

    async with httpx.AsyncClient() as client:
        try:
            r = await client.post(
                GROQ_URL,
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "model": GROQ_MODEL,
                    "messages": [
                        {"role": "user", "content": build_prompt(question, chunks)}
                    ],
                    "temperature": 0.2,
                },
                timeout=30,
            )
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=502,
                detail=f"Could not reach Groq API: {exc}",
            ) from exc

    try:
        data = r.json()
    except ValueError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Groq API returned a non-JSON response with status {r.status_code}.",
        ) from exc

    if r.status_code >= 400:
        error = data.get("error", {})
        message = error.get("message") or data
        raise HTTPException(status_code=502, detail=f"Groq API error: {message}")

    try:
        return data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Unexpected Groq API response: {data}",
        ) from exc
