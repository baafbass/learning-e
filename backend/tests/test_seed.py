from sqlalchemy import select

from app.db.init_db import seed
from app.models import Enrollment, EnrollmentStatus


def test_seed_loads_consistent_demo_data(client, db):
    seed(db)

    stats = client.get("/api/stats").json()
    catalog = client.get("/api/courses", params={"sort": "popular"}).json()
    completed = db.scalars(
        select(Enrollment).where(Enrollment.status == EnrollmentStatus.COMPLETED)
    ).all()

    assert stats["courses"] == 11 and stats["students"] == 6 and stats["instructors"] == 3
    assert catalog["items"][0]["title"] == "Modern Angular from Scratch"
    assert completed and all(enrollment.progress == 100 for enrollment in completed)
