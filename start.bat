@echo off
echo Starting RAG PDF Assistant...

start "Backend" cmd /k "cd backend && call ..\.venv\Scripts\activate && uvicorn main:app --reload --port 8000"

timeout /t 3 >nul

start "Frontend" cmd /k "npm run dev"

echo Both servers started.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
