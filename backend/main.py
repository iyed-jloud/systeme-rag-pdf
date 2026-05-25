from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import uuid

from ingestor import ingest
from retriever import retrieve
from generator import generate

load_dotenv()
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class Queryrequest(BaseModel):
    question : str
    doc_id: str

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    doc_id = str(uuid.uuid4())
    content = await file.read()
    n_chunks = ingest(content, doc_id)
    return {"doc_id": doc_id, "chunks": n_chunks, "filename": file.filename }

@app.post("/query")
async def query(req : Queryrequest):
    chunks = retrieve(req.question, req.doc_id)
    answer = generate(req.question, chunks)
    return {"answer": answer, "sources": chunks}