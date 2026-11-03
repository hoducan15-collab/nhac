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
        var pgConnection = configuration.GetConnectionString("PostgreSqlConnection");
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
