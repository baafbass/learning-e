"""Create the database tables and optionally load demo data.

Usage:
    python -m app.db.init_db            # create missing tables
    python -m app.db.init_db --seed     # create tables and load demo data (empty database only)
    python -m app.db.init_db --reset    # drop everything, recreate and load demo data
"""

import argparse

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.db import seed_data
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models import (
    Category,
    ContactMessage,
    Course,
    CourseLevel,
    Enrollment,
    Grade,
    Lesson,
    LessonCompletion,
    User,
    UserRole,
)
from app.services import progress_service


def _create_user(db: Session, role: UserRole, password: str, **fields: str) -> User:
    user = User(role=role, hashed_password=hash_password(password), **fields)
    db.add(user)
    return user


def seed(db: Session) -> None:
    passwords = seed_data.DEMO_PASSWORDS
    admin = _create_user(db, UserRole.ADMIN, passwords["admin"], **seed_data.ADMIN)

    instructors = {}
    for data in seed_data.INSTRUCTORS:
        fields = {k: v for k, v in data.items() if k != "key"}
        instructors[data["key"]] = _create_user(
            db, UserRole.INSTRUCTOR, passwords["instructor"], **fields
        )

    students = {
        data["email"]: _create_user(db, UserRole.STUDENT, passwords["student"], **data)
        for data in seed_data.STUDENTS
    }

    categories = {data["name"]: Category(**data) for data in seed_data.CATEGORIES}
    db.add_all(categories.values())

    courses = {}
    for data in seed_data.COURSES:
        course = Course(
            title=data["title"],
            summary=data["summary"],
            description=(
                f"{data['summary']} This course combines short video-style lessons, worked "
                "examples and hands-on exercises. Every lesson builds on the previous one, so "
                "by the end you will have the confidence to apply these skills in real projects."
            ),
            outcomes=data["outcomes"],
            level=CourseLevel(data["level"]),
            price=data["price"],
            duration_hours=data["duration_hours"],
            is_published=data.get("is_published", True),
            category=categories[data["category"]],
            instructor=instructors[data["instructor"]],
            lessons=[
                Lesson(
                    title=title,
                    content=seed_data.lesson_content(data["title"], title),
                    duration_minutes=10 + 5 * (position % 4),
                    position=position,
                )
                for position, title in enumerate(data["lessons"], start=1)
            ],
        )
        db.add(course)
        courses[data["title"]] = course

    for email, course_title, completed, grades in seed_data.ENROLLMENTS:
        course = courses[course_title]
        enrollment = Enrollment(
            student=students[email],
            course=course,
            completions=[LessonCompletion(lesson=lesson) for lesson in course.lessons[:completed]],
            grades=[
                Grade(title=t, score=s, max_score=m, feedback=f, graded_by=course.instructor)
                for t, s, m, f in grades
            ],
        )
        db.add(enrollment)

    db.add_all(ContactMessage(**data) for data in seed_data.CONTACT_MESSAGES)
    db.flush()

    for enrollment in db.scalars(select(Enrollment)):
        progress_service.refresh_enrollment(db, enrollment)
    db.commit()
    print(f"Seeded demo data. Admin login: {admin.email} / {passwords['admin']}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Initialise the LearnHub database.")
    parser.add_argument("--seed", action="store_true", help="load demo data into an empty database")
    parser.add_argument("--reset", action="store_true", help="drop all tables first (destructive)")
    args = parser.parse_args()

    if args.reset:
        Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Tables are ready.")

    if args.seed or args.reset:
        with SessionLocal() as db:
            if db.scalar(select(User.id).limit(1)) is not None:
                print("Database already contains users; skipping seed. Use --reset to start over.")
                return
            seed(db)


if __name__ == "__main__":
    main()
