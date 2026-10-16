from fastapi import APIRouter, status

from app.api.deps import CurrentUser, DbSession, StaffUser
from app.schemas.lesson import LessonCreate, LessonRead, LessonUpdate
from app.services import lesson_service

router = APIRouter(prefix="/courses/{course_id}/lessons", tags=["Lessons"])


@router.get("/{lesson_id}", response_model=LessonRead)
def read_lesson(course_id: int, lesson_id: int, user: CurrentUser, db: DbSession):
    """Full lesson content for enrolled students, the course owner and admins."""
    return lesson_service.get_lesson_for_user(db, user, course_id, lesson_id)


@router.post("", response_model=LessonRead, status_code=status.HTTP_201_CREATED)
def create_lesson(course_id: int, data: LessonCreate, user: StaffUser, db: DbSession):
    return lesson_service.create_lesson(db, user, course_id, data)


@router.patch("/{lesson_id}", response_model=LessonRead)
def update_lesson(
    course_id: int, lesson_id: int, data: LessonUpdate, user: StaffUser, db: DbSession
):
    return lesson_service.update_lesson(db, user, course_id, lesson_id, data)


@router.delete("/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lesson(course_id: int, lesson_id: int, user: StaffUser, db: DbSession) -> None:
    lesson_service.delete_lesson(db, user, course_id, lesson_id)
