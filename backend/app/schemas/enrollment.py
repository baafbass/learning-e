from datetime import datetime

from pydantic import EmailStr

from app.models.enums import EnrollmentStatus
from app.schemas.common import ORMModel
from app.schemas.course import CourseRef, CourseSummary
from app.schemas.grade import GradeRead


class EnrollmentRead(ORMModel):
    id: int
    course_id: int
    status: EnrollmentStatus
    progress: int
    enrolled_at: datetime
    completed_at: datetime | None
    completed_lesson_ids: list[int]
    next_lesson_id: int | None
    average_score: float | None
    letter_grade: str | None
    grades: list[GradeRead]


class MyEnrollment(EnrollmentRead):
    """An enrollment seen by its student, with the course card attached."""

    course: CourseSummary


class StudentBrief(ORMModel):
    id: int
    full_name: str
    email: EmailStr
    avatar_url: str | None


class GradebookEntry(EnrollmentRead):
    """An enrollment seen by the course instructor, with the student attached."""

    student: StudentBrief


class StudentEnrollment(EnrollmentRead):
    """An enrollment listed on a student's record."""

    course: CourseRef
