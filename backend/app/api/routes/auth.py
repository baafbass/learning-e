from fastapi import APIRouter, status

from app.api.deps import CurrentUser, DbSession
from app.core.security import create_access_token
from app.models import User
from app.schemas.user import (
    PasswordChange,
    ProfileUpdate,
    TokenResponse,
    UserLogin,
    UserRead,
    UserRegister,
)
from app.services import user_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _token_for(user: User) -> TokenResponse:
    return TokenResponse(
        access_token=create_access_token(user.id), user=UserRead.model_validate(user)
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserRegister, db: DbSession) -> TokenResponse:
    """Create a student or instructor account and sign it in."""
    return _token_for(user_service.register(db, data))


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: DbSession) -> TokenResponse:
    """Exchange email and password for a bearer token."""
    return _token_for(user_service.authenticate(db, data.email, data.password))


@router.get("/me", response_model=UserRead)
def read_profile(user: CurrentUser):
    return user


@router.patch("/me", response_model=UserRead)
def update_profile(data: ProfileUpdate, user: CurrentUser, db: DbSession):
    return user_service.update_profile(db, user, data)


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(data: PasswordChange, user: CurrentUser, db: DbSession) -> None:
    user_service.change_password(db, user, data)
