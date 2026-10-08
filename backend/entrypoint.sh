#!/bin/bash
set -e

echo "Running migrations..."
cd /app

DATA_DIR="/data"
DATA_DB="$DATA_DIR/academic_prime.db"
IMAGE_DB="/app/academic_prime.db"

# Migrate the DB to the persistent volume on first boot. If a volume DB already
# exists, keep it as-is (it holds all live data and must survive every redeploy).
# Only copy the committed image DB once so a fresh volume starts from the current
# schema + seed data instead of an empty database.
if [ ! -f "$DATA_DB" ]; then
  echo "No persistent DB on volume; initializing from committed DB..."
  mkdir -p "$DATA_DIR"
  if [ -f "$IMAGE_DB" ]; then
    cp "$IMAGE_DB" "$DATA_DB"
    echo "Copied committed DB ($IMAGE_DB) to volume ($DATA_DB)."
  else
    echo "No committed DB present; volume will start empty."
  fi
fi

# If the volume DB already has tables but no alembic version tracking (e.g.
# created by create_all/seed), stamp it to the baseline that produced its current
# schema so incremental migrations apply cleanly instead of replaying every
# migration and failing on "table already exists".
python - <<'PY'
import os, sqlite3, sys
db = "/data/academic_prime.db"
if not os.path.exists(db):
    sys.exit(0)
try:
    con = sqlite3.connect(db)
    has_ver = con.execute(
        "select name from sqlite_master where type='table' and name='alembic_version'"
    ).fetchone()
    con.close()
except Exception:
    sys.exit(1)
sys.exit(0 if has_ver else 1)
PY
if [ $? -eq 1 ]; then
  echo "Existing DB without alembic version table; stamping baseline..."
  alembic stamp 5a1b2c3d4e5f
fi
alembic upgrade head || echo "WARNING: Migration failed (tables may already exist), continuing..."

echo "Seeding demo data..."
python scripts/seed_demo.py

echo "Starting server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
