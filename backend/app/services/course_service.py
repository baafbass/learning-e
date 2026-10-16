"""Course catalog, authoring and ownership rules."""

from dataclasses import replace

from sqlalchemy import Select, or_, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.core.exceptions import BadRequestError, NotFoundError, PermissionDeniedError
from app.models import Category, Course, User, UserRole
from app.schemas.common import Page, PageParams
from app.schemas.course import (
    CourseCreate,
    CourseFilters,
    CourseSort,
    CourseSummary,
    CourseUpdate,
    PriceFilter,
    PublicationStatus,
)
from app.services.pagination import paginate

_SORT_ORDER = {
    CourseSort.NEWEST: (Course.created_at.desc(), Course.id.desc()),
    CourseSort.OLDEST: (Course.created_at.asc(), Course.id.asc()),
    CourseSort.TITLE: (Course.title.asc(),),
    CourseSort.POPULAR: (Course.enrollment_count.desc(), Course.created_at.desc()),
}


def can_manage(user: User | None, course: Course) -> bool:
    return user is not None and (user.role == UserRole.ADMIN or course.instructor_id == user.id)


def ensure_can_manage(user: User, course: Course) -> None:
    if not can_manage(user, course):
        raise PermissionDeniedError("You can only manage your own courses")


def _base_query() -> Select[tuple[Course]]:
    return select(Course).options(joinedload(Course.category), joinedload(Course.instructor))


def _apply_filters(statement: Select, filters: CourseFilters) -> Select:
    if filters.q:
        pattern = f"%{filters.q}%"
        statement = statement.where(
            or_(
                Course.title.ilike(pattern),
                Course.summary.ilike(pattern),
                Course.description.ilike(pattern),
            )
        )
    if filters.category_id:
        statement = statement.where(Course.category_id == filters.category_id)
    if filters.level:
        statement = statement.where(Course.level == filters.level)
    if filters.price == PriceFilter.FREE:
        statement = statement.where(Course.price == 0)
    elif filters.price == PriceFilter.PAID:
        statement = statement.where(Course.price > 0)
    if filters.instructor_id:
        statement = statement.where(Course.instructor_id == filters.instructor_id)
    if filters.status:
        statement = statement.where(
            Course.is_published.is_(filters.status == PublicationStatus.PUBLISHED)
        )
    return statement.order_by(*_SORT_ORDER[filters.sort])


def list_catalog(db: Session, filters: CourseFilters, params: PageParams) -> Page[CourseSummary]:
    """Published courses only; the publication status filter does not apply here."""
    public_filters = replace(filters, status=None)
    statement = _base_query().where(Course.is_published.is_(True))
    return paginate(db, _apply_filters(statement, public_filters), params, CourseSummary)


def list_managed(
    db: Session, user: User, filters: CourseFilters, params: PageParams
) -> Page[CourseSummary]:
    """Instructors see their own courses (drafts included); admins see every course."""
    statement = _base_query()
    if user.role != UserRole.ADMIN:
        statement = statement.where(Course.instructor_id == user.id)
    return paginate(db, _apply_filters(statement, filters), params, CourseSummary)


def get_course(db: Session, course_id: int) -> Course:
    course = db.scalar(
        _base_query().options(selectinload(Course.lessons)).where(Course.id == course_id)
    )
    if course is None:
        raise NotFoundError("Course not found")
    return course


def get_visible_course(db: Session, course_id: int, user: User | None) -> Course:
    """Drafts are reported as missing to anyone who cannot manage them."""
    course = get_course(db, course_id)
    if not course.is_published and not can_manage(user, course):
        raise NotFoundError("Course not found")
    return course


def _ensure_category_exists(db: Session, category_id: int) -> None:
    if db.get(Category, category_id) is None:
        raise BadRequestError("Selected category does not exist")


def create_course(db: Session, instructor: User, data: CourseCreate) -> Course:
    _ensure_category_exists(db, data.category_id)
    course = Course(**data.model_dump(), instructor_id=instructor.id)
    db.add(course)
    db.commit()
    return get_course(db, course.id)


def update_course(db: Session, user: User, course_id: int, data: CourseUpdate) -> Course:
    course = get_course(db, course_id)
    ensure_can_manage(user, course)
    changes = data.model_dump(exclude_unset=True)
    if changes.get("category_id"):
        _ensure_category_exists(db, changes["category_id"])
    for field, value in changes.items():
        setattr(course, field, value)
    db.commit()
    return get_course(db, course.id)


def delete_course(db: Session, user: User, course_id: int) -> None:
    course = get_course(db, course_id)
    ensure_can_manage(user, course)
    db.delete(course)
    db.commit()
