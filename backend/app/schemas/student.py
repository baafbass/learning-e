from datetime import datetime

from pydantic import BaseModel, EmailStr

from app.schemas.enrollment import StudentEnrollment


class StudentListItem(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    avatar_url: str | None
    is_active: bool
    created_at: datetime
    enrollment_count: int
    completed_count: int
    average_score: float | None


class StudentDetail(StudentListItem):
    bio: str | None
    enrollments: list[StudentEnrollment]
