#!/bin/bash
set -e

echo "Running migrations..."
cd /app
alembic upgrade head

echo "Seeding demo data..."
python -m scripts.seed_demo

echo "Starting server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
