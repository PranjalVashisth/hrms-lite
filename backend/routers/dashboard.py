from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date

from core.database import get_db
from models import Employee, Attendance
from schemas import DashboardResponse, DeptStat, RecentRecord

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    today = date.today()

    total_employees = db.query(func.count(Employee.id)).scalar() or 0

    dept_rows = (
        db.query(Employee.department, func.count(Employee.id).label("count"))
        .group_by(Employee.department)
        .order_by(func.count(Employee.id).desc())
        .all()
    )

    today_present = db.query(func.count(Attendance.id)).filter(
        Attendance.date == today, Attendance.status == "Present"
    ).scalar() or 0

    today_absent = db.query(func.count(Attendance.id)).filter(
        Attendance.date == today, Attendance.status == "Absent"
    ).scalar() or 0

    recent_rows = (
        db.query(
            Attendance.employee_id,
            Employee.full_name,
            Employee.department,
            Attendance.date,
            Attendance.status,
        )
        .join(Employee, Employee.employee_id == Attendance.employee_id)
        .order_by(Attendance.created_at.desc())
        .limit(8)
        .all()
    )

    return DashboardResponse(
        total_employees=total_employees,
        today_present=today_present,
        today_absent=today_absent,
        departments=[DeptStat(department=r.department, count=r.count) for r in dept_rows],
        recent_attendance=[
            RecentRecord(
                employee_id=r.employee_id,
                full_name=r.full_name,
                department=r.department,
                date=r.date,
                status=r.status,
            )
            for r in recent_rows
        ],
    )
