"""Grades recorded by course instructors (or admins) on enrollments."""

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, ValidationFailedError
from app.models import Grade, User
from app.schemas.grade import SCORE_ABOVE_MAX, GradeCreate, GradeUpdate
from app.services import course_service, enrollment_service


def _get_grade(db: Session, grade_id: int) -> Grade:
    grade = db.get(Grade, grade_id)
    if grade is None:
        raise NotFoundError("Grade not found")
    return grade


def add_grade(db: Session, user: User, enrollment_id: int, data: GradeCreate) -> Grade:
    enrollment = enrollment_service.get_enrollment(db, enrollment_id)
    course_service.ensure_can_manage(user, enrollment.course)
    grade = Grade(**data.model_dump(), enrollment_id=enrollment.id, graded_by_id=user.id)
    db.add(grade)
    db.commit()
    db.refresh(grade)
    return grade


def update_grade(db: Session, user: User, grade_id: int, data: GradeUpdate) -> Grade:
    grade = _get_grade(db, grade_id)
    course_service.ensure_can_manage(user, grade.enrollment.course)
    changes = data.model_dump(exclude_unset=True, exclude_none=True)
    if changes.get("score", grade.score) > changes.get("max_score", grade.max_score):
        raise ValidationFailedError(SCORE_ABOVE_MAX)
    for field, value in changes.items():
        setattr(grade, field, value)
    grade.graded_by_id = user.id
    db.commit()
    db.refresh(grade)
    return grade


def delete_grade(db: Session, user: User, grade_id: int) -> None:
    grade = _get_grade(db, grade_id)
    course_service.ensure_can_manage(user, grade.enrollment.course)
    db.delete(grade)
    db.commit()
