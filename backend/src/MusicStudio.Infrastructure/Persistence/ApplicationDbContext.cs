using Microsoft.EntityFrameworkCore;
using MusicStudio.Application.Interfaces;
using MusicStudio.Domain.Entities;

namespace MusicStudio.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<ApplicationUser> Users => Set<ApplicationUser>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<MusicProject> MusicProjects => Set<MusicProject>();
    public DbSet<GenerationJob> GenerationJobs => Set<GenerationJob>();
    public DbSet<MusicVersion> MusicVersions => Set<MusicVersion>();
    public DbSet<MediaAsset> MediaAssets => Set<MediaAsset>();
    public DbSet<Playlist> Playlists => Set<Playlist>();
    public DbSet<PlaylistItem> PlaylistItems => Set<PlaylistItem>();
    public DbSet<Favorite> Favorites => Set<Favorite>();
    public DbSet<CreditLedgerEntry> CreditLedgerEntries => Set<CreditLedgerEntry>();
    public DbSet<SubscriptionPlan> SubscriptionPlans => Set<SubscriptionPlan>();
    public DbSet<UserSubscription> UserSubscriptions => Set<UserSubscription>();
    public DbSet<PaymentTransaction> PaymentTransactions => Set<PaymentTransaction>();
    public DbSet<WebhookEvent> WebhookEvents => Set<WebhookEvent>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ApplicationUser configurations
        modelBuilder.Entity<ApplicationUser>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).HasMaxLength(256).IsRequired();
            entity.Property(e => e.FullName).HasMaxLength(150);
        });

        // MusicProject configurations
        modelBuilder.Entity<MusicProject>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.User)
                .WithMany(u => u.MusicProjects)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // GenerationJob configurations
        modelBuilder.Entity<GenerationJob>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Project)
                .WithMany(p => p.GenerationJobs)
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ResultVersion)
                .WithOne(v => v.GenerationJob)
                .HasForeignKey<MusicVersion>(v => v.GenerationJobId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // MusicVersion configurations
        modelBuilder.Entity<MusicVersion>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Project)
                .WithMany(p => p.Versions)
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // PaymentTransaction configurations
        modelBuilder.Entity<PaymentTransaction>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.AmountVnd).HasPrecision(18, 2);
            entity.HasIndex(e => e.OrderCode).IsUnique();
        });

        // SubscriptionPlan configurations
        modelBuilder.Entity<SubscriptionPlan>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.PriceVnd).HasPrecision(18, 2);
        });
    }
}
