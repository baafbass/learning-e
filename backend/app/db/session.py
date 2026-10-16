"""Database engine and session factory."""

from collections.abc import Iterator
from typing import Any

from sqlalchemy import Engine, create_engine, event
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings


def _enable_sqlite_foreign_keys(dbapi_connection: Any, _: Any) -> None:
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


def create_db_engine(url: str, **kwargs: Any) -> Engine:
    """Create an engine tuned for Neon PostgreSQL, with SQLite support for tests."""
    if url.startswith("sqlite"):
        engine = create_engine(url, connect_args={"check_same_thread": False}, **kwargs)
        event.listen(engine, "connect", _enable_sqlite_foreign_keys)
        return engine
    # Neon suspends idle computes, so stale pooled connections are checked before use.
    return create_engine(url, pool_pre_ping=True, pool_recycle=300, **kwargs)


engine = create_db_engine(settings.database_url)
SessionLocal = sessionmaker(bind=engine, autoflush=False)


def get_db() -> Iterator[Session]:
    with SessionLocal() as session:
        yield session
