using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MusicStudio.Application.DTOs;
using MusicStudio.Application.Interfaces;
using MusicStudio.Domain.Entities;
using MusicStudio.Domain.Enums;

namespace MusicStudio.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IPasswordHasher _passwordHasher;

    public AuthController(
        IApplicationDbContext context,
        IJwtTokenService jwtTokenService,
        IPasswordHasher _hasher)
    {
        _context = context;
        _jwtTokenService = jwtTokenService;
        _passwordHasher = _hasher;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower()))
        {
            return BadRequest(new { message = "Email này đã được sử dụng." });
        }

        var user = new ApplicationUser
        {
            FullName = dto.FullName,
            Email = dto.Email.ToLower(),
            PasswordHash = _passwordHasher.HashPassword(dto.Password),
            Role = "User",
            CreditsBalance = 50, // Welcome gift
            IsActive = true
        };

        _context.Users.Add(user);

        // Record welcome credits in ledger
        _context.CreditLedgerEntries.Add(new CreditLedgerEntry
        {
            UserId = user.Id,
            TransactionType = CreditTransactionType.WelcomeBonus,
            Amount = 50,
            BalanceAfter = 50,
            Description = "Thưởng chào mừng đăng ký tài khoản mới"
        });

        await _context.SaveChangesAsync();

        var (token, _) = _jwtTokenService.GenerateAccessToken(user.Id, user.Email, user.Role);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();

        _context.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            Token = refreshToken,
            ExpiresAtUtc = DateTime.UtcNow.AddDays(7)
        });

        await _context.SaveChangesAsync();

        var userProfile = new UserProfileDto(user.Id, user.FullName, user.Email, user.Role, user.CreditsBalance, user.CreatedAtUtc);
        return Ok(new AuthResponseDto(token, refreshToken, 7200, userProfile));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());
        if (user == null || !_passwordHasher.VerifyPassword(dto.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Email hoặc mật khẩu không chính xác." });
        }

        if (!user.IsActive)
        {
            return Forbid("Tài khoản của bạn đã bị khóa.");
        }

        var (token, _) = _jwtTokenService.GenerateAccessToken(user.Id, user.Email, user.Role);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();

        _context.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            Token = refreshToken,
            ExpiresAtUtc = DateTime.UtcNow.AddDays(7)
        });

        await _context.SaveChangesAsync();

        var userProfile = new UserProfileDto(user.Id, user.FullName, user.Email, user.Role, user.CreditsBalance, user.CreatedAtUtc);
        return Ok(new AuthResponseDto(token, refreshToken, 7200, userProfile));
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponseDto>> RefreshToken([FromBody] RefreshTokenRequestDto dto)
    {
        var existingToken = await _context.RefreshTokens
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Token == dto.RefreshToken && !r.IsRevoked && !r.IsUsed);

        if (existingToken == null || existingToken.ExpiresAtUtc < DateTime.UtcNow || existingToken.User == null)
        {
            return Unauthorized(new { message = "Refresh token không hợp lệ hoặc đã hết hạn." });
        }

        existingToken.IsUsed = true;

        var user = existingToken.User;
        var (token, _) = _jwtTokenService.GenerateAccessToken(user.Id, user.Email, user.Role);
        var newRefreshToken = _jwtTokenService.GenerateRefreshToken();

        _context.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            Token = newRefreshToken,
            ExpiresAtUtc = DateTime.UtcNow.AddDays(7)
        });

        await _context.SaveChangesAsync();

        var userProfile = new UserProfileDto(user.Id, user.FullName, user.Email, user.Role, user.CreditsBalance, user.CreatedAtUtc);
        return Ok(new AuthResponseDto(token, newRefreshToken, 7200, userProfile));
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] RefreshTokenRequestDto dto)
    {
        var token = await _context.RefreshTokens.FirstOrDefaultAsync(r => r.Token == dto.RefreshToken);
        if (token != null)
        {
            token.IsRevoked = true;
            await _context.SaveChangesAsync();
        }

        return NoContent();
    }
}
