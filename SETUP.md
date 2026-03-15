# HRMS Lite — Quick Setup Guide

## Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL 8+ running locally

---

## Step 1 — Create the MySQL database

Open MySQL and run:
```sql
CREATE DATABASE hrms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## Step 2 — Configure the backend

```bash
cd backend
cp .env.example .env
```

Open `.env` and update this line with your MySQL password:
```
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/hrms_db
```

---

## Step 3 — Install backend dependencies & run migrations

```bash
cd backend
pip install -r requirements.txt
alembic upgrade head
```

---

## Step 4 — Start the backend

```bash
# Still inside /backend
uvicorn main:app --reload --port 8000
```

✅ API running at: http://localhost:8000  
✅ Interactive docs: http://localhost:8000/docs

---

## Step 5 — Start the frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

✅ App running at: http://localhost:5173

---

## In VS Code

1. Open the root `hrms-lite/` folder in VS Code
2. Install recommended extensions when prompted
3. Use **Terminal → Run Task → Start Full Stack** to launch both servers at once
4. Or press **F5** and select **"Full Stack (Backend + Frontend)"**

---

## Project structure

```
hrms-lite/
├── .vscode/               ← VS Code launch, tasks, settings
├── backend/
│   ├── main.py            ← FastAPI app entry point
│   ├── requirements.txt   ← Python dependencies
│   ├── .env.example       ← Copy to .env and set your DB password
│   ├── alembic.ini        ← Migration config
│   ├── alembic/           ← DB migrations (run: alembic upgrade head)
│   ├── core/              ← DB engine + app settings
│   ├── models/            ← SQLAlchemy ORM models
│   ├── schemas/           ← Pydantic request/response schemas
│   └── routers/           ← API route handlers
└── frontend/
    ├── package.json       ← npm dependencies
    ├── vite.config.ts     ← Dev server + /api proxy
    ├── .env.example       ← Copy to .env.local for production config
    └── src/
        ├── App.tsx
        ├── main.tsx
        ├── index.css
        ├── types/         ← TypeScript interfaces
        ├── services/      ← Axios API calls
        ├── components/    ← Reusable UI components
        └── pages/         ← Dashboard, Employees, Attendance
```
