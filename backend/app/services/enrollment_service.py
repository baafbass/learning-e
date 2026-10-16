"""Enrollment lifecycle: enroll, unenroll, lesson completion and listings."""

from collections.abc import Sequence

from sqlalchemy import Select, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.core.exceptions import ConflictError, NotFoundError
from app.models import Course, Enrollment, EnrollmentStatus, LessonCompletion, User
from app.services import course_service, progress_service


def _enrollment_query() -> Select[tuple[Enrollment]]:
    return select(Enrollment).options(
        selectinload(Enrollment.completions),
        selectinload(Enrollment.grades),
        joinedload(Enrollment.course).selectinload(Course.lessons),
    )


def _find(db: Session, student: User, course_id: int) -> Enrollment | None:
    return db.scalar(
        _enrollment_query().where(
            Enrollment.student_id == student.id, Enrollment.course_id == course_id
        )
    )


def get_own_enrollment(db: Session, student: User, course_id: int) -> Enrollment:
    enrollment = _find(db, student, course_id)
    if enrollment is None:
        raise NotFoundError("You are not enrolled in this course")
    return enrollment


def get_enrollment(db: Session, enrollment_id: int) -> Enrollment:
    enrollment = db.scalar(_enrollment_query().where(Enrollment.id == enrollment_id))
    if enrollment is None:
        raise NotFoundError("Enrollment not found")
    return enrollment


def enroll(db: Session, student: User, course_id: int) -> Enrollment:
    course = course_service.get_visible_course(db, course_id, student)
    if _find(db, student, course.id):
        raise ConflictError("You are already enrolled in this course")
    db.add(Enrollment(student_id=student.id, course_id=course.id))
    db.commit()
    return get_own_enrollment(db, student, course.id)


def unenroll(db: Session, student: User, course_id: int) -> None:
    db.delete(get_own_enrollment(db, student, course_id))
    db.commit()


def set_lesson_completed(
    db: Session, student: User, course_id: int, lesson_id: int, completed: bool
) -> Enrollment:
    enrollment = get_own_enrollment(db, student, course_id)
    if lesson_id not in {lesson.id for lesson in enrollment.course.lessons}:
        raise NotFoundError("Lesson not found")

    existing = next((c for c in enrollment.completions if c.lesson_id == lesson_id), None)
    if completed and existing is None:
        enrollment.completions.append(LessonCompletion(lesson_id=lesson_id))
    elif not completed and existing is not None:
        enrollment.completions.remove(existing)

    db.flush()
    progress_service.refresh_enrollment(db, enrollment)
    db.commit()
    return get_own_enrollment(db, student, course_id)


def list_student_enrollments(
    db: Session, student: User, status: EnrollmentStatus | None = None
) -> Sequence[Enrollment]:
    statement = (
        _enrollment_query()
        .options(
            joinedload(Enrollment.course).joinedload(Course.category),
            joinedload(Enrollment.course).joinedload(Course.instructor),
        )
        .where(Enrollment.student_id == student.id)
        .order_by(Enrollment.enrolled_at.desc())
    )
    if status:
        statement = statement.where(Enrollment.status == status)
    return db.scalars(statement).unique().all()


def list_course_enrollments(db: Session, user: User, course_id: int) -> Sequence[Enrollment]:
    """The gradebook of a course, for its instructor or an admin."""
    course_service.ensure_can_manage(user, course_service.get_course(db, course_id))
    statement = (
        _enrollment_query()
        .options(joinedload(Enrollment.student))
        .where(Enrollment.course_id == course_id)
        .order_by(Enrollment.enrolled_at)
    )
    return db.scalars(statement).unique().all()
