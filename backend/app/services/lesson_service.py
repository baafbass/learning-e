"""Lesson authoring and access control."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.models import Enrollment, Lesson, User
from app.schemas.lesson import LessonCreate, LessonUpdate
from app.services import course_service, progress_service


def _get_lesson(db: Session, course_id: int, lesson_id: int) -> Lesson:
    lesson = db.get(Lesson, lesson_id)
    if lesson is None or lesson.course_id != course_id:
        raise NotFoundError("Lesson not found")
    return lesson


def _is_enrolled(db: Session, user: User, course_id: int) -> bool:
    statement = select(Enrollment.id).where(
        Enrollment.course_id == course_id, Enrollment.student_id == user.id
    )
    return db.scalar(statement) is not None


def get_lesson_for_user(db: Session, user: User, course_id: int, lesson_id: int) -> Lesson:
    course = course_service.get_visible_course(db, course_id, user)
    if not course_service.can_manage(user, course) and not _is_enrolled(db, user, course_id):
        raise PermissionDeniedError("Enroll in this course to access its lessons")
    return _get_lesson(db, course_id, lesson_id)


def create_lesson(db: Session, user: User, course_id: int, data: LessonCreate) -> Lesson:
    course = course_service.get_course(db, course_id)
    course_service.ensure_can_manage(user, course)
    lesson = Lesson(**data.model_dump(), course_id=course.id)
    db.add(lesson)
    progress_service.refresh_course(db, course.id)
    db.commit()
    db.refresh(lesson)
    return lesson


def update_lesson(
    db: Session, user: User, course_id: int, lesson_id: int, data: LessonUpdate
) -> Lesson:
    course_service.ensure_can_manage(user, course_service.get_course(db, course_id))
    lesson = _get_lesson(db, course_id, lesson_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(lesson, field, value)
    db.commit()
    db.refresh(lesson)
    return lesson


def delete_lesson(db: Session, user: User, course_id: int, lesson_id: int) -> None:
    course_service.ensure_can_manage(user, course_service.get_course(db, course_id))
    db.delete(_get_lesson(db, course_id, lesson_id))
    progress_service.refresh_course(db, course_id)
    db.commit()
