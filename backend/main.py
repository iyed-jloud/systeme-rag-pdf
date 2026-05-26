from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import uuid

import os
from config import GROQ_MODEL, VECTOR_STORE_PATH
from ingestor import ingest
from retriever import retrieve
from generator import generate

load_dotenv()
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class QueryRequest(BaseModel):
    question : str
    session_id: str

@app.post("/upload")
async def upload_pdf(session_id: str = Form(...), file: UploadFile = File(...)):
    try:
        uuid.UUID(session_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="Invalid session_id.") from exc

    content = await file.read()
    result = ingest(content, session_id, file.filename or "uploaded.pdf")
    return {
        "session_id": session_id,
        "filename": file.filename,
        "chunks": result["chunks_added"],
        "total_chunks": result["total_chunks"],
    }

@app.post("/query")
async def query(req : QueryRequest):
    try:
        uuid.UUID(req.session_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail="Invalid session_id. Use the session_id created by the frontend.",
        ) from exc

    chunks = retrieve(req.question, req.session_id)
    answer = await generate(req.question, chunks)
    return {"answer": answer, "sources": chunks}

@app.get("/documents")
def list_documents():
    if not os.path.exists(VECTOR_STORE_PATH):
        return {"documents": []}
    docs = [
        f.replace(".index", "")
        for f in os.listdir(VECTOR_STORE_PATH)
        if f.endswith(".index")
    ]
    return {"documents": docs}

@app.get("/health")
def health():
    return {"status": "ok", "model": GROQ_MODEL}
