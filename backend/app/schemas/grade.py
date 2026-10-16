from datetime import datetime
from typing import Annotated, Self

from pydantic import BaseModel, Field, StringConstraints, model_validator

from app.schemas.common import ORMModel

GradeTitle = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=120)]
Feedback = Annotated[str, StringConstraints(strip_whitespace=True, max_length=2_000)]
Score = Annotated[float, Field(ge=0, le=1_000)]
MaxScore = Annotated[float, Field(gt=0, le=1_000)]

SCORE_ABOVE_MAX = "Score cannot exceed the maximum score"


class GradeRead(ORMModel):
    id: int
    enrollment_id: int
    title: str
    score: float
    max_score: float
    percentage: float
    letter: str
    feedback: str | None
    created_at: datetime
    updated_at: datetime


class GradeCreate(BaseModel):
    title: GradeTitle
    score: Score
    max_score: MaxScore = 100
    feedback: Feedback | None = None

    @model_validator(mode="after")
    def score_within_max(self) -> Self:
        if self.score > self.max_score:
            raise ValueError(SCORE_ABOVE_MAX)
        return self


class GradeUpdate(BaseModel):
    title: GradeTitle | None = None
    score: Score | None = None
    max_score: MaxScore | None = None
    feedback: Feedback | None = None
