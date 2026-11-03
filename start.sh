#!/bin/sh
set -e

echo "=== [MusicStudio Pro Production Bootloader] ==="
PORT="${PORT:-3000}"
export PORT
export HOSTNAME="0.0.0.0"

echo "[BOOT] Target Public Port: $PORT"
echo "[BOOT] Internal Backend Port: 5000"

# 1. Start ASP.NET Core Backend on 127.0.0.1:5000 in background
export ASPNETCORE_URLS="http://127.0.0.1:5000"
export ASPNETCORE_ENVIRONMENT="${ASPNETCORE_ENVIRONMENT:-Production}"

cd /app/backend
dotnet MusicStudio.API.dll &
BACKEND_PID=$!
echo "[BOOT] ASP.NET Core Backend started with PID $BACKEND_PID"

# Give backend a moment to spin up
sleep 2

# Forward shutdown signals to background processes
cleanup() {
    echo "[BOOT] Shutting down services..."
    kill -TERM "$BACKEND_PID" 2>/dev/null || true
    exit 0
}
trap cleanup INT TERM

# 2. Start Next.js Frontend in foreground on $PORT
cd /app/frontend
echo "[BOOT] Starting Next.js Frontend server on 0.0.0.0:$PORT..."
node server.js &
FRONTEND_PID=$!

wait $FRONTEND_PID
