from math import ceil
from typing import TypeVar

from pydantic import BaseModel
from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.schemas.common import Page, PageParams

SchemaT = TypeVar("SchemaT", bound=BaseModel)


def paginate(
    db: Session, statement: Select, params: PageParams, schema: type[SchemaT]
) -> Page[SchemaT]:
    """Run `statement` for one page and wrap the rows, converted to `schema`, in a Page."""
    total = db.scalar(select(func.count()).select_from(statement.order_by(None).subquery())) or 0
    rows = db.scalars(statement.limit(params.size).offset(params.offset)).unique().all()
    return Page[schema](
        items=[schema.model_validate(row) for row in rows],
        total=total,
        page=params.page,
        size=params.size,
        pages=ceil(total / params.size),
    )
