from fastapi import APIRouter, status

from app.api.deps import DbSession, StaffUser
from app.schemas.grade import GradeCreate, GradeRead, GradeUpdate
from app.services import grade_service

router = APIRouter(tags=["Grades"])


@router.post(
    "/enrollments/{enrollment_id}/grades",
    response_model=GradeRead,
    status_code=status.HTTP_201_CREATED,
)
def add_grade(enrollment_id: int, data: GradeCreate, user: StaffUser, db: DbSession):
    return grade_service.add_grade(db, user, enrollment_id, data)


@router.patch("/grades/{grade_id}", response_model=GradeRead)
def update_grade(grade_id: int, data: GradeUpdate, user: StaffUser, db: DbSession):
    return grade_service.update_grade(db, user, grade_id, data)


@router.delete("/grades/{grade_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_grade(grade_id: int, user: StaffUser, db: DbSession) -> None:
    grade_service.delete_grade(db, user, grade_id)
