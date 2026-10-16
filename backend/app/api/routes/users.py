from fastapi import APIRouter, Query, status

from app.api.deps import AdminUser, DbSession, Pagination
from app.models import UserRole
from app.schemas.common import Page
from app.schemas.user import UserAdminUpdate, UserRead
from app.services import user_service

router = APIRouter(prefix="/users", tags=["Users (admin)"])


@router.get("", response_model=Page[UserRead])
def list_users(
    _: AdminUser,
    db: DbSession,
    pagination: Pagination,
    q: str | None = Query(None, max_length=100, description="Name or email"),
    role: UserRole | None = None,
    is_active: bool | None = None,
):
    return user_service.list_users(db, pagination, q=q, role=role, is_active=is_active)


@router.get("/{user_id}", response_model=UserRead)
def read_user(user_id: int, _: AdminUser, db: DbSession):
    return user_service.get_user(db, user_id)


@router.patch("/{user_id}", response_model=UserRead)
def update_user(user_id: int, data: UserAdminUpdate, admin: AdminUser, db: DbSession):
    return user_service.admin_update(db, admin, user_id, data)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, admin: AdminUser, db: DbSession) -> None:
    user_service.delete_user(db, admin, user_id)
