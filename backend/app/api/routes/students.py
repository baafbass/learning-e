from fastapi import APIRouter, Query

from app.api.deps import DbSession, Pagination, StaffUser
from app.schemas.common import Page
from app.schemas.student import StudentDetail, StudentListItem
from app.services import student_service

router = APIRouter(prefix="/students", tags=["Students"])


@router.get("", response_model=Page[StudentListItem])
def list_students(
    user: StaffUser,
    db: DbSession,
    pagination: Pagination,
    q: str | None = Query(None, max_length=100, description="Name or email"),
):
    """Admins see every student; instructors see students enrolled in their courses."""
    return student_service.list_students(db, user, pagination, q=q)


@router.get("/{student_id}", response_model=StudentDetail)
def read_student(student_id: int, user: StaffUser, db: DbSession):
    return student_service.get_student(db, user, student_id)
