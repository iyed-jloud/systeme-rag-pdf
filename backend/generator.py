import os
import json

import httpx
from fastapi import HTTPException

from config import GROQ_MODEL

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

def build_context(chunks: list[dict]) -> str:
    context_blocks = []
    for chunk in chunks:
        page = f", page {chunk['page']}" if chunk.get("page") else ""
        context_blocks.append(
            f"Source: {chunk.get('source', 'Unknown PDF')}{page}\n{chunk['text']}"
        )

    return "\n\n---\n\n".join(context_blocks)

def build_messages(question: str, chunks: list[dict], history: list[dict] | None = None) -> list[dict]:
    context = build_context(chunks)
    system_prompt = f"""You are a precise assistant. Answer ONLY using the context below.
When the answer uses evidence from a PDF, name the source file in the answer.
If sources disagree, explain the difference and cite each source file.
If the answer is not in the context, say "I couldn't find that in the uploaded PDFs."

CONTEXT:
{context}"""

    messages = [{"role": "system", "content": system_prompt}]

    for message in history or []:
        role = message.get("role")
        content = message.get("content")
        if role in {"user", "assistant"} and content:
            messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": question})
    return messages

async def generate(question: str, chunks: list[dict], history: list[dict] | None = None) -> str:
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
                    "messages": build_messages(question, chunks, history),
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

async def stream_generate(question: str, chunks: list[dict], history: list[dict] | None = None):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured.")

    async with httpx.AsyncClient(timeout=30) as client:
        try:
            async with client.stream(
                "POST",
                GROQ_URL,
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "model": GROQ_MODEL,
                    "messages": build_messages(question, chunks, history),
                    "temperature": 0.2,
                    "stream": True,
                },
            ) as response:
                if response.status_code >= 400:
                    data = await response.aread()
                    raise HTTPException(
                        status_code=502,
                        detail=f"Groq API error: {data.decode('utf-8', errors='replace')}",
                    )

                async for line in response.aiter_lines():
                    if not line.startswith("data: "):
                        continue

                    payload = line.removeprefix("data: ").strip()
                    if payload == "[DONE]":
                        break

                    try:
                        data = json.loads(payload)
                    except json.JSONDecodeError:
                        continue

                    delta = data["choices"][0].get("delta", {}).get("content")
                    if delta:
                        yield delta
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=502,
                detail=f"Could not reach Groq API: {exc}",
            ) from exc
