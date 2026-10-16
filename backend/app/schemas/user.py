from datetime import datetime
from typing import Annotated, Literal

from pydantic import AfterValidator, BaseModel, EmailStr, Field, StringConstraints

from app.models.enums import UserRole
from app.schemas.common import HttpUrlStr, ORMModel


def _check_password_strength(password: str) -> str:
    if not any(char.isalpha() for char in password) or not any(char.isdigit() for char in password):
        raise ValueError("Password must contain at least one letter and one digit")
    return password


Password = Annotated[
    str, StringConstraints(min_length=8, max_length=72), AfterValidator(_check_password_strength)
]
FullName = Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=120)]


class UserBrief(ORMModel):
    id: int
    full_name: str
    avatar_url: str | None


class InstructorProfile(UserBrief):
    bio: str | None


class UserRead(ORMModel):
    id: int
    full_name: str
    email: EmailStr
    role: UserRole
    bio: str | None
    avatar_url: str | None
    is_active: bool
    created_at: datetime


class UserRegister(BaseModel):
    full_name: FullName
    email: EmailStr
    password: Password
    role: Literal[UserRole.STUDENT, UserRole.INSTRUCTOR] = UserRole.STUDENT


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class ProfileUpdate(BaseModel):
    full_name: FullName | None = None
    bio: Annotated[str, StringConstraints(max_length=1000)] | None = None
    avatar_url: HttpUrlStr | None = None


class PasswordChange(BaseModel):
    current_password: str = Field(min_length=1, max_length=72)
    new_password: Password


class UserAdminUpdate(BaseModel):
    full_name: FullName | None = None
    role: UserRole | None = None
    is_active: bool | None = None
