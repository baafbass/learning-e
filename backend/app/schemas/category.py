from typing import Annotated

from pydantic import BaseModel, StringConstraints

from app.schemas.common import ORMModel

CategoryName = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=80)]
CategoryDescription = Annotated[str, StringConstraints(strip_whitespace=True, max_length=255)]
IconName = Annotated[str, StringConstraints(pattern=r"^[a-z_]{2,50}$")]


class CategoryBrief(ORMModel):
    id: int
    name: str
    icon: str


class CategoryRead(CategoryBrief):
    description: str | None
    course_count: int


class CategoryCreate(BaseModel):
    name: CategoryName
    description: CategoryDescription | None = None
    icon: IconName = "category"


class CategoryUpdate(BaseModel):
    name: CategoryName | None = None
    description: CategoryDescription | None = None
    icon: IconName | None = None
