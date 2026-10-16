"""Progress and completion status derived from completed lessons."""

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.base import utc_now
from app.models import Enrollment, EnrollmentStatus, Lesson, LessonCompletion


def _count_lessons(db: Session, course_id: int) -> int:
    return db.scalar(select(func.count(Lesson.id)).where(Lesson.course_id == course_id)) or 0


def _count_completed(db: Session, enrollment_id: int) -> int:
    statement = select(func.count(LessonCompletion.id)).where(
        LessonCompletion.enrollment_id == enrollment_id
    )
    return db.scalar(statement) or 0


def _apply_progress(enrollment: Enrollment, completed: int, total: int) -> None:
    enrollment.progress = round(completed * 100 / total) if total else 0
    if total and completed >= total:
        if enrollment.status != EnrollmentStatus.COMPLETED:
            enrollment.status = EnrollmentStatus.COMPLETED
            enrollment.completed_at = utc_now()
    else:
        enrollment.status = EnrollmentStatus.IN_PROGRESS
        enrollment.completed_at = None


def refresh_enrollment(db: Session, enrollment: Enrollment) -> None:
    """Recompute one enrollment from the database (call after flushing completion changes)."""
    total = _count_lessons(db, enrollment.course_id)
    _apply_progress(enrollment, _count_completed(db, enrollment.id), total)


def refresh_course(db: Session, course_id: int) -> None:
    """Recompute every enrollment of a course after its lessons changed."""
    db.flush()
    total = _count_lessons(db, course_id)
    enrollments = db.scalars(select(Enrollment).where(Enrollment.course_id == course_id)).all()
    for enrollment in enrollments:
        _apply_progress(enrollment, _count_completed(db, enrollment.id), total)
