from __future__ import annotations

from sqlalchemy import String, func, select
from sqlalchemy.orm import Mapped, column_property, mapped_column, relationship

from app.db.base import Base, CreatedAtMixin
from app.models.course import Course


class Category(CreatedAtMixin, Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), unique=True)
    description: Mapped[str | None] = mapped_column(String(255))
    icon: Mapped[str] = mapped_column(String(50), default="category")

    courses: Mapped[list[Course]] = relationship(back_populates="category")

    # Number of published courses, shown in catalog filters and on the home page.
    course_count: Mapped[int] = column_property(
        select(func.count(Course.id))
        .where(Course.category_id == id, Course.is_published.is_(True))
        .correlate_except(Course)
        .scalar_subquery()
    )
