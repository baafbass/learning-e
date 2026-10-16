"""Enumerations shared by models and schemas."""

from enum import StrEnum

from sqlalchemy import Enum as SAEnum


class UserRole(StrEnum):
    STUDENT = "student"
    INSTRUCTOR = "instructor"
    ADMIN = "admin"


class CourseLevel(StrEnum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class EnrollmentStatus(StrEnum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


def db_enum(enum_class: type[StrEnum]) -> SAEnum:
    """Store enum values (not names) in a portable VARCHAR column with a CHECK constraint."""
    return SAEnum(
        enum_class,
        native_enum=False,
        length=20,
        values_callable=lambda members: [member.value for member in members],
        validate_strings=True,
    )
