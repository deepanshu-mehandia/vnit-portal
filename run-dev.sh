#!/bin/bash

echo "Starting Backend..."

cd vnit_portal_backend
source venv/bin/activate
uvicorn app.main:app --reload &

BACKEND_PID=$!

echo "Starting Frontend..."

cd ../vnit-portal-frontend
npm run dev &

FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

wait
