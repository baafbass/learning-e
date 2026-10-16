"""Student records for admins (all students) and instructors (students of their courses)."""

from math import ceil

from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.core.exceptions import NotFoundError
from app.models import Course, Enrollment, EnrollmentStatus, User, UserRole
from app.schemas.common import Page, PageParams
from app.schemas.enrollment import StudentEnrollment
from app.schemas.student import StudentDetail, StudentListItem


def _visible_enrollments(student: User, viewer: User) -> list[Enrollment]:
    if viewer.role == UserRole.ADMIN:
        return list(student.enrollments)
    return [e for e in student.enrollments if e.course.instructor_id == viewer.id]


def _summary_fields(student: User, enrollments: list[Enrollment]) -> dict:
    averages = [e.average_score for e in enrollments if e.average_score is not None]
    return {
        "id": student.id,
        "full_name": student.full_name,
        "email": student.email,
        "avatar_url": student.avatar_url,
        "is_active": student.is_active,
        "created_at": student.created_at,
        "enrollment_count": len(enrollments),
        "completed_count": sum(e.status == EnrollmentStatus.COMPLETED for e in enrollments),
        "average_score": round(sum(averages) / len(averages), 1) if averages else None,
    }


def _students_query(viewer: User) -> Select[tuple[User]]:
    statement = (
        select(User)
        .where(User.role == UserRole.STUDENT)
        .options(
            selectinload(User.enrollments).selectinload(Enrollment.grades),
            selectinload(User.enrollments).selectinload(Enrollment.completions),
            selectinload(User.enrollments)
            .joinedload(Enrollment.course)
            .selectinload(Course.lessons),
        )
    )
    if viewer.role != UserRole.ADMIN:
        taught = select(Enrollment.student_id).join(Course).where(Course.instructor_id == viewer.id)
        statement = statement.where(User.id.in_(taught))
    return statement


def list_students(
    db: Session, viewer: User, params: PageParams, q: str | None = None
) -> Page[StudentListItem]:
    statement = _students_query(viewer).order_by(User.full_name)
    if q:
        pattern = f"%{q}%"
        statement = statement.where(or_(User.full_name.ilike(pattern), User.email.ilike(pattern)))

    total = db.scalar(select(func.count()).select_from(statement.order_by(None).subquery())) or 0
    students = db.scalars(statement.limit(params.size).offset(params.offset)).unique().all()
    return Page[StudentListItem](
        items=[
            StudentListItem(**_summary_fields(s, _visible_enrollments(s, viewer))) for s in students
        ],
        total=total,
        page=params.page,
        size=params.size,
        pages=ceil(total / params.size),
    )


def get_student(db: Session, viewer: User, student_id: int) -> StudentDetail:
    student = db.scalar(_students_query(viewer).where(User.id == student_id))
    if student is None:
        raise NotFoundError("Student not found")
    enrollments = _visible_enrollments(student, viewer)
    return StudentDetail(
        **_summary_fields(student, enrollments),
        bio=student.bio,
        enrollments=[StudentEnrollment.model_validate(e) for e in enrollments],
    )
