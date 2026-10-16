from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.enrollment import Enrollment
    from app.models.user import User

_LETTER_THRESHOLDS = ((90, "A"), (80, "B"), (70, "C"), (60, "D"))


def letter_for(percentage: float) -> str:
    """Convert a percentage into a letter grade (A >= 90, B >= 80, C >= 70, D >= 60, else F)."""
    return next((letter for minimum, letter in _LETTER_THRESHOLDS if percentage >= minimum), "F")


class Grade(TimestampMixin, Base):
    __tablename__ = "grades"

    id: Mapped[int] = mapped_column(primary_key=True)
    enrollment_id: Mapped[int] = mapped_column(
        ForeignKey("enrollments.id", ondelete="CASCADE"), index=True
    )
    title: Mapped[str] = mapped_column(String(120))
    score: Mapped[float]
    max_score: Mapped[float] = mapped_column(default=100)
    feedback: Mapped[str | None] = mapped_column(Text)
    graded_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))

    enrollment: Mapped[Enrollment] = relationship(back_populates="grades")
    graded_by: Mapped[User | None] = relationship()

    @property
    def percentage(self) -> float:
        return round(self.score / self.max_score * 100, 1)

    @property
    def letter(self) -> str:
        return letter_for(self.percentage)
