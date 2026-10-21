using MusicStudio.Domain.Common;
using MusicStudio.Domain.Enums;

namespace MusicStudio.Domain.Entities;

public class ApplicationUser : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = "User";
    public int CreditsBalance { get; set; } = 50; // Welcome 50 credits
    public bool IsActive { get; set; } = true;

    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public ICollection<MusicProject> MusicProjects { get; set; } = new List<MusicProject>();
    public ICollection<CreditLedgerEntry> CreditEntries { get; set; } = new List<CreditLedgerEntry>();
    public ICollection<Playlist> Playlists { get; set; } = new List<Playlist>();
    public ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
}

public class RefreshToken : BaseEntity
{
    public Guid UserId { get; set; }
    public ApplicationUser? User { get; set; }
    public string Token { get; set; } = string.Empty;
    public string JwtId { get; set; } = string.Empty;
    public bool IsUsed { get; set; }
    public bool IsRevoked { get; set; }
    public DateTime ExpiresAtUtc { get; set; }
}

public class MusicProject : BaseEntity
{
    public Guid UserId { get; set; }
    public ApplicationUser? User { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Genre { get; set; } = string.Empty;
    public string? CoverUrl { get; set; }

    public ICollection<MusicVersion> Versions { get; set; } = new List<MusicVersion>();
    public ICollection<GenerationJob> GenerationJobs { get; set; } = new List<GenerationJob>();
}

public class GenerationJob : BaseEntity
{
    public Guid? ProjectId { get; set; }
    public MusicProject? Project { get; set; }
    public Guid UserId { get; set; }
    public ApplicationUser? User { get; set; }

    public string Prompt { get; set; } = string.Empty;
    public string? Lyrics { get; set; }
    public string Genre { get; set; } = string.Empty;
    public string Mood { get; set; } = string.Empty;
    public string Style { get; set; } = string.Empty;
    public string Instruments { get; set; } = string.Empty;
    public int Bpm { get; set; } = 120;
    public int DurationSeconds { get; set; } = 120;
    public GenerationMode Mode { get; set; } = GenerationMode.Instrumental;

    public int CreditCost { get; set; } = 5;
    public JobStatus Status { get; set; } = JobStatus.Queued;
    public string ProviderName { get; set; } = "MockAudioCraftProvider";
    public string? ProviderJobId { get; set; }
    public string? ErrorMessage { get; set; }
    public int RetryCount { get; set; }
    public string? IdempotencyKey { get; set; }
    public DateTime? FinishedAtUtc { get; set; }

    public Guid? ResultVersionId { get; set; }
    public MusicVersion? ResultVersion { get; set; }
}

public class MusicVersion : BaseEntity
{
    public Guid ProjectId { get; set; }
    public MusicProject? Project { get; set; }
    public Guid? GenerationJobId { get; set; }
    public GenerationJob? GenerationJob { get; set; }

    public string Title { get; set; } = string.Empty;
    public string VersionName { get; set; } = "v1.0";
    public string AudioUrl { get; set; } = string.Empty;
    public int DurationSeconds { get; set; }
    public string? WaveformData { get; set; }

    public ICollection<MediaAsset> MediaAssets { get; set; } = new List<MediaAsset>();
    public ICollection<PlaylistItem> PlaylistItems { get; set; } = new List<PlaylistItem>();
    public ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
}

public class MediaAsset : BaseEntity
{
    public Guid MusicVersionId { get; set; }
    public MusicVersion? MusicVersion { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string StoragePath { get; set; } = string.Empty;
    public string ContentType { get; set; } = "audio/mpeg";
    public long FileSizeBytes { get; set; }
    public int DurationSeconds { get; set; }
}

public class Playlist : BaseEntity
{
    public Guid UserId { get; set; }
    public ApplicationUser? User { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public ICollection<PlaylistItem> Items { get; set; } = new List<PlaylistItem>();
}

public class PlaylistItem : BaseEntity
{
    public Guid PlaylistId { get; set; }
    public Playlist? Playlist { get; set; }
    public Guid MusicVersionId { get; set; }
    public MusicVersion? MusicVersion { get; set; }
    public int Position { get; set; }
}

public class Favorite : BaseEntity
{
    public Guid UserId { get; set; }
    public ApplicationUser? User { get; set; }
    public Guid MusicVersionId { get; set; }
    public MusicVersion? MusicVersion { get; set; }
}

public class CreditLedgerEntry : BaseEntity
{
    public Guid UserId { get; set; }
    public ApplicationUser? User { get; set; }
    public CreditTransactionType TransactionType { get; set; }
    public int Amount { get; set; }
    public int BalanceAfter { get; set; }
    public string Description { get; set; } = string.Empty;
    public Guid? ReferenceJobId { get; set; }
    public Guid? ReferencePaymentId { get; set; }
}

public class SubscriptionPlan : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal PriceVnd { get; set; }
    public int MonthlyCredits { get; set; }
    public string FeaturesJson { get; set; } = "[]";
    public bool IsActive { get; set; } = true;
}

public class UserSubscription : BaseEntity
{
    public Guid UserId { get; set; }
    public ApplicationUser? User { get; set; }
    public Guid PlanId { get; set; }
    public SubscriptionPlan? Plan { get; set; }
    public DateTime StartDateUtc { get; set; }
    public DateTime EndDateUtc { get; set; }
    public bool IsActive { get; set; } = true;
}

public class PaymentTransaction : BaseEntity
{
    public Guid UserId { get; set; }
    public ApplicationUser? User { get; set; }
    public string OrderCode { get; set; } = string.Empty;
    public decimal AmountVnd { get; set; }
    public int CreditsGranted { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public string PaymentGateway { get; set; } = "VNPay";
    public string? GatewayTransactionId { get; set; }
}

public class WebhookEvent : BaseEntity
{
    public string Provider { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public string Payload { get; set; } = string.Empty;
    public bool IsProcessed { get; set; }
    public DateTime? ProcessedAtUtc { get; set; }
    public string? ErrorMessage { get; set; }
}

public class AuditLog : BaseEntity
{
    public Guid? UserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public string? EntityId { get; set; }
    public string Details { get; set; } = string.Empty;
    public string? IpAddress { get; set; }
}
