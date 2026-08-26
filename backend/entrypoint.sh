#!/bin/bash
set -e

echo "Running migrations..."
cd /app
alembic upgrade head || echo "WARNING: Migration failed (tables may already exist), continuing..."

echo "Seeding demo data..."
python scripts/seed_demo.py

echo "Starting server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
