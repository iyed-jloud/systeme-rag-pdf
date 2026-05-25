from fastapi import FastAPI, HTTPException, UploadFile, File
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
    doc_id: str

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    doc_id = str(uuid.uuid4())
    content = await file.read()
    n_chunks = ingest(content, doc_id)
    return {"doc_id": doc_id, "chunks": n_chunks, "filename": file.filename }

@app.post("/query")
async def query(req : QueryRequest):
    try:
        uuid.UUID(req.doc_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail="Invalid doc_id. Use the doc_id returned by /upload, not the question text.",
        ) from exc

    chunks = retrieve(req.question, req.doc_id)
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
