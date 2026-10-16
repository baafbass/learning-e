from fastapi import APIRouter

from app.api.routes import (
    auth,
    categories,
    contact,
    courses,
    enrollments,
    grades,
    lessons,
    stats,
    students,
    users,
)

api_router = APIRouter()

for module in (
    auth,
    users,
    categories,
    courses,
    lessons,
    enrollments,
    grades,
    students,
    stats,
    contact,
):
    api_router.include_router(module.router)


@api_router.get("/health", tags=["Health"])
def health() -> dict[str, str]:
    return {"status": "ok"}
