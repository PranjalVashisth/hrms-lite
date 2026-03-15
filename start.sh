#!/bin/bash
echo "========================================="
echo "  HRMS Lite — Startup Script"
echo "========================================="

# Backend
echo ""
echo "▶ Starting backend..."
cd backend

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "  Created .env from .env.example"
  echo "  ⚠  Edit backend/.env and set your DATABASE_URL before continuing"
  exit 1
fi

pip install -r requirements.txt -q
alembic upgrade head
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
echo "  Backend running at http://localhost:8000  (PID $BACKEND_PID)"
echo "  API docs at      http://localhost:8000/docs"

# Frontend
echo ""
echo "▶ Starting frontend..."
cd ../frontend
npm install --silent
npm run dev &
FRONTEND_PID=$!
echo "  Frontend running at http://localhost:5173  (PID $FRONTEND_PID)"

echo ""
echo "Press Ctrl+C to stop both servers"
wait
