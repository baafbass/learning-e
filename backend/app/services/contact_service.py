from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models import ContactMessage
from app.schemas.common import Page, PageParams
from app.schemas.contact import ContactCreate, ContactRead
from app.services.pagination import paginate


def create_message(db: Session, data: ContactCreate) -> ContactMessage:
    message = ContactMessage(**data.model_dump())
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


def list_messages(
    db: Session, params: PageParams, is_read: bool | None = None
) -> Page[ContactRead]:
    statement = select(ContactMessage).order_by(
        ContactMessage.created_at.desc(), ContactMessage.id.desc()
    )
    if is_read is not None:
        statement = statement.where(ContactMessage.is_read.is_(is_read))
    return paginate(db, statement, params, ContactRead)


def _get_message(db: Session, message_id: int) -> ContactMessage:
    message = db.get(ContactMessage, message_id)
    if message is None:
        raise NotFoundError("Message not found")
    return message


def mark_read(db: Session, message_id: int, is_read: bool) -> ContactMessage:
    message = _get_message(db, message_id)
    message.is_read = is_read
    db.commit()
    db.refresh(message)
    return message


def delete_message(db: Session, message_id: int) -> None:
    db.delete(_get_message(db, message_id))
    db.commit()
