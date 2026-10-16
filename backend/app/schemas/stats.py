from pydantic import BaseModel

from app.schemas.user import UserRead


class PublicStats(BaseModel):
    courses: int
    students: int
    instructors: int
    categories: int


class TopCourse(BaseModel):
    id: int
    title: str
    instructor_name: str
    enrollment_count: int
    completed_count: int


class AdminStats(BaseModel):
    users: int
    students: int
    instructors: int
    admins: int
    courses: int
    published_courses: int
    draft_courses: int
    categories: int
    enrollments: int
    enrollments_in_progress: int
    enrollments_completed: int
    completion_rate: float
    average_grade: float | None
    unread_messages: int
    top_courses: list[TopCourse]
    recent_users: list[UserRead]
