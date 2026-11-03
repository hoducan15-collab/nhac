using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MusicStudio.Application.Interfaces;
using MusicStudio.Infrastructure.Persistence;
using MusicStudio.Infrastructure.Services;

namespace MusicStudio.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var rawPg = Environment.GetEnvironmentVariable("DATABASE_URL")
                    ?? Environment.GetEnvironmentVariable("POSTGRES_URL")
                    ?? configuration.GetConnectionString("PostgreSqlConnection");

        string? pgConnection = null;
        if (!string.IsNullOrWhiteSpace(rawPg) && !rawPg.Contains("localhost:5432"))
        {
            if (rawPg.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
                rawPg.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
            {
                try
                {
                    var uri = new Uri(rawPg);
                    var userInfo = uri.UserInfo.Split(':');
                    var user = userInfo.Length > 0 ? userInfo[0] : "postgres";
                    var pass = userInfo.Length > 1 ? userInfo[1] : "";
                    var db = uri.AbsolutePath.TrimStart('/');
                    var port = uri.Port > 0 ? uri.Port : 5432;
                    pgConnection = $"Host={uri.Host};Port={port};Database={db};Username={user};Password={pass};SSL Mode=Prefer;Trust Server Certificate=true";
                }
                catch
                {
                    pgConnection = rawPg;
                }
            }
            else
            {
                pgConnection = rawPg;
            }
        }

        var sqliteConnection = configuration.GetConnectionString("DefaultConnection") ?? "Data Source=musicstudio.db";

        services.AddDbContext<ApplicationDbContext>(options =>
        {
            if (!string.IsNullOrEmpty(pgConnection))
            {
                options.UseNpgsql(pgConnection);
            }
            else
            {
                options.UseSqlite(sqliteConnection);
            }
        });

        services.AddHttpContextAccessor();
        services.AddHttpClient("SunoClient");
        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IMediaStorageService, LocalMediaStorageService>();
        services.AddScoped<IMusicGenerationProvider, SunoMusicGenerationProvider>();
        services.AddHttpClient("OpenAIClient");
        services.AddScoped<ISongCompositionService, OpenAiSongCompositionService>();

        return services;
    }
}
