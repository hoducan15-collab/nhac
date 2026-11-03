# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy all project files
COPY MusicStudio.slnx ./
COPY src/MusicStudio.Domain/MusicStudio.Domain.csproj src/MusicStudio.Domain/
COPY src/MusicStudio.Application/MusicStudio.Application.csproj src/MusicStudio.Application/
COPY src/MusicStudio.Infrastructure/MusicStudio.Infrastructure.csproj src/MusicStudio.Infrastructure/
COPY src/MusicStudio.API/MusicStudio.API.csproj src/MusicStudio.API/
COPY src/MusicStudio.Worker/MusicStudio.Worker.csproj src/MusicStudio.Worker/
COPY src/MusicStudio.Tests/MusicStudio.Tests.csproj src/MusicStudio.Tests/

# Restore dependencies
RUN dotnet restore src/MusicStudio.API/MusicStudio.API.csproj

# Copy remaining source code
COPY src/ src/

# Build and publish
RUN dotnet publish src/MusicStudio.API/MusicStudio.API.csproj -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-pip python3-dev g++ python3-numpy python3-scipy ffmpeg flac rubberband-cli \
    && pip3 install --no-cache-dir --break-system-packages "setuptools>=68,<81" \
    && pip3 install --no-cache-dir --break-system-packages pyworld edge-tts SpeechRecognition \
    && pip3 install --no-cache-dir --break-system-packages torch torchaudio --index-url https://download.pytorch.org/whl/cpu \
    && pip3 install --no-cache-dir --break-system-packages "setuptools>=68,<81" \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .
COPY --from=build /src/src/MusicStudio.API/vietnamese_singing_engine.py /app/vietnamese_singing_engine.py
COPY --from=build /src/src/MusicStudio.API/voice_conversion_engine.py /app/voice_conversion_engine.py
COPY --from=build /src/src/MusicStudio.API/vocal_separation_engine.py /app/vocal_separation_engine.py
RUN mkdir -p /app/Storage/Audio

ENV ASPNETCORE_ENVIRONMENT=Development
EXPOSE 5000

ENTRYPOINT ["sh", "-c", "export ASPNETCORE_URLS=http://+:${PORT:-5000} && dotnet MusicStudio.API.dll"]
