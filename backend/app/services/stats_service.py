"""Aggregated figures for the home page and the admin dashboard."""

from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.models import (
    Category,
    ContactMessage,
    Course,
    Enrollment,
    EnrollmentStatus,
    Grade,
    User,
    UserRole,
)
from app.schemas.stats import AdminStats, PublicStats, TopCourse
from app.schemas.user import UserRead

_TOP_COURSES_LIMIT = 5
_RECENT_USERS_LIMIT = 5


def _count(db: Session, column, *conditions) -> int:
    return db.scalar(select(func.count(column)).where(*conditions)) or 0


def _users_by_role(db: Session) -> dict[UserRole, int]:
    rows = db.execute(select(User.role, func.count(User.id)).group_by(User.role)).all()
    return {role: count for role, count in rows}


def public_stats(db: Session) -> PublicStats:
    by_role = _users_by_role(db)
    return PublicStats(
        courses=_count(db, Course.id, Course.is_published.is_(True)),
        students=by_role.get(UserRole.STUDENT, 0),
        instructors=by_role.get(UserRole.INSTRUCTOR, 0),
        categories=_count(db, Category.id),
    )


def _top_courses(db: Session) -> list[TopCourse]:
    completed = func.sum(case((Enrollment.status == EnrollmentStatus.COMPLETED, 1), else_=0))
    rows = db.execute(
        select(
            Course.id,
            Course.title,
            User.full_name,
            func.count(Enrollment.id).label("enrollment_count"),
            func.coalesce(completed, 0).label("completed_count"),
        )
        .join(User, Course.instructor_id == User.id)
        .join(Enrollment, Enrollment.course_id == Course.id)
        .group_by(Course.id, Course.title, User.full_name)
        .order_by(func.count(Enrollment.id).desc(), Course.title)
        .limit(_TOP_COURSES_LIMIT)
    ).all()
    return [
        TopCourse(
            id=row.id,
            title=row.title,
            instructor_name=row.full_name,
            enrollment_count=row.enrollment_count,
            completed_count=row.completed_count,
        )
        for row in rows
    ]


def admin_stats(db: Session) -> AdminStats:
    by_role = _users_by_role(db)
    courses = _count(db, Course.id)
    published = _count(db, Course.id, Course.is_published.is_(True))
    enrollments = _count(db, Enrollment.id)
    completed = _count(db, Enrollment.id, Enrollment.status == EnrollmentStatus.COMPLETED)
    average_grade = db.scalar(select(func.avg(Grade.score * 100.0 / Grade.max_score)))
    recent_users = db.scalars(
        select(User).order_by(User.created_at.desc(), User.id.desc()).limit(_RECENT_USERS_LIMIT)
    ).all()

    return AdminStats(
        users=sum(by_role.values()),
        students=by_role.get(UserRole.STUDENT, 0),
        instructors=by_role.get(UserRole.INSTRUCTOR, 0),
        admins=by_role.get(UserRole.ADMIN, 0),
        courses=courses,
        published_courses=published,
        draft_courses=courses - published,
        categories=_count(db, Category.id),
        enrollments=enrollments,
        enrollments_in_progress=enrollments - completed,
        enrollments_completed=completed,
        completion_rate=round(completed * 100 / enrollments, 1) if enrollments else 0,
        average_grade=round(float(average_grade), 1) if average_grade is not None else None,
        unread_messages=_count(db, ContactMessage.id, ContactMessage.is_read.is_(False)),
        top_courses=_top_courses(db),
        recent_users=[UserRead.model_validate(user) for user in recent_users],
    )
