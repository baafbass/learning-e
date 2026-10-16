from fastapi import APIRouter, status

from app.api.deps import AdminUser, DbSession, Pagination
from app.schemas.common import Page
from app.schemas.contact import ContactCreate, ContactRead, ContactUpdate
from app.services import contact_service

router = APIRouter(prefix="/contact", tags=["Contact"])


@router.post("", response_model=ContactRead, status_code=status.HTTP_201_CREATED)
def send_message(data: ContactCreate, db: DbSession):
    return contact_service.create_message(db, data)


@router.get("", response_model=Page[ContactRead])
def list_messages(_: AdminUser, db: DbSession, pagination: Pagination, is_read: bool | None = None):
    return contact_service.list_messages(db, pagination, is_read)


@router.patch("/{message_id}", response_model=ContactRead)
def update_message(message_id: int, data: ContactUpdate, _: AdminUser, db: DbSession):
    return contact_service.mark_read(db, message_id, data.is_read)


@router.delete("/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_message(message_id: int, _: AdminUser, db: DbSession) -> None:
    contact_service.delete_message(db, message_id)
