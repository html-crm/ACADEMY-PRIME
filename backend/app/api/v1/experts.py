from fastapi import APIRouter, HTTPException, Request, status

from app.core.deps import CurrentUser, DbSession
from app.models.enums import ExpertStatus
from app.models.expert import Expert
from app.schemas.expert import ExpertApplyIn, ExpertOut, ExpertUpdateIn
from app.services import audit_service, notification_service

router = APIRouter(prefix="/experts", tags=["experts"])


def _get_own_expert(user: CurrentUser, db: DbSession) -> Expert:
    expert = db.query(Expert).filter(Expert.user_id == user.id).first()
    if expert is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "not_an_expert", "message": "No expert application found."},
        )
    return expert


@router.post("/apply", response_model=ExpertOut, status_code=status.HTTP_201_CREATED)
def apply(data: ExpertApplyIn, request: Request, user: CurrentUser, db: DbSession) -> ExpertOut:
    existing = db.query(Expert).filter(Expert.user_id == user.id).first()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": "already_applied", "message": "An expert application already exists."},
        )
    expert = Expert(
        user_id=user.id,
        display_name=data.display_name,
        headline=data.headline,
        bio=data.bio,
        links=data.links,
    )
    db.add(expert)
    db.commit()
    db.refresh(expert)
    notification_service.notify(db, user.id, "notification.expert.application_received")
    audit_service.log(
        db, "expert.applied", actor=user, entity_type="expert", entity_id=str(expert.id), request=request
    )
    return ExpertOut.model_validate(expert)


@router.get("/me", response_model=ExpertOut)
def my_expert_profile(user: CurrentUser, db: DbSession) -> ExpertOut:
    return ExpertOut.model_validate(_get_own_expert(user, db))


@router.put("/me", response_model=ExpertOut)
def update_my_expert_profile(data: ExpertUpdateIn, user: CurrentUser, db: DbSession) -> ExpertOut:
    expert = _get_own_expert(user, db)
    if expert.status not in (ExpertStatus.PENDING, ExpertStatus.APPROVED):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": "not_editable", "message": "Profile cannot be edited in current status."},
        )
    updates = data.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(expert, field, value)
    db.commit()
    db.refresh(expert)
    return ExpertOut.model_validate(expert)
