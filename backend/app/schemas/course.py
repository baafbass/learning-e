from dataclasses import dataclass
from datetime import datetime
from enum import StrEnum
from typing import Annotated

from pydantic import BaseModel, Field, StringConstraints

from app.models.enums import CourseLevel
from app.schemas.category import CategoryBrief
from app.schemas.common import HttpUrlStr, ORMModel
from app.schemas.lesson import LessonOutline
from app.schemas.user import InstructorProfile, UserBrief

Title = Annotated[str, StringConstraints(strip_whitespace=True, min_length=3, max_length=200)]
Summary = Annotated[str, StringConstraints(strip_whitespace=True, min_length=10, max_length=300)]
Description = Annotated[str, StringConstraints(strip_whitespace=True, min_length=20)]
Outcome = Annotated[str, StringConstraints(strip_whitespace=True, min_length=3, max_length=200)]
Price = Annotated[float, Field(ge=0, le=10_000)]
DurationHours = Annotated[int, Field(ge=0, le=1_000)]


class CourseSort(StrEnum):
    NEWEST = "newest"
    OLDEST = "oldest"
    TITLE = "title"
    POPULAR = "popular"


class PriceFilter(StrEnum):
    FREE = "free"
    PAID = "paid"


class PublicationStatus(StrEnum):
    PUBLISHED = "published"
    DRAFT = "draft"


@dataclass(frozen=True)
class CourseFilters:
    q: str | None = None
    category_id: int | None = None
    level: CourseLevel | None = None
    price: PriceFilter | None = None
    instructor_id: int | None = None
    status: PublicationStatus | None = None
    sort: CourseSort = CourseSort.NEWEST


class CourseCreate(BaseModel):
    title: Title
    summary: Summary
    description: Description
    outcomes: list[Outcome] = Field(default_factory=list, max_length=12)
    level: CourseLevel = CourseLevel.BEGINNER
    price: Price = 0
    duration_hours: DurationHours = 0
    thumbnail_url: HttpUrlStr | None = None
    is_published: bool = False
    category_id: int


class CourseUpdate(BaseModel):
    title: Title | None = None
    summary: Summary | None = None
    description: Description | None = None
    outcomes: list[Outcome] | None = Field(default=None, max_length=12)
    level: CourseLevel | None = None
    price: Price | None = None
    duration_hours: DurationHours | None = None
    thumbnail_url: HttpUrlStr | None = None
    is_published: bool | None = None
    category_id: int | None = None


class CourseRef(ORMModel):
    id: int
    title: str
    level: CourseLevel
    thumbnail_url: str | None


class CourseSummary(CourseRef):
    summary: str
    price: float
    duration_hours: int
    is_published: bool
    lesson_count: int
    enrollment_count: int
    category: CategoryBrief
    instructor: UserBrief
    created_at: datetime
    updated_at: datetime


class CourseDetail(CourseSummary):
    description: str
    outcomes: list[str]
    category_id: int
    instructor: InstructorProfile
    lessons: list[LessonOutline]
