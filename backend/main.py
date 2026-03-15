from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
import logging

from core.config import settings
from core.database import engine, Base
from models import Employee, Attendance  # noqa: F401 — needed for metadata
from routers import employees_router, attendance_router, dashboard_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Create tables on startup (use Alembic for migrations in prod) ──────────────
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HRMS Lite API",
    description="Human Resource Management System — Employees & Attendance",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(employees_router, prefix="/api")
app.include_router(attendance_router, prefix="/api")
app.include_router(dashboard_router,  prefix="/api")


# ── Global exception handlers ──────────────────────────────────────────────────
@app.exception_handler(RequestValidationError)
async def request_validation_handler(request: Request, exc: RequestValidationError):
    """Handles FastAPI body/query/path validation errors — returns clean field-keyed errors."""
    details = {}
    for error in exc.errors():
        # loc is a tuple like ('body', 'email') or ('body', 'employee_id')
        field = error["loc"][-1] if error["loc"] else "unknown"
        details[str(field)] = error["msg"].replace("Value error, ", "")
    return JSONResponse(
        status_code=422,
        content={"error": "Validation failed", "details": details},
    )


@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    details = {}
    for error in exc.errors():
        field = error["loc"][-1] if error["loc"] else "unknown"
        details[str(field)] = error["msg"].replace("Value error, ", "")
    return JSONResponse(
        status_code=422,
        content={"error": "Validation failed", "details": details},
    )


@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(status_code=404, content={"error": "Resource not found"})


@app.exception_handler(500)
async def server_error_handler(request: Request, exc):
    logger.error(f"Unhandled error: {exc}")
    return JSONResponse(status_code=500, content={"error": "Internal server error"})


# ── Health check ───────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "version": "1.0.0"}


@app.get("/", tags=["Health"])
def root():
    return {"message": "HRMS Lite API", "docs": "/docs"}
