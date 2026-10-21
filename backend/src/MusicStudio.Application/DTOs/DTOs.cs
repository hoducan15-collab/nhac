using MusicStudio.Domain.Enums;

namespace MusicStudio.Application.DTOs;

// --- Auth DTOs ---
public record RegisterDto(string FullName, string Email, string Password);
public record LoginDto(string Email, string Password);
public record RefreshTokenRequestDto(string AccessToken, string RefreshToken);

public record UserProfileDto(
    Guid Id,
    string FullName,
    string Email,
    string Role,
    int CreditsBalance,
    DateTime CreatedAtUtc
);

public record AuthResponseDto(
    string AccessToken,
    string RefreshToken,
    int ExpiresInSeconds,
    UserProfileDto User
);

// --- Project DTOs ---
public record CreateProjectDto(string Title, string Description, string Genre);
public record UpdateProjectDto(string Title, string Description, string Genre);

public record ProjectDto(
    Guid Id,
    string Title,
    string Description,
    string Genre,
    int VersionsCount,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc
);

// --- Generation DTOs ---
public record CreateGenerationJobDto(
    Guid? ProjectId,
    string Prompt,
    string? Lyrics,
    string Genre,
    string Mood,
    string Style,
    string Instruments,
    int Bpm,
    int DurationSeconds,
    GenerationMode Mode
);

public record GenerationJobDto(
    Guid Id,
    Guid? ProjectId,
    string Prompt,
    string? Lyrics,
    string Genre,
    string Mood,
    JobStatus Status,
    int CreditCost,
    string? ErrorMessage,
    Guid? ResultVersionId,
    DateTime CreatedAtUtc,
    DateTime? FinishedAtUtc
);

public record MusicVersionDto(
    Guid Id,
    Guid ProjectId,
    string Title,
    string VersionName,
    string AudioUrl,
    int DurationSeconds,
    bool IsFavorite,
    DateTime CreatedAtUtc
);

// --- Credit & Billing DTOs ---
public record CreditLedgerDto(
    Guid Id,
    CreditTransactionType TransactionType,
    int Amount,
    int BalanceAfter,
    string Description,
    DateTime CreatedAtUtc
);

public record CheckoutRequestDto(
    int CreditsAmount,
    decimal PriceVnd,
    string PaymentGateway
);

public record CheckoutResponseDto(
    string OrderCode,
    decimal AmountVnd,
    int CreditsGranted,
    string PaymentUrl,
    string Status
);

// --- Admin DTOs ---
public record AdminStatsDto(
    int TotalUsers,
    int TotalJobs,
    decimal TotalRevenueVnd,
    double ErrorRatePercentage
);
