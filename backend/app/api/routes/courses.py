from fastapi import APIRouter, status

from app.api.deps import CourseFilterParams, DbSession, OptionalUser, Pagination, StaffUser
from app.schemas.common import Page
from app.schemas.course import CourseCreate, CourseDetail, CourseSummary, CourseUpdate
from app.services import course_service

router = APIRouter(prefix="/courses", tags=["Courses"])


@router.get("", response_model=Page[CourseSummary])
def list_catalog(db: DbSession, filters: CourseFilterParams, pagination: Pagination):
    """Public catalog of published courses with search, filters, sorting and pagination."""
    return course_service.list_catalog(db, filters, pagination)


@router.get("/manage", response_model=Page[CourseSummary])
def list_managed_courses(
    user: StaffUser, db: DbSession, filters: CourseFilterParams, pagination: Pagination
):
    """Courses the caller can manage, drafts included."""
    return course_service.list_managed(db, user, filters, pagination)


@router.get("/{course_id}", response_model=CourseDetail)
def read_course(course_id: int, db: DbSession, user: OptionalUser):
    return course_service.get_visible_course(db, course_id, user)


@router.post("", response_model=CourseDetail, status_code=status.HTTP_201_CREATED)
def create_course(data: CourseCreate, user: StaffUser, db: DbSession):
    return course_service.create_course(db, user, data)


@router.patch("/{course_id}", response_model=CourseDetail)
def update_course(course_id: int, data: CourseUpdate, user: StaffUser, db: DbSession):
    return course_service.update_course(db, user, course_id, data)


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(course_id: int, user: StaffUser, db: DbSession) -> None:
    course_service.delete_course(db, user, course_id)
