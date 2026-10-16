from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, EmailStr, StringConstraints

from app.schemas.common import ORMModel


class ContactCreate(BaseModel):
    name: Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=120)]
    email: EmailStr
    subject: Annotated[str, StringConstraints(strip_whitespace=True, min_length=3, max_length=200)]
    message: Annotated[
        str, StringConstraints(strip_whitespace=True, min_length=10, max_length=5_000)
    ]


class ContactRead(ORMModel):
    id: int
    name: str
    email: str
    subject: str
    message: str
    is_read: bool
    created_at: datetime


class ContactUpdate(BaseModel):
    is_read: bool
