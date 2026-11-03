# ==============================================================================
# Multi-Stage Unified Dockerfile for MusicStudio Pro (Backend + Frontend + Audio Engine)
# Compatible with Railway, Render, Fly.io, and Single-Container Deployments
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Backend (.NET 10 SDK)
# ------------------------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-builder
WORKDIR /src

# Copy solution and project definitions
COPY backend/MusicStudio.slnx ./
COPY backend/src/MusicStudio.Domain/MusicStudio.Domain.csproj src/MusicStudio.Domain/
COPY backend/src/MusicStudio.Application/MusicStudio.Application.csproj src/MusicStudio.Application/
COPY backend/src/MusicStudio.Infrastructure/MusicStudio.Infrastructure.csproj src/MusicStudio.Infrastructure/
COPY backend/src/MusicStudio.API/MusicStudio.API.csproj src/MusicStudio.API/
COPY backend/src/MusicStudio.Worker/MusicStudio.Worker.csproj src/MusicStudio.Worker/
COPY backend/src/MusicStudio.Tests/MusicStudio.Tests.csproj src/MusicStudio.Tests/

# Restore dependencies
RUN dotnet restore src/MusicStudio.API/MusicStudio.API.csproj

# Copy remaining source code and publish
COPY backend/src/ src/
RUN dotnet publish src/MusicStudio.API/MusicStudio.API.csproj -c Release -o /app/backend

# ------------------------------------------------------------------------------
# Stage 2: Build Frontend (Node.js 20 Alpine)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=/api/v1
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 3: Unified Production Runtime (ASP.NET Core + Node.js 20 + Python PyWorld)
# ------------------------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Install Node.js 20, Python 3 and Audio DSP dependencies
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update -qq && apt-get install -y -qq --no-install-recommends \
    curl gnupg python3 python3-pip python3-dev g++ python3-numpy python3-scipy ffmpeg flac rubberband-cli \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y -qq --no-install-recommends nodejs \
    && pip3 install --no-cache-dir --break-system-packages "setuptools>=68,<81" wheel \
    && pip3 install --no-cache-dir --break-system-packages pyworld edge-tts SpeechRecognition \
    && pip3 install --no-cache-dir --break-system-packages torch torchaudio --index-url https://download.pytorch.org/whl/cpu \
    && rm -rf /var/lib/apt/lists/*

# Copy backend binaries and engine scripts
COPY --from=backend-builder /app/backend /app/backend
COPY backend/src/MusicStudio.API/vietnamese_singing_engine.py /app/backend/vietnamese_singing_engine.py
COPY backend/src/MusicStudio.API/voice_conversion_engine.py /app/backend/voice_conversion_engine.py
COPY backend/src/MusicStudio.API/vocal_separation_engine.py /app/backend/vocal_separation_engine.py
RUN mkdir -p /app/backend/Storage/Audio

# Copy frontend standalone build
COPY --from=frontend-builder /app/public /app/frontend/public
COPY --from=frontend-builder /app/.next/standalone /app/frontend/
COPY --from=frontend-builder /app/.next/static /app/frontend/.next/static

# Copy startup script that boots Backend on 127.0.0.1:5000 and Frontend on $PORT
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 3000 5000

ENV PORT=3000
ENTRYPOINT ["/app/start.sh"]

