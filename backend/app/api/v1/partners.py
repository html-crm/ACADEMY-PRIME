from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select

from app.core.deps import DbSession, RequireAdmin, require_roles
from app.models.enums import UserRole
from app.models.partner import Partner

public = APIRouter(prefix="/content", tags=["content"])

admin_api = APIRouter(
    prefix="/admin",
    tags=["admin-partners"],
    dependencies=[Depends(require_roles(UserRole.ADMIN))],
)


class PartnerPublicOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    logo_url: str | None
    website_url: str | None
    description: str | None


class PartnerIn(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    logo_url: str | None = Field(default=None, max_length=500)
    website_url: str | None = Field(default=None, max_length=500)
    description: str | None = Field(default=None, max_length=1000)
    is_active: bool = True
    sort_order: int = Field(default=0, ge=0)


class PartnerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    logo_url: str | None
    website_url: str | None
    description: str | None
    is_active: bool
    sort_order: int


@public.get("/partners", response_model=list[PartnerPublicOut])
def list_public_partners(db: DbSession) -> list[PartnerPublicOut]:
    rows = db.scalars(
        select(Partner)
        .where(Partner.is_active.is_(True))
        .order_by(Partner.sort_order, Partner.name)
    ).all()
    return [PartnerPublicOut.model_validate(r) for r in rows]


@admin_api.get("/partners", response_model=list[PartnerOut])
def admin_list_partners(admin: RequireAdmin, db: DbSession) -> list[PartnerOut]:
    rows = db.scalars(select(Partner).order_by(Partner.sort_order, Partner.name)).all()
    return [PartnerOut.model_validate(r) for r in rows]


@admin_api.post("/partners", response_model=PartnerOut, status_code=status.HTTP_201_CREATED)
def admin_create_partner(data: PartnerIn, admin: RequireAdmin, db: DbSession) -> PartnerOut:
    partner = Partner(**data.model_dump())
    db.add(partner)
    db.commit()
    db.refresh(partner)
    return PartnerOut.model_validate(partner)


@admin_api.patch("/partners/{partner_id}", response_model=PartnerOut)
def admin_update_partner(
    partner_id: UUID, data: PartnerIn, admin: RequireAdmin, db: DbSession
) -> PartnerOut:
    partner = db.get(Partner, partner_id)
    if partner is None:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={"code": "partner_not_found", "message": "Partner not found."},
        )
    for key, value in data.model_dump().items():
        setattr(partner, key, value)
    db.commit()
    db.refresh(partner)
    return PartnerOut.model_validate(partner)


@admin_api.delete("/partners/{partner_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_partner(partner_id: UUID, admin: RequireAdmin, db: DbSession) -> None:
    partner = db.get(Partner, partner_id)
    if partner is None:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail={"code": "partner_not_found", "message": "Partner not found."},
        )
    db.delete(partner)
    db.commit()
