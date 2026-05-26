from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import uuid

import os
from config import GROQ_MODEL, MAX_PDFS_PER_SESSION, MAX_UPLOAD_BYTES, VECTOR_STORE_PATH
from ingestor import ingest, list_session_documents, remove_document
from retriever import retrieve
from generator import generate

load_dotenv()
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class QueryRequest(BaseModel):
    question : str
    session_id: str

def validate_session_id(session_id: str) -> None:
    try:
        uuid.UUID(session_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="Invalid session_id.") from exc

async def read_limited_upload(file: UploadFile) -> bytes:
    content_parts = []
    total_size = 0
    chunk_size = 1024 * 1024

    while True:
        chunk = await file.read(chunk_size)
        if not chunk:
            break

        total_size += len(chunk)
        if total_size > MAX_UPLOAD_BYTES:
            raise HTTPException(
                status_code=413,
                detail="PDF is too large. Maximum upload size is 200 MB.",
            )

        content_parts.append(chunk)

    return b"".join(content_parts)

@app.post("/upload")
async def upload_pdf(session_id: str = Form(...), file: UploadFile = File(...)):
    validate_session_id(session_id)

    if file.content_type != "application/pdf":
        raise HTTPException(status_code=415, detail="Only PDF uploads are supported.")

    documents = list_session_documents(session_id)
    if len(documents) >= MAX_PDFS_PER_SESSION:
        raise HTTPException(
            status_code=413,
            detail=f"Upload limit reached. A session can contain at most {MAX_PDFS_PER_SESSION} PDFs.",
        )

    content = await read_limited_upload(file)
    document_id = str(uuid.uuid4())
    result = ingest(content, session_id, file.filename or "uploaded.pdf", document_id)
    return {
        "session_id": session_id,
        "document_id": document_id,
        "filename": file.filename,
        "chunks": result["chunks_added"],
        "total_chunks": result["total_chunks"],
    }

@app.delete("/sessions/{session_id}/documents/{document_id}")
async def delete_pdf(session_id: str, document_id: str):
    validate_session_id(session_id)
    result = remove_document(session_id, document_id)
    if not result["removed"]:
        raise HTTPException(status_code=404, detail="PDF not found in this session.")

    return {
        "session_id": session_id,
        "document_id": document_id,
        "removed_chunks": result["removed_chunks"],
        "total_chunks": result["total_chunks"],
        "documents": list_session_documents(session_id),
    }

@app.post("/query")
async def query(req : QueryRequest):
    validate_session_id(req.session_id)

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
