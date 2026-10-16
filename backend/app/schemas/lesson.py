from typing import Annotated

from pydantic import BaseModel, Field, StringConstraints

from app.schemas.common import HttpUrlStr, ORMModel

LessonTitle = Annotated[str, StringConstraints(strip_whitespace=True, min_length=3, max_length=200)]
LessonContent = Annotated[str, StringConstraints(strip_whitespace=True, min_length=10)]
Minutes = Annotated[int, Field(ge=0, le=600)]
Position = Annotated[int, Field(ge=1, le=1_000)]


class LessonOutline(ORMModel):
    id: int
    title: str
    duration_minutes: int
    position: int


class LessonRead(LessonOutline):
    course_id: int
    content: str
    video_url: str | None


class LessonCreate(BaseModel):
    title: LessonTitle
    content: LessonContent
    video_url: HttpUrlStr | None = None
    duration_minutes: Minutes = 10
    position: Position = 1


class LessonUpdate(BaseModel):
    title: LessonTitle | None = None
    content: LessonContent | None = None
    video_url: HttpUrlStr | None = None
    duration_minutes: Minutes | None = None
    position: Position | None = None
