using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MusicStudio.Application.DTOs;
using MusicStudio.Application.Interfaces;
using MusicStudio.Domain.Entities;
using MusicStudio.Domain.Enums;

namespace MusicStudio.API.Controllers;

// --- LIBRARY CONTROLLER ---
[ApiController]
[Route("api/v1/[controller]")]
public class LibraryController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public LibraryController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MusicVersionDto>>> GetLibrary([FromQuery] string? genre)
    {
        var query = _context.MusicVersions
            .Include(v => v.Favorites)
            .AsNoTracking();

        var versions = await query
            .OrderByDescending(v => v.CreatedAtUtc)
            .Select(v => new MusicVersionDto(
                v.Id,
                v.ProjectId,
                v.Title,
                v.VersionName,
                v.AudioUrl,
                v.DurationSeconds,
                v.Favorites.Any(),
                v.CreatedAtUtc
            ))
            .ToListAsync();

        return Ok(versions);
    }

    [HttpPost("favorites/{versionId:guid}")]
    public async Task<IActionResult> AddFavorite(Guid versionId)
    {
        var user = await _context.Users.FirstOrDefaultAsync();
        var userId = user?.Id ?? Guid.NewGuid();

        if (!await _context.Favorites.AnyAsync(f => f.UserId == userId && f.MusicVersionId == versionId))
        {
            _context.Favorites.Add(new Favorite
            {
                UserId = userId,
                MusicVersionId = versionId
            });
            await _context.SaveChangesAsync();
        }

        return Ok(new { success = true });
    }

    [HttpDelete("favorites/{versionId:guid}")]
    public async Task<IActionResult> RemoveFavorite(Guid versionId)
    {
        var user = await _context.Users.FirstOrDefaultAsync();
        var userId = user?.Id ?? Guid.NewGuid();

        var fav = await _context.Favorites.FirstOrDefaultAsync(f => f.UserId == userId && f.MusicVersionId == versionId);
        if (fav != null)
        {
            _context.Favorites.Remove(fav);
            await _context.SaveChangesAsync();
        }

        return NoContent();
    }
}

// --- CREDITS CONTROLLER ---
[ApiController]
[Route("api/v1/[controller]")]
public class CreditsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public CreditsController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult> GetBalance()
    {
        var user = await _context.Users.FirstOrDefaultAsync();
        return Ok(new { creditsBalance = user?.CreditsBalance ?? 50 });
    }

    [HttpGet("ledger")]
    public async Task<ActionResult<IEnumerable<CreditLedgerDto>>> GetLedger()
    {
        var entries = await _context.CreditLedgerEntries
            .AsNoTracking()
            .OrderByDescending(e => e.CreatedAtUtc)
            .Take(100)
            .Select(e => new CreditLedgerDto(
                e.Id,
                e.TransactionType,
                e.Amount,
                e.BalanceAfter,
                e.Description,
                e.CreatedAtUtc
            ))
            .ToListAsync();

        return Ok(entries);
    }
}

// --- BILLING CONTROLLER ---
[ApiController]
[Route("api/v1/[controller]")]
public class BillingController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public BillingController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost("checkout")]
    public async Task<ActionResult<CheckoutResponseDto>> Checkout([FromBody] CheckoutRequestDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync();
        var userId = user?.Id ?? Guid.NewGuid();

        var orderCode = "ORD-" + DateTime.UtcNow.ToString("yyyyMMdd") + "-" + Guid.NewGuid().ToString("N")[..6].ToUpper();

        var tx = new PaymentTransaction
        {
            UserId = userId,
            OrderCode = orderCode,
            AmountVnd = dto.PriceVnd,
            CreditsGranted = dto.CreditsAmount,
            Status = PaymentStatus.Completed, // Simulating fast dev fulfillment
            PaymentGateway = dto.PaymentGateway,
            GatewayTransactionId = "GATEWAY-" + Guid.NewGuid().ToString("N")[..8]
        };

        _context.PaymentTransactions.Add(tx);

        if (user != null)
        {
            user.CreditsBalance += dto.CreditsAmount;
            _context.CreditLedgerEntries.Add(new CreditLedgerEntry
            {
                UserId = user.Id,
                TransactionType = CreditTransactionType.PackagePurchase,
                Amount = dto.CreditsAmount,
                BalanceAfter = user.CreditsBalance,
                Description = $"Nạp gói {dto.CreditsAmount} Credits qua {dto.PaymentGateway}",
                ReferencePaymentId = tx.Id
            });
        }

        await _context.SaveChangesAsync();

        return Ok(new CheckoutResponseDto(
            orderCode,
            dto.PriceVnd,
            dto.CreditsAmount,
            "https://payment.musicstudio.ai/mock-success",
            "Completed"
        ));
    }
}

// --- ADMIN CONTROLLER ---
[ApiController]
[Route("api/v1/[controller]")]
public class AdminController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public AdminController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<AdminStatsDto>> GetStats()
    {
        var totalUsers = await _context.Users.CountAsync();
        var totalJobs = await _context.GenerationJobs.CountAsync();
        var totalRevenue = await _context.PaymentTransactions
            .Where(t => t.Status == PaymentStatus.Completed)
            .SumAsync(t => (decimal?)t.AmountVnd) ?? 0;

        var failedJobs = await _context.GenerationJobs.CountAsync(j => j.Status == JobStatus.Failed);
        var errorRate = totalJobs > 0 ? (double)failedJobs / totalJobs * 100 : 0.0;

        return Ok(new AdminStatsDto(totalUsers, totalJobs, totalRevenue, Math.Round(errorRate, 1)));
    }
}
