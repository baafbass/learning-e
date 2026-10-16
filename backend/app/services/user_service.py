"""Accounts: registration, authentication, profiles and admin user management."""

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.core.exceptions import (
    AuthenticationError,
    BadRequestError,
    ConflictError,
    NotFoundError,
    PermissionDeniedError,
)
from app.core.security import hash_password, verify_password
from app.models import User, UserRole
from app.schemas.common import Page, PageParams
from app.schemas.user import PasswordChange, ProfileUpdate, UserAdminUpdate, UserRead, UserRegister
from app.services.pagination import paginate


def get_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email.lower()))


def get_user(db: Session, user_id: int) -> User:
    user = db.get(User, user_id)
    if user is None:
        raise NotFoundError("User not found")
    return user


def register(db: Session, data: UserRegister) -> User:
    if get_by_email(db, data.email):
        raise ConflictError("Email is already registered")
    user = User(
        full_name=data.full_name,
        email=data.email.lower(),
        hashed_password=hash_password(data.password),
        role=data.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate(db: Session, email: str, password: str) -> User:
    user = get_by_email(db, email)
    if user is None or not verify_password(password, user.hashed_password):
        raise AuthenticationError("Invalid email or password")
    if not user.is_active:
        raise PermissionDeniedError("Account is deactivated")
    return user


def update_profile(db: Session, user: User, data: ProfileUpdate) -> User:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


def change_password(db: Session, user: User, data: PasswordChange) -> None:
    if not verify_password(data.current_password, user.hashed_password):
        raise BadRequestError("Current password is incorrect")
    user.hashed_password = hash_password(data.new_password)
    db.commit()


def list_users(
    db: Session,
    params: PageParams,
    q: str | None = None,
    role: UserRole | None = None,
    is_active: bool | None = None,
) -> Page[UserRead]:
    statement = select(User).order_by(User.created_at.desc(), User.id.desc())
    if q:
        pattern = f"%{q}%"
        statement = statement.where(or_(User.full_name.ilike(pattern), User.email.ilike(pattern)))
    if role:
        statement = statement.where(User.role == role)
    if is_active is not None:
        statement = statement.where(User.is_active.is_(is_active))
    return paginate(db, statement, params, UserRead)


def admin_update(db: Session, actor: User, user_id: int, data: UserAdminUpdate) -> User:
    user = get_user(db, user_id)
    changes = data.model_dump(exclude_unset=True, exclude_none=True)
    is_self = user.id == actor.id
    if is_self and (
        changes.get("role", user.role) != user.role or changes.get("is_active") is False
    ):
        raise BadRequestError("You cannot change your own role or deactivate yourself")
    for field, value in changes.items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, actor: User, user_id: int) -> None:
    user = get_user(db, user_id)
    if user.id == actor.id:
        raise BadRequestError("You cannot delete your own account")
    db.delete(user)
    db.commit()
