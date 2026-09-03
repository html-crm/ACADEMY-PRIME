"""widen video provider and format enums

Revision ID: 5a1b2c3d4e5f
Revises: eed83c6a1761
Create Date: 2026-08-27 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '5a1b2c3d4e5f'
down_revision: Union[str, None] = 'eed83c6a1761'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


PROVIDER_ENUM = sa.Enum(
    'youtube', 'instagram', 'vimeo', 'tiktok', 'dailymotion', 'external', 'uploaded',
    name='videoprovider', native_enum=False, length=30,
)

FORMAT_ENUM = sa.Enum(
    'short', 'long', 'course',
    name='videoformat', native_enum=False, length=30,
)


def upgrade() -> None:
    with op.batch_alter_table('videos', schema=None) as batch_op:
        batch_op.alter_column('provider', existing_type=PROVIDER_ENUM, type_=PROVIDER_ENUM, existing_nullable=False)
        batch_op.alter_column('format', existing_type=FORMAT_ENUM, type_=FORMAT_ENUM, existing_nullable=False)


def downgrade() -> None:
    old_provider = sa.Enum('youtube', 'instagram', 'vimeo', 'uploaded', name='videoprovider', native_enum=False, length=30)
    old_format = sa.Enum('short', 'long', name='videoformat', native_enum=False, length=30)
    with op.batch_alter_table('videos', schema=None) as batch_op:
        batch_op.alter_column('format', existing_type=FORMAT_ENUM, type_=old_format, existing_nullable=False)
        batch_op.alter_column('provider', existing_type=PROVIDER_ENUM, type_=old_provider, existing_nullable=False)
