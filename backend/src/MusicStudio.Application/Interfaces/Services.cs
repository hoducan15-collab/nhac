using MusicStudio.Domain.Enums;

namespace MusicStudio.Application.Interfaces;

public class MusicGenerationRequest
{
    public Guid JobId { get; set; }
    public string Prompt { get; set; } = string.Empty;
    public string? Lyrics { get; set; }
    public string Genre { get; set; } = string.Empty;
    public string Mood { get; set; } = string.Empty;
    public string Style { get; set; } = string.Empty;
    public string Instruments { get; set; } = string.Empty;
    public int Bpm { get; set; } = 120;
    public int DurationSeconds { get; set; } = 120;
    public GenerationMode Mode { get; set; } = GenerationMode.Instrumental;
}

public class MusicGenerationResponse
{
    public string ProviderJobId { get; set; } = string.Empty;
    public JobStatus Status { get; set; }
    public string? AudioUrl { get; set; }
    public byte[]? AudioBytes { get; set; }
    public int DurationSeconds { get; set; }
    public string? ErrorMessage { get; set; }
}

public interface IMusicGenerationProvider
{
    string ProviderName { get; }
    bool SupportsLyrics { get; }
    bool SupportsStems { get; }

    Task<MusicGenerationResponse> SubmitGenerationAsync(MusicGenerationRequest request, CancellationToken cancellationToken = default);
    Task<MusicGenerationResponse> CheckStatusAsync(string providerJobId, CancellationToken cancellationToken = default);
}

public interface IMediaStorageService
{
    Task<string> SaveAudioAsync(string fileName, Stream content, string contentType = "audio/mpeg", CancellationToken cancellationToken = default);
    Task<Stream?> GetAudioStreamAsync(string storagePath, CancellationToken cancellationToken = default);
    Task DeleteAudioAsync(string storagePath, CancellationToken cancellationToken = default);
}

public interface IJwtTokenService
{
    (string Token, DateTime ExpiresAt) GenerateAccessToken(Guid userId, string email, string role);
    string GenerateRefreshToken();
}

public interface IPasswordHasher
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string passwordHash);
}
