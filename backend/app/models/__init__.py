"""Import every model so SQLAlchemy registers all tables on `Base.metadata`."""

from app.models.category import Category
from app.models.contact import ContactMessage
from app.models.course import Course, Lesson
from app.models.enrollment import Enrollment, LessonCompletion
from app.models.enums import CourseLevel, EnrollmentStatus, UserRole
from app.models.grade import Grade
from app.models.user import User

__all__ = [
    "Category",
    "ContactMessage",
    "Course",
    "CourseLevel",
    "Enrollment",
    "EnrollmentStatus",
    "Grade",
    "Lesson",
    "LessonCompletion",
    "User",
    "UserRole",
]
