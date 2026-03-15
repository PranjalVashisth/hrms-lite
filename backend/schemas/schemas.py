from pydantic import BaseModel, EmailStr, field_validator, ConfigDict
from typing import Optional, List
from datetime import date, datetime
from enum import Enum


class AttendanceStatusEnum(str, Enum):
    present = "Present"
    absent  = "Absent"


# ── EMPLOYEE ──────────────────────────────────────────────────────────────────

class EmployeeCreate(BaseModel):
    employee_id: str
    full_name:   str
    email:       EmailStr
    department:  str

    @field_validator("employee_id")
    @classmethod
    def employee_id_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Employee ID cannot be empty")
        return v

    @field_validator("full_name")
    @classmethod
    def full_name_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Full name cannot be empty")
        return v

    @field_validator("department")
    @classmethod
    def department_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Department cannot be empty")
        return v


class EmployeeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id:          int
    employee_id: str
    full_name:   str
    email:       str
    department:  str
    created_at:  datetime


class EmployeeWithStats(EmployeeResponse):
    present_days: int = 0
    absent_days:  int = 0
    total_days:   int = 0


# ── ATTENDANCE ────────────────────────────────────────────────────────────────

class AttendanceCreate(BaseModel):
    employee_id: str
    date:        date
    status:      AttendanceStatusEnum

    @field_validator("employee_id")
    @classmethod
    def emp_id_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Employee ID cannot be empty")
        return v


class AttendanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id:          int
    employee_id: str
    date:        date
    status:      AttendanceStatusEnum
    created_at:  datetime
    updated_at:  datetime

    full_name:   Optional[str] = None
    department:  Optional[str] = None


class AttendanceSummary(BaseModel):
    employee_id:  str
    full_name:    str
    present_days: int
    absent_days:  int
    total_days:   int


# ── DASHBOARD ─────────────────────────────────────────────────────────────────

class DeptStat(BaseModel):
    department: str
    count:      int


class RecentRecord(BaseModel):
    employee_id: str
    full_name:   str
    department:  str
    date:        date
    status:      AttendanceStatusEnum


class DashboardResponse(BaseModel):
    total_employees:   int
    today_present:     int
    today_absent:      int
    departments:       List[DeptStat]
    recent_attendance: List[RecentRecord]


# ── ERRORS ────────────────────────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    error:   str
    details: Optional[dict] = None
