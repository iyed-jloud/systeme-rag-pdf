# Intelligent PDF Assistant

## Made By : Iyed Douggaz 2DAD & Iyed Jloud 2EAN

An AI-powered RAG application for chatting with one or more PDF documents. Upload PDFs, ask questions in natural language, receive streamed answers, and inspect the exact source excerpts used by the assistant.

The app is built as a full-stack local development project with a React/Vite frontend and a FastAPI backend. It uses FAISS for vector search, Sentence Transformers for embeddings, PyMuPDF for PDF extraction, and Groq for LLM responses.

## Demo Media
<img width="1868" height="984" alt="image" src="https://github.com/user-attachments/assets/6921e440-1111-4760-b935-f3241ca33cbd" />
<img width="1868" height="984" alt="image" src="https://github.com/user-attachments/assets/d55645a5-313e-493e-9110-d7407ebc5e8b" />


## Features

- Multi-PDF upload in a single chat session.
- Up to 5 PDFs per session.
- Up to 200 MB per uploaded PDF.
- Source-aware retrieval that keeps track of filename and page number.
- File-specific questions such as "What does Syllabus.pdf say about the exam date?"
- Removable PDFs. Removing a PDF rebuilds the session index without that document.
- Conversational memory for follow-up questions.
- Streaming AI responses for a ChatGPT-style typing effect.
- References drawer showing retrieved source excerpts.
- Local vector storage with FAISS.
- Root-level dev commands so the app can be launched from the main folder.
- Clear frontend error message when the backend is not reachable.

## Tech Stack

Frontend:

- React
- Vite
- CSS modules/global CSS
- Fetch API with streamed response handling

Backend:

- FastAPI
- Uvicorn
- PyMuPDF
- Sentence Transformers
- FAISS
- Groq Chat Completions API
- Pydantic
- python-dotenv

AI/RAG:

- Embedding model: `all-MiniLM-L6-v2`
- LLM model: `llama-3.3-70b-versatile`
- Vector store: FAISS `IndexFlatIP`
- Chunk size: 500 characters
- Chunk overlap: 80 characters
- Top-K retrieval: 8 chunks

## Project Structure

```text
systeme-rag-pdf/
  backend/
    config.py              # App limits, model names, vector store path
    embedding_model.py     # Lazy SentenceTransformer loader
    generator.py           # Groq prompt building and streaming generation
    ingestor.py            # PDF extraction, chunking, indexing, deletion
    main.py                # FastAPI routes
    retriever.py           # FAISS retrieval and source-aware ranking
    requirements.txt
    vector_store/          # Local generated FAISS indexes and chunk metadata
  frontend/
    src/
      COMPONENTS/
        ChatWindow.jsx
        Dropzone.jsx
        SourcePanel.jsx
      api.js
      App.jsx
      App.css
    package.json
  package.json             # Root scripts
  start.bat                # Starts backend and frontend on Windows
  start.sh                 # Starts backend and frontend on Unix-like shells
```

## How It Works

1. The frontend creates a unique `session_id` when the user opens the app.
2. Each uploaded PDF is sent to `POST /upload` with the active `session_id`.
3. The backend extracts page text with PyMuPDF.
4. Text is split into overlapping chunks.
5. Each chunk is stored with metadata:

```json
{
  "text": "chunk text...",
  "source": "Syllabus.pdf",
  "page": 3,
  "document_id": "..."
}
```

6. FAISS stores embeddings for source-aware chunk text, including filename and page metadata.
7. User questions are embedded and searched against the session's index.
8. Retrieved chunks are sent to Groq with recent chat history.
9. The backend streams answer tokens back to the frontend.
10. References are shown in a drawer when the user chooses to inspect them.

## Requirements

- Python 3.10+
- Node.js 18+
- npm
- A Groq API key

## Environment Variables

Create `backend/.env`:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Optional frontend override:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

If not set, the frontend defaults to `http://127.0.0.1:8000`.

## Installation

From the project root:

```bash
python -m venv .venv
```

On Windows:

```bash
.\.venv\Scripts\activate
pip install -r backend\requirements.txt
npm --prefix frontend install
```

On macOS/Linux:

```bash
source .venv/bin/activate
pip install -r backend/requirements.txt
npm --prefix frontend install
```

The first upload or query may take longer because the embedding model needs to load.

## Running The App

From the project root on Windows:

```bash
npm run dev
```

This starts:

- Backend: `http://127.0.0.1:8000`
- Frontend: `http://localhost:5173`

Run only the frontend:

```bash
npm run dev:frontend
```

Run only the backend:

```bash
npm run dev:backend
```

If uploads show "Backend is not reachable", make sure the backend is running on port `8000`.

## Usage

1. Open `http://localhost:5173`.
2. Upload one or more PDFs.
3. Ask a question about the uploaded documents.
4. Ask follow-up questions naturally.
5. Click `View references` to inspect retrieved excerpts.
6. Remove any PDF with the `x` button on its file chip.

Example questions:

- "Summarize the main points across all uploaded PDFs."
- "What does Syllabus.pdf say about the final exam?"
- "Compare the deadline in Schedule.pdf with the policy in Handbook.pdf."
- "Who is the author?"
- "Where does he live?"

## API Reference

### `GET /health`

Returns backend status and configured Groq model.

Response:

```json
{
  "status": "ok",
  "model": "llama-3.3-70b-versatile"
}
```

### `POST /upload`

Uploads one PDF into a session.

Form data:

- `session_id`: UUID string
- `file`: PDF file

Limits:

- Maximum 5 PDFs per session
- Maximum 200 MB per PDF
- PDF files only

Response:

```json
{
  "session_id": "...",
  "document_id": "...",
  "filename": "Syllabus.pdf",
  "chunks": 42,
  "total_chunks": 97
}
```

### `DELETE /sessions/{session_id}/documents/{document_id}`

Removes a PDF from a session and rebuilds the FAISS index.

Response:

```json
{
  "session_id": "...",
  "document_id": "...",
  "removed_chunks": 42,
  "total_chunks": 55,
  "documents": []
}
```

### `POST /query`

Non-streaming question endpoint.

Request:

```json
{
  "session_id": "...",
  "question": "What does Syllabus.pdf say about exams?",
  "history": [
    { "role": "user", "content": "Who is the author?" },
    { "role": "assistant", "content": "The author is ..." }
  ]
}
```

Response:

```json
{
  "answer": "According to Syllabus.pdf...",
  "sources": [
    {
      "text": "...",
      "source": "Syllabus.pdf",
      "document_id": "...",
      "page": 3,
      "score": 1.82
    }
  ]
}
```

### `POST /query/stream`

Streaming question endpoint used by the frontend.

Request body is the same as `/query`.

Response format: newline-delimited JSON.

Example events:

```json
{"type":"sources","sources":[...]}
{"type":"delta","content":"According"}
{"type":"delta","content":" to"}
{"type":"done"}
```

## Development Commands

Build frontend:

```bash
npm run build
```

Lint frontend:

```bash
npm run lint
```

Compile-check backend:

```bash
.\.venv\Scripts\python -m compileall backend
```

On macOS/Linux:

```bash
.venv/bin/python -m compileall backend
```

## Current Limits

These are configured in `backend/config.py`:

```python
MAX_PDFS_PER_SESSION = 5
MAX_UPLOAD_BYTES = 200 * 1024 * 1024
TOP_K = 8
CHUNK_SIZE = 500
CHUNK_OVERLAP = 80
```

## Troubleshooting

### Upload says "Failed to fetch" or backend is not reachable

The frontend cannot reach FastAPI.

Fix:

```bash
npm run dev:backend
```

Then test:

```bash
curl http://127.0.0.1:8000/health
```

### First upload is slow

The embedding model loads on first use. This is expected.

### The assistant cannot answer from a newly uploaded PDF

Restart the backend, refresh the frontend, and upload the PDFs into a fresh session. New uploads use source-aware indexing.

### Groq errors

Check that `backend/.env` contains a valid `GROQ_API_KEY`.

### Port already in use

Stop the old backend process or change the Uvicorn port in the root scripts.

## Roadmap

- Add persistent named chat sessions.
- Add drag-and-drop multi-file upload.
- Add per-document summaries.
- Add source filters.
- Add PDF page previews.
- Add authentication.
- Add production deployment configuration.

## License

This project is open-source and available under the MIT License.
