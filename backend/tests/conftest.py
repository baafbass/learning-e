"""Shared fixtures: an isolated in-memory database and helpers to create users and courses."""

import os

os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-with-enough-length")
os.environ.setdefault("AUTO_CREATE_TABLES", "false")

from collections.abc import Callable, Iterator  # noqa: E402

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy.orm import Session, sessionmaker  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

from app.core.security import create_access_token, hash_password  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.db.session import create_db_engine, get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.models import Category, User, UserRole  # noqa: E402

PASSWORD = "Secret123"


@pytest.fixture
def db() -> Iterator[Session]:
    engine = create_db_engine("sqlite://", poolclass=StaticPool)
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine, autoflush=False)
    with session_factory() as session:
        app.dependency_overrides[get_db] = lambda: session
        yield session
    app.dependency_overrides.clear()
    engine.dispose()


@pytest.fixture
def client(db: Session) -> TestClient:
    return TestClient(app)


@pytest.fixture
def make_user(db: Session) -> Callable[..., User]:
    counter = iter(range(1, 1_000))

    def _make(role: UserRole = UserRole.STUDENT, **fields) -> User:
        number = next(counter)
        user = User(
            full_name=fields.pop("full_name", f"{role.value.title()} {number}"),
            email=fields.pop("email", f"{role.value}{number}@test.dev"),
            hashed_password=hash_password(PASSWORD),
            role=role,
            **fields,
        )
        db.add(user)
        db.commit()
        return user

    return _make


def auth_headers(user: User) -> dict[str, str]:
    return {"Authorization": f"Bearer {create_access_token(user.id)}"}


@pytest.fixture
def category(db: Session) -> Category:
    category = Category(name="Web Development", icon="code")
    db.add(category)
    db.commit()
    return category


@pytest.fixture
def make_course(client: TestClient, category: Category) -> Callable[..., dict]:
    def _make(instructor: User, lessons: int = 0, **fields) -> dict:
        payload = {
            "title": "Intro to Testing",
            "summary": "Learn how to test web applications.",
            "description": "A practical course about automated testing for APIs.",
            "category_id": category.id,
            "is_published": True,
            **fields,
        }
        response = client.post("/api/courses", json=payload, headers=auth_headers(instructor))
        assert response.status_code == 201, response.text
        course = response.json()
        for position in range(1, lessons + 1):
            lesson = {
                "title": f"Lesson {position}",
                "content": "Lesson content here.",
                "position": position,
            }
            created = client.post(
                f"/api/courses/{course['id']}/lessons",
                json=lesson,
                headers=auth_headers(instructor),
            )
            assert created.status_code == 201, created.text
        return client.get(f"/api/courses/{course['id']}", headers=auth_headers(instructor)).json()

    return _make
