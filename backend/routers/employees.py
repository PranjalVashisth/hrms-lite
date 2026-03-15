from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from core.database import get_db
from models import Employee, Attendance
from schemas import (
    EmployeeCreate, EmployeeResponse, EmployeeWithStats, ErrorResponse
)

router = APIRouter(prefix="/employees", tags=["Employees"])


@router.get("", response_model=List[EmployeeWithStats])
def list_employees(db: Session = Depends(get_db)):
    """Return all employees with their attendance summary."""
    employees = db.query(Employee).order_by(Employee.created_at.desc()).all()

    result = []
    for emp in employees:
        present = db.query(func.count(Attendance.id)).filter(
            Attendance.employee_id == emp.employee_id,
            Attendance.status == "Present"
        ).scalar() or 0

        absent = db.query(func.count(Attendance.id)).filter(
            Attendance.employee_id == emp.employee_id,
            Attendance.status == "Absent"
        ).scalar() or 0

        result.append(EmployeeWithStats(
            **EmployeeResponse.model_validate(emp).model_dump(),
            present_days=present,
            absent_days=absent,
            total_days=present + absent,
        ))

    return result


@router.post(
    "",
    response_model=EmployeeResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        409: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
    },
)
def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db)):
    """Create a new employee. Returns 409 on duplicate ID or email."""
    if db.query(Employee).filter(Employee.employee_id == payload.employee_id).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"error": f"Employee ID '{payload.employee_id}' already exists"},
        )
    if db.query(Employee).filter(Employee.email == payload.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"error": f"Email '{payload.email}' is already in use"},
        )

    emp = Employee(**payload.model_dump())
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return emp


@router.get(
    "/{employee_id}",
    response_model=EmployeeWithStats,
    responses={404: {"model": ErrorResponse}},
)
def get_employee(employee_id: str, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": f"Employee '{employee_id}' not found"},
        )

    present = db.query(func.count(Attendance.id)).filter(
        Attendance.employee_id == employee_id,
        Attendance.status == "Present"
    ).scalar() or 0

    absent = db.query(func.count(Attendance.id)).filter(
        Attendance.employee_id == employee_id,
        Attendance.status == "Absent"
    ).scalar() or 0

    return EmployeeWithStats(
        **EmployeeResponse.model_validate(emp).model_dump(),
        present_days=present,
        absent_days=absent,
        total_days=present + absent,
    )


@router.delete(
    "/{employee_id}",
    status_code=status.HTTP_200_OK,
    responses={404: {"model": ErrorResponse}},
)
def delete_employee(employee_id: str, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": f"Employee '{employee_id}' not found"},
        )
    db.delete(emp)
    db.commit()
    return {"message": f"Employee '{employee_id}' deleted successfully"}
