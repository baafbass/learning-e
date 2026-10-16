from collections.abc import Sequence

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.models import Category, Course
from app.schemas.category import CategoryCreate, CategoryUpdate


def list_categories(db: Session) -> Sequence[Category]:
    return db.scalars(select(Category).order_by(Category.name)).all()


def get_category(db: Session, category_id: int) -> Category:
    category = db.get(Category, category_id)
    if category is None:
        raise NotFoundError("Category not found")
    return category


def _ensure_unique_name(db: Session, name: str, exclude_id: int | None = None) -> None:
    statement = select(Category.id).where(func.lower(Category.name) == name.lower())
    if exclude_id is not None:
        statement = statement.where(Category.id != exclude_id)
    if db.scalar(statement):
        raise ConflictError("A category with this name already exists")


def create_category(db: Session, data: CategoryCreate) -> Category:
    _ensure_unique_name(db, data.name)
    category = Category(**data.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def update_category(db: Session, category_id: int, data: CategoryUpdate) -> Category:
    category = get_category(db, category_id)
    changes = data.model_dump(exclude_unset=True)
    if changes.get("name"):
        _ensure_unique_name(db, changes["name"], exclude_id=category.id)
    for field, value in changes.items():
        setattr(category, field, value)
    db.commit()
    db.refresh(category)
    return category


def delete_category(db: Session, category_id: int) -> None:
    category = get_category(db, category_id)
    used_by = db.scalar(select(func.count(Course.id)).where(Course.category_id == category.id))
    if used_by:
        raise ConflictError(f"Category is used by {used_by} course(s)")
    db.delete(category)
    db.commit()
