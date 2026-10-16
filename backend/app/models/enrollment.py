from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, utc_now
from app.models.enums import EnrollmentStatus, db_enum
from app.models.grade import letter_for

if TYPE_CHECKING:
    from app.models.course import Course, Lesson
    from app.models.grade import Grade
    from app.models.user import User


class Enrollment(Base):
    __tablename__ = "enrollments"
    __table_args__ = (
        UniqueConstraint("student_id", "course_id", name="uq_enrollment_student_course"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), index=True)
    status: Mapped[EnrollmentStatus] = mapped_column(
        db_enum(EnrollmentStatus), default=EnrollmentStatus.IN_PROGRESS, index=True
    )
    progress: Mapped[int] = mapped_column(default=0)
    enrolled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    student: Mapped[User] = relationship(back_populates="enrollments")
    course: Mapped[Course] = relationship(back_populates="enrollments")
    completions: Mapped[list[LessonCompletion]] = relationship(
        back_populates="enrollment", cascade="all, delete-orphan", passive_deletes=True
    )
    grades: Mapped[list[Grade]] = relationship(
        back_populates="enrollment",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="Grade.created_at",
    )

    @property
    def completed_lesson_ids(self) -> list[int]:
        return [completion.lesson_id for completion in self.completions]

    @property
    def next_lesson_id(self) -> int | None:
        """First lesson not yet completed, or the first lesson when everything is done."""
        lessons = self.course.lessons
        done = set(self.completed_lesson_ids)
        upcoming = next((lesson.id for lesson in lessons if lesson.id not in done), None)
        return upcoming or (lessons[0].id if lessons else None)

    @property
    def average_score(self) -> float | None:
        if not self.grades:
            return None
        return round(sum(grade.percentage for grade in self.grades) / len(self.grades), 1)

    @property
    def letter_grade(self) -> str | None:
        average = self.average_score
        return None if average is None else letter_for(average)


class LessonCompletion(Base):
    __tablename__ = "lesson_completions"
    __table_args__ = (
        UniqueConstraint("enrollment_id", "lesson_id", name="uq_completion_enrollment_lesson"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    enrollment_id: Mapped[int] = mapped_column(
        ForeignKey("enrollments.id", ondelete="CASCADE"), index=True
    )
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lessons.id", ondelete="CASCADE"), index=True)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    enrollment: Mapped[Enrollment] = relationship(back_populates="completions")
    lesson: Mapped[Lesson] = relationship(back_populates="completions")
