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
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Development
EXPOSE 5000

ENTRYPOINT ["dotnet", "MusicStudio.API.dll"]
