#!/bin/sh
set -eu

cd /app/backend
python3 -m uvicorn main:app --host 127.0.0.1 --port 8000 &

cd /app/frontend
exec npm run start
