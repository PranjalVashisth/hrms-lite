from sqlalchemy import Column, Integer, String, Date, Enum, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base
import enum


class AttendanceStatus(str, enum.Enum):
    present = "Present"
    absent  = "Absent"


class Employee(Base):
    __tablename__ = "employees"

    id          = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(50), unique=True, nullable=False, index=True)
    full_name   = Column(String(150), nullable=False)
    email       = Column(String(255), unique=True, nullable=False)
    department  = Column(String(100), nullable=False)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    attendance = relationship(
        "Attendance",
        back_populates="employee",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )


class Attendance(Base):
    __tablename__ = "attendance"

    id          = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(50), ForeignKey("employees.employee_id", ondelete="CASCADE"), nullable=False)
    date        = Column(Date, nullable=False)
    status      = Column(Enum(AttendanceStatus), nullable=False)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    employee = relationship("Employee", back_populates="attendance")

    __table_args__ = (
        UniqueConstraint("employee_id", "date", name="uq_employee_date"),
    )
