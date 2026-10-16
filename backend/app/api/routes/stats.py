from fastapi import APIRouter

from app.api.deps import AdminUser, DbSession
from app.schemas.stats import AdminStats, PublicStats
from app.services import stats_service

router = APIRouter(tags=["Statistics"])


@router.get("/stats", response_model=PublicStats)
def public_stats(db: DbSession):
    return stats_service.public_stats(db)


@router.get("/admin/stats", response_model=AdminStats)
def admin_stats(_: AdminUser, db: DbSession):
    return stats_service.admin_stats(db)
