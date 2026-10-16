from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import JSON, ForeignKey, Numeric, String, Text, func, select
from sqlalchemy.orm import Mapped, column_property, mapped_column, relationship

from app.db.base import Base, TimestampMixin
from app.models.enrollment import Enrollment, LessonCompletion
from app.models.enums import CourseLevel, db_enum

if TYPE_CHECKING:
    from app.models.category import Category
    from app.models.user import User


class Lesson(TimestampMixin, Base):
    __tablename__ = "lessons"

    id: Mapped[int] = mapped_column(primary_key=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(200))
    content: Mapped[str] = mapped_column(Text)
    video_url: Mapped[str | None] = mapped_column(String(500))
    duration_minutes: Mapped[int] = mapped_column(default=0)
    position: Mapped[int] = mapped_column(default=1)

    course: Mapped[Course] = relationship(back_populates="lessons")
    completions: Mapped[list[LessonCompletion]] = relationship(
        back_populates="lesson", cascade="all, delete-orphan", passive_deletes=True
    )


class Course(TimestampMixin, Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200), index=True)
    summary: Mapped[str] = mapped_column(String(300))
    description: Mapped[str] = mapped_column(Text)
    outcomes: Mapped[list[str]] = mapped_column(JSON, default=list)
    level: Mapped[CourseLevel] = mapped_column(db_enum(CourseLevel), default=CourseLevel.BEGINNER)
    price: Mapped[float] = mapped_column(Numeric(10, 2, asdecimal=False), default=0)
    duration_hours: Mapped[int] = mapped_column(default=0)
    thumbnail_url: Mapped[str | None] = mapped_column(String(500))
    is_published: Mapped[bool] = mapped_column(default=False, index=True)
    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id", ondelete="RESTRICT"), index=True
    )
    instructor_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )

    category: Mapped[Category] = relationship(back_populates="courses")
    instructor: Mapped[User] = relationship(back_populates="courses")
    lessons: Mapped[list[Lesson]] = relationship(
        back_populates="course",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by=(Lesson.position, Lesson.id),
    )
    enrollments: Mapped[list[Enrollment]] = relationship(
        back_populates="course", cascade="all, delete-orphan", passive_deletes=True
    )

    lesson_count: Mapped[int] = column_property(
        select(func.count(Lesson.id))
        .where(Lesson.course_id == id)
        .correlate_except(Lesson)
        .scalar_subquery()
    )
    enrollment_count: Mapped[int] = column_property(
        select(func.count(Enrollment.id))
        .where(Enrollment.course_id == id)
        .correlate_except(Enrollment)
        .scalar_subquery()
    )
