"""add paid courses (video price/owner + video_purchases)

Revision ID: e6f5d4c3b2a1
Revises: d1e2f3a4b5c6
Create Date: 2026-08-31 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from sqlalchemy.dialects import postgresql


revision: str = 'e6f5d4c3b2a1'
down_revision: Union[str, None] = 'd1e2f3a4b5c6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('videos', schema=None) as batch_op:
        batch_op.add_column(sa.Column('is_paid', sa.Boolean(), nullable=False, server_default=sa.false()))
        batch_op.add_column(sa.Column('price_amount', sa.Numeric(24, 9), nullable=True))
        batch_op.add_column(sa.Column('owner_wallet', sa.String(length=64), nullable=True))

    op.create_table(
        'video_purchases',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('video_id', sa.Uuid(), nullable=False),
        sa.Column('amount', sa.Numeric(24, 9), nullable=False),
        sa.Column('wallet_address', sa.String(length=64), nullable=False),
        sa.Column('receiver_address', sa.String(length=64), nullable=False),
        sa.Column('tx_signature', sa.String(length=200), nullable=False),
        sa.Column('network', sa.String(length=30), nullable=False),
        sa.Column('confirmed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['video_id'], ['videos.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'video_id', name='uq_purchase_user_video'),
    )
    op.create_index(op.f('ix_video_purchases_tx_signature'), 'video_purchases', ['tx_signature'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_video_purchases_tx_signature'), table_name='video_purchases')
    op.drop_table('video_purchases')
    with op.batch_alter_table('videos', schema=None) as batch_op:
        batch_op.drop_column('owner_wallet')
        batch_op.drop_column('price_amount')
        batch_op.drop_column('is_paid')
