using MusicStudio.Application.DTOs;
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
    public string? Title { get; set; }
    /// <summary>"male" | "female" | null</summary>
    public string? VocalGender { get; set; }
    /// <summary>"V6" | "V6_MINI" | "V6_WILD" | "V4_5ALL"</summary>
    public string? Model { get; set; }
    public string? NegativeTags { get; set; }
    public string? ApiKey { get; set; }
    public bool StrictLyricsMode { get; set; } = true;
    public string? VoiceId { get; set; }
    public string? VoiceModelId { get; set; }
    public bool EnableVoiceConversion { get; set; } = true;
    public bool ProfessionalVocalMode { get; set; } = true;
    public bool HumanVocalQualityMode { get; set; } = true;
    public VocalPerformanceControlDto? VocalPerformanceControl { get; set; }
}

public class MusicGenerationResponse
{
    public string ProviderJobId { get; set; } = string.Empty;
    public JobStatus Status { get; set; }
    public string? AudioUrl { get; set; }
    public string? VocalAudioUrl { get; set; }
    public byte[]? AudioBytes { get; set; }
    public int DurationSeconds { get; set; }
    public string? ErrorMessage { get; set; }
    public LyricsVerificationReportDto? VerificationReport { get; set; }
}

public interface IMusicGenerationProvider
{
    string ProviderName { get; }
    bool SupportsLyrics { get; }
    bool SupportsStems { get; }
    /// <summary>True only when a real API key/endpoint is configured on the server.</summary>
    bool IsConfigured { get; }

    Task<MusicGenerationResponse> SubmitGenerationAsync(MusicGenerationRequest request, CancellationToken cancellationToken = default);
    Task<MusicGenerationResponse> CheckStatusAsync(string providerJobId, CancellationToken cancellationToken = default);
    Task<MusicGenerationResponse> RegenerateSegmentAsync(Guid jobId, string providerJobId, RegenerateSegmentRequestDto segmentRequest, CancellationToken cancellationToken = default);
    LyricsVerificationReportDto? GetCachedVerificationReport(Guid jobId);
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
