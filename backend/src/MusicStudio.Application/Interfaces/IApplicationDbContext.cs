using Microsoft.EntityFrameworkCore;
using MusicStudio.Domain.Entities;

namespace MusicStudio.Application.Interfaces;

public interface IApplicationDbContext
{
    DbSet<ApplicationUser> Users { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<MusicProject> MusicProjects { get; }
    DbSet<GenerationJob> GenerationJobs { get; }
    DbSet<MusicVersion> MusicVersions { get; }
    DbSet<MediaAsset> MediaAssets { get; }
    DbSet<Playlist> Playlists { get; }
    DbSet<PlaylistItem> PlaylistItems { get; }
    DbSet<Favorite> Favorites { get; }
    DbSet<CreditLedgerEntry> CreditLedgerEntries { get; }
    DbSet<SubscriptionPlan> SubscriptionPlans { get; }
    DbSet<UserSubscription> UserSubscriptions { get; }
    DbSet<PaymentTransaction> PaymentTransactions { get; }
    DbSet<WebhookEvent> WebhookEvents { get; }
    DbSet<AuditLog> AuditLogs { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
