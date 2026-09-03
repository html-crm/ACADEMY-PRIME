"""add documentary flag to videos

Revision ID: 6a7b8c9d0e1f
Revises: 5a1b2c3d4e5f
Create Date: 2026-08-30 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '6a7b8c9d0e1f'
down_revision: Union[str, None] = '5a1b2c3d4e5f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('videos', schema=None) as batch_op:
        batch_op.add_column(sa.Column('documentary', sa.Boolean(), nullable=False, server_default=sa.false()))


def downgrade() -> None:
    with op.batch_alter_table('videos', schema=None) as batch_op:
        batch_op.drop_column('documentary')
