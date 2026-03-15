from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date

from core.database import get_db
from models import Employee, Attendance
from schemas import (
    AttendanceCreate, AttendanceResponse, AttendanceSummary, ErrorResponse
)

router = APIRouter(prefix="/attendance", tags=["Attendance"])


@router.get("", response_model=List[AttendanceResponse])
def list_attendance(
    employee_id: Optional[str] = Query(
        None, description="Filter by employee ID"),
    date_filter: Optional[date] = Query(
        None, alias="date", description="Filter by date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
):
    """List attendance records with optional filters."""
    q = (
        db.query(
            Attendance,
            Employee.full_name.label("full_name"),
            Employee.department.label("department"),
        )
        .join(Employee, Employee.employee_id == Attendance.employee_id)
    )

    if employee_id:
        q = q.filter(Attendance.employee_id == employee_id)
    if date_filter:
        q = q.filter(Attendance.date == date_filter)

    rows = q.order_by(Attendance.date.desc(), Employee.full_name.asc()).all()

    result = []
    for att, full_name, department in rows:
        r = AttendanceResponse.model_validate(att)
        r.full_name = full_name
        r.department = department
        result.append(r)

    return result


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=AttendanceResponse,
    responses={
        200: {"model": AttendanceResponse, "description": "Attendance updated (upsert)"},
        404: {"model": ErrorResponse},
    },
)
def mark_attendance(payload: AttendanceCreate, db: Session = Depends(get_db)):
    """
    Mark or update attendance for an employee on a given date.
    If a record already exists for that employee+date it is updated (upsert).
    """
    emp = db.query(Employee).filter(
        Employee.employee_id == payload.employee_id).first()
    if not emp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": f"Employee '{payload.employee_id}' not found"},
        )

    existing = db.query(Attendance).filter(
        Attendance.employee_id == payload.employee_id,
        Attendance.date == payload.date,
    ).first()

    if existing:
        existing.status = payload.status
        db.commit()
        db.refresh(existing)
        att = existing
        http_status = status.HTTP_200_OK
    else:
        att = Attendance(
            employee_id=payload.employee_id,
            date=payload.date,
            status=payload.status,
        )
        db.add(att)
        db.commit()
        db.refresh(att)
        http_status = status.HTTP_201_CREATED

    r = AttendanceResponse.model_validate(att)
    r.full_name = emp.full_name
    r.department = emp.department
    return JSONResponse(status_code=http_status, content=r.model_dump(mode="json"))


@router.get(
    "/{employee_id}/summary",
    response_model=AttendanceSummary,
    responses={404: {"model": ErrorResponse}},
)
def attendance_summary(employee_id: str, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(
        Employee.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": f"Employee '{employee_id}' not found"},
        )

    counts = (
        db.query(Attendance.status, func.count(Attendance.id).label("cnt"))
        .filter(Attendance.employee_id == employee_id)
        .group_by(Attendance.status)
        .all()
    )
    summary = {row.status: row.cnt for row in counts}

    present = summary.get("Present", 0)
    absent = summary.get("Absent",  0)

    return AttendanceSummary(
        employee_id=employee_id,
        full_name=emp.full_name,
        present_days=present,
        absent_days=absent,
        total_days=present + absent,
    )
