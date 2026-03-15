# HRMS Lite

A full-stack Human Resource Management System built with **React + JavaScript**, **FastAPI**, and **MySQL**.

---

## Live Demo

| Service  | URL |
|----------|-----|
| Frontend | [*(Project Url)*](https://cerulean-chimera-3eb13d.netlify.app) |

---

## Tech Stack

| Layer      | Technology |
|------------|-----------|
| Frontend   | React 18, JavaScript, Vite, React Router v6, Axios, react-hot-toast, lucide-react, date-fns |
| Backend    | Python 3.12, FastAPI, SQLAlchemy 2.0, Pydantic v2, Alembic |
| Database   | MySQL 8+ (via PyMySQL driver) |
| Deployment | Vercel (frontend) · Render (backend) · PlanetScale / Railway MySQL (DB) |

---

## Project Structure

```
hrms-lite/
├── backend/
│   ├── main.py                  # FastAPI app, CORS, startup
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── .env.example
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/            # Migration scripts (auto-generated)
│   ├── core/
│   │   ├── config.py            # Pydantic settings (reads .env)
│   │   └── database.py          # SQLAlchemy engine + session
│   ├── models/
│   │   └── models.py            # ORM models: Employee, Attendance
│   ├── schemas/
│   │   └── schemas.py           # Pydantic request/response schemas
│   └── routers/
│       ├── employees.py         # CRUD endpoints for employees
│       ├── attendance.py        # Mark / list / summary endpoints
│       └── dashboard.py         # Aggregated stats endpoint
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js           # Dev proxy: /api → localhost:8000
    ├── vercel.json
    ├── netlify.toml
    ├── .env.example
    └── src/
        ├── main.jsx             # Entry point
        ├── App.jsx              # Routes
        ├── index.css            # Global design system CSS
        ├── services/
        │   └── api.js           # Axios API layer
        ├── components/
        │   ├── Layout.jsx       # Sidebar + topbar shell
        │   ├── Avatar.jsx       # Dept-colored avatar
        │   ├── Badges.jsx       # Status and dept badges
        │   ├── Modal.jsx        # Reusable modal wrapper
        │   └── Skeleton.jsx     # Loading skeleton components
        └── pages/
            ├── Dashboard.jsx    # Stats + dept chart + recent activity
            ├── Employees.jsx    # Employee list + add/delete modals
            └── Attendance.jsx   # Mark form + filtered records table
```

---

## Running Locally

### Prerequisites

- Python 3.10+
- Node.js 18+
- MySQL 8+ running locally (or a cloud MySQL instance)

---

### 1 · Set up the database

```sql
CREATE DATABASE hrms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

### 2 · Start the backend

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate       # Mac/Linux
venv\Scripts\activate          # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and set your MySQL password:
# DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/hrms_db

# Run database migrations (creates tables)
PYTHONPATH=/path/to/backend alembic upgrade head

# Start the dev server
PYTHONPATH=/path/to/backend uvicorn main:app --reload --port 8000
```

API live at **http://localhost:8000**
Interactive docs at **http://localhost:8000/docs**

---

### 3 · Start the frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (proxies /api → localhost:8000 automatically)
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## API Reference

### Employees

| Method   | Endpoint              | Description                      |
|----------|-----------------------|----------------------------------|
| `GET`    | `/api/employees`      | List all employees with stats    |
| `POST`   | `/api/employees`      | Create employee (201)            |
| `GET`    | `/api/employees/{id}` | Get single employee              |
| `DELETE` | `/api/employees/{id}` | Delete employee + all attendance |

**POST /api/employees** — Create employee
**GET /api/employees** — List all employees
**GET /api/attendance** — List attendance records
**POST /api/attendance** — Mark attendance

```json
{
  "employee_id": "EMP001",
  "full_name":   "Alice Johnson",
  "email":       "alice@company.com",
  "department":  "Engineering"
}
```

### Attendance

| Method | Endpoint                       | Description                            |
|--------|--------------------------------|----------------------------------------|
| `GET`  | `/api/attendance`              | List records — `?employee_id=&date=`   |
| `POST` | `/api/attendance`              | Mark / upsert attendance               |
| `GET`  | `/api/attendance/{id}/summary` | Present/absent totals for one employee |

```json
{
  "employee_id": "EMP001",
  "date":        "2025-06-01",
  "status":      "Present"
}
```

> Re-marking attendance for the same employee + date **updates** it (upsert — returns 200).
> New records return 201.

### Dashboard

| Method | Endpoint         | Description                      |
|--------|------------------|----------------------------------|
| `GET`  | `/api/dashboard` | Totals, dept breakdown, recent 8 |

---

## Deployment

### Backend → Render

1. Push to GitHub.
2. New Web Service on [render.com](https://render.com):
   - **Root directory:** `backend`
   - **Build command:** `pip install -r requirements.txt && alembic upgrade head`
   - **Start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Add environment variables:
   ```
   DATABASE_URL    = mysql+pymysql://user:pass@host:3306/hrms_db
   ALLOWED_ORIGINS = https://your-frontend.vercel.app
   APP_ENV         = production
   ```

### MySQL → PlanetScale / Railway

- **PlanetScale** (free tier): create a database, copy the connection string.
- **Railway MySQL**: provision MySQL service, use the internal connection string.

### Frontend → Vercel

1. Import the repo on [vercel.com](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Add environment variable:
   ```
   VITE_API_URL = https://your-backend.onrender.com/api
   ```
4. Deploy — Vite builds automatically.

---

## Validation Rules

| Field               | Rule                          |
|---------------------|-------------------------------|
| `employee_id`       | Required, unique              |
| `full_name`         | Required, non-empty           |
| `email`             | Required, valid format, unique|
| `department`        | Required, non-empty           |
| `attendance.date`   | Required, ISO `YYYY-MM-DD`    |
| `attendance.status` | Must be `Present` or `Absent` |

---

## Features

### Core (required)
- ✅ Add / view / delete employees
- ✅ Mark daily attendance (Present / Absent)
- ✅ View all attendance records per employee
- ✅ Server-side validation with meaningful error messages
- ✅ Duplicate employee ID and email prevention
- ✅ Cascade delete (attendance removed when employee is deleted)

### Bonus (implemented)
- ✅ Filter attendance by employee and/or date
- ✅ Present-day totals shown per employee
- ✅ Dashboard with stat cards, department bar chart, recent activity

### UI States
- ✅ Loading skeletons (table + stat cards)
- ✅ Empty states with helpful messages
- ✅ Error states with retry buttons
- ✅ Toast notifications for all actions
- ✅ Modal confirmations for destructive actions
- ✅ Fully responsive — works on all screen sizes

---

## Assumptions & Limitations

- **Single admin user** — no authentication (per requirements)
- **MySQL 8+** required for `ON DELETE CASCADE` and `ENUM` column support
- **Upsert behavior** — re-marking attendance for the same employee + date overwrites the previous record
- **No pagination** — all records load at once; suitable for HRMS Lite scale
- **Timezone** — attendance dates stored as plain `DATE` values; dashboard "today" uses server local date

---

```
