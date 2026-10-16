"""Reusable FastAPI dependencies: database session, current user, roles and query params."""

from collections.abc import Callable
from typing import Annotated

from fastapi import Depends, Query
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.exceptions import AuthenticationError, PermissionDeniedError
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models import CourseLevel, User, UserRole
from app.schemas.common import PageParams
from app.schemas.course import CourseFilters, CourseSort, PriceFilter, PublicationStatus

DbSession = Annotated[Session, Depends(get_db)]

_bearer = HTTPBearer(auto_error=False, description="Paste the access token from /auth/login")
BearerToken = Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)]


def get_optional_user(db: DbSession, credentials: BearerToken) -> User | None:
    """Resolve the user behind the bearer token, or None for anonymous requests."""
    if credentials is None:
        return None
    user_id = decode_access_token(credentials.credentials)
    user = db.get(User, user_id) if user_id is not None else None
    if user is None:
        raise AuthenticationError("Invalid or expired token")
    if not user.is_active:
        raise PermissionDeniedError("Account is deactivated")
    return user


def get_current_user(user: Annotated[User | None, Depends(get_optional_user)]) -> User:
    if user is None:
        raise AuthenticationError("Not authenticated")
    return user


OptionalUser = Annotated[User | None, Depends(get_optional_user)]
CurrentUser = Annotated[User, Depends(get_current_user)]


def require_roles(*roles: UserRole) -> Callable[[User], User]:
    def check_role(user: CurrentUser) -> User:
        if user.role not in roles:
            raise PermissionDeniedError("You do not have permission to perform this action")
        return user

    return check_role


AdminUser = Annotated[User, Depends(require_roles(UserRole.ADMIN))]
StaffUser = Annotated[User, Depends(require_roles(UserRole.INSTRUCTOR, UserRole.ADMIN))]
StudentUser = Annotated[User, Depends(require_roles(UserRole.STUDENT))]


def get_page_params(
    page: int = Query(1, ge=1, description="Page number, starting at 1"),
    size: int = Query(10, ge=1, le=100, description="Items per page"),
) -> PageParams:
    return PageParams(page=page, size=size)


Pagination = Annotated[PageParams, Depends(get_page_params)]


def get_course_filters(
    q: str | None = Query(None, max_length=100, description="Keyword in title or description"),
    category_id: int | None = Query(None, ge=1),
    level: CourseLevel | None = None,
    price: PriceFilter | None = None,
    instructor_id: int | None = Query(None, ge=1),
    status: PublicationStatus | None = Query(None, description="Management lists only"),
    sort: CourseSort = CourseSort.NEWEST,
) -> CourseFilters:
    keyword = q.strip() if q else None
    return CourseFilters(
        q=keyword or None,
        category_id=category_id,
        level=level,
        price=price,
        instructor_id=instructor_id,
        status=status,
        sort=sort,
    )


CourseFilterParams = Annotated[CourseFilters, Depends(get_course_filters)]
