using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using MusicStudio.Application.Interfaces;
using MusicStudio.Domain.Enums;

namespace MusicStudio.Infrastructure.Services;

public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _configuration;

    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public (string Token, DateTime ExpiresAt) GenerateAccessToken(Guid userId, string email, string role)
    {
        var secret = _configuration["Jwt:Secret"] ?? "MusicStudioSuperSecretKey2026SecureLongPhraseJwt1234567890!";
        var issuer = _configuration["Jwt:Issuer"] ?? "MusicStudio.API";
        var audience = _configuration["Jwt:Audience"] ?? "MusicStudio.Frontend";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var expires = DateTime.UtcNow.AddHours(2);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(ClaimTypes.Role, role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expires,
            signingCredentials: creds
        );

        return (new JwtSecurityTokenHandler().WriteToken(token), expires);
    }

    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }
}

public class PasswordHasher : IPasswordHasher
{
    public string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password + "_salt_music_studio"));
        return Convert.ToBase64String(hashedBytes);
    }

    public bool VerifyPassword(string password, string passwordHash)
    {
        return HashPassword(password) == passwordHash;
    }
}

public class LocalMediaStorageService : IMediaStorageService
{
    private readonly string _storageDir;

    public LocalMediaStorageService()
    {
        _storageDir = Path.Combine(Directory.GetCurrentDirectory(), "Storage", "Audio");
        if (!Directory.Exists(_storageDir))
        {
            Directory.CreateDirectory(_storageDir);
        }
    }

    public async Task<string> SaveAudioAsync(string fileName, Stream content, string contentType = "audio/mpeg", CancellationToken cancellationToken = default)
    {
        var safeFileName = $"{Guid.NewGuid()}_{Path.GetFileName(fileName)}";
        var filePath = Path.Combine(_storageDir, safeFileName);

        using var fileStream = new FileStream(filePath, FileMode.Create, FileAccess.Write);
        await content.CopyToAsync(fileStream, cancellationToken);

        return safeFileName;
    }

    public Task<Stream?> GetAudioStreamAsync(string storagePath, CancellationToken cancellationToken = default)
    {
        var filePath = Path.Combine(_storageDir, storagePath);
        if (!File.Exists(filePath))
        {
            return Task.FromResult<Stream?>(null);
        }

        Stream stream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
        return Task.FromResult<Stream?>(stream);
    }

    public Task DeleteAudioAsync(string storagePath, CancellationToken cancellationToken = default)
    {
        var filePath = Path.Combine(_storageDir, storagePath);
        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }
        return Task.CompletedTask;
    }
}

public class MockMusicGenerationProvider : IMusicGenerationProvider
{
    public string ProviderName => "MockMusicGenerationEngine";
    public bool SupportsLyrics => true;
    public bool SupportsStems => false;

    public Task<MusicGenerationResponse> SubmitGenerationAsync(MusicGenerationRequest request, CancellationToken cancellationToken = default)
    {
        var mockJobId = "mock-prov-" + Guid.NewGuid().ToString("N")[..8];

        // Sample publicly available test audio track url
        return Task.FromResult(new MusicGenerationResponse
        {
            ProviderJobId = mockJobId,
            Status = JobStatus.Succeeded,
            AudioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            DurationSeconds = request.DurationSeconds,
            ErrorMessage = null
        });
    }

    public Task<MusicGenerationResponse> CheckStatusAsync(string providerJobId, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(new MusicGenerationResponse
        {
            ProviderJobId = providerJobId,
            Status = JobStatus.Succeeded,
            AudioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            DurationSeconds = 120,
            ErrorMessage = null
        });
    }
}
