using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MusicStudio.Application.DTOs;
using MusicStudio.Application.Interfaces;
using MusicStudio.Domain.Entities;
using MusicStudio.Domain.Enums;

namespace MusicStudio.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class GenerationsController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly IMusicGenerationProvider _provider;

    public GenerationsController(
        IApplicationDbContext context,
        IMusicGenerationProvider provider)
    {
        _context = context;
        _provider = provider;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GenerationJobDto>>> GetGenerations()
    {
        var jobs = await _context.GenerationJobs
            .AsNoTracking()
            .OrderByDescending(j => j.CreatedAtUtc)
            .Take(50)
            .Select(j => new GenerationJobDto(
                j.Id,
                j.ProjectId,
                j.Prompt,
                j.Lyrics,
                j.Genre,
                j.Mood,
                j.Status,
                j.CreditCost,
                j.ErrorMessage,
                j.ResultVersionId,
                j.CreatedAtUtc,
                j.FinishedAtUtc
            ))
            .ToListAsync();

        return Ok(jobs);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<GenerationJobDto>> GetGeneration(Guid id)
    {
        var j = await _context.GenerationJobs.FirstOrDefaultAsync(x => x.Id == id);
        if (j == null)
        {
            return NotFound(new { message = "Không tìm thấy tác vụ tạo nhạc." });
        }

        return Ok(new GenerationJobDto(
            j.Id,
            j.ProjectId,
            j.Prompt,
            j.Lyrics,
            j.Genre,
            j.Mood,
            j.Status,
            j.CreditCost,
            j.ErrorMessage,
            j.ResultVersionId,
            j.CreatedAtUtc,
            j.FinishedAtUtc
        ));
    }

    [HttpPost]
    public async Task<ActionResult<GenerationJobDto>> CreateGeneration([FromBody] CreateGenerationJobDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync();
        if (user == null)
        {
            return BadRequest(new { message = "Không tìm thấy người dùng." });
        }

        var creditCost = dto.Mode == GenerationMode.Instrumental ? 5 : 10;
        if (user.CreditsBalance < creditCost)
        {
            return BadRequest(new { message = $"Số dư credit không đủ. Cần {creditCost} credits, hiện có {user.CreditsBalance}." });
        }

        // Hold / deduct credits
        user.CreditsBalance -= creditCost;

        var job = new GenerationJob
        {
            UserId = user.Id,
            ProjectId = dto.ProjectId,
            Prompt = dto.Prompt,
            Lyrics = dto.Lyrics,
            Genre = dto.Genre,
            Mood = dto.Mood,
            Style = dto.Style,
            Instruments = dto.Instruments,
            Bpm = dto.Bpm,
            DurationSeconds = dto.DurationSeconds,
            Mode = dto.Mode,
            CreditCost = creditCost,
            Status = JobStatus.Processing,
            ProviderName = _provider.ProviderName
        };

        _context.GenerationJobs.Add(job);

        // Record in ledger
        _context.CreditLedgerEntries.Add(new CreditLedgerEntry
        {
            UserId = user.Id,
            TransactionType = CreditTransactionType.GenerationSettle,
            Amount = -creditCost,
            BalanceAfter = user.CreditsBalance,
            Description = $"Tạo nhạc AI: {dto.Prompt[..Math.Min(30, dto.Prompt.Length)]}...",
            ReferenceJobId = job.Id
        });

        await _context.SaveChangesAsync();

        // Call Provider
        try
        {
            var providerResponse = await _provider.SubmitGenerationAsync(new MusicGenerationRequest
            {
                JobId = job.Id,
                Prompt = dto.Prompt,
                Lyrics = dto.Lyrics,
                Genre = dto.Genre,
                Mood = dto.Mood,
                Style = dto.Style,
                Instruments = dto.Instruments,
                Bpm = dto.Bpm,
                DurationSeconds = dto.DurationSeconds,
                Mode = dto.Mode
            });

            job.Status = providerResponse.Status;
            job.ProviderJobId = providerResponse.ProviderJobId;
            job.FinishedAtUtc = DateTime.UtcNow;

            if (providerResponse.Status == JobStatus.Succeeded)
            {
                // Ensure a project exists
                Guid targetProjectId = dto.ProjectId ?? Guid.Empty;
                if (targetProjectId == Guid.Empty)
                {
                    var newProj = new MusicProject
                    {
                        UserId = user.Id,
                        Title = $"Dự án: {dto.Genre} ({DateTime.UtcNow:dd/MM})",
                        Description = dto.Prompt,
                        Genre = dto.Genre
                    };
                    _context.MusicProjects.Add(newProj);
                    await _context.SaveChangesAsync();
                    targetProjectId = newProj.Id;
                    job.ProjectId = targetProjectId;
                }

                // Create MusicVersion
                var version = new MusicVersion
                {
                    ProjectId = targetProjectId,
                    GenerationJobId = job.Id,
                    Title = $"{dto.Genre} - {dto.Mood}",
                    VersionName = "v1.0",
                    AudioUrl = providerResponse.AudioUrl ?? "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                    DurationSeconds = dto.DurationSeconds
                };

                _context.MusicVersions.Add(version);
                await _context.SaveChangesAsync();

                job.ResultVersionId = version.Id;
            }
            else
            {
                // Refund credits on failure
                user.CreditsBalance += creditCost;
                _context.CreditLedgerEntries.Add(new CreditLedgerEntry
                {
                    UserId = user.Id,
                    TransactionType = CreditTransactionType.GenerationRefund,
                    Amount = creditCost,
                    BalanceAfter = user.CreditsBalance,
                    Description = "Hoàn trả credit do tác vụ tạo nhạc thất bại",
                    ReferenceJobId = job.Id
                });
            }

            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            job.Status = JobStatus.Failed;
            job.ErrorMessage = ex.Message;
            user.CreditsBalance += creditCost;

            _context.CreditLedgerEntries.Add(new CreditLedgerEntry
            {
                UserId = user.Id,
                TransactionType = CreditTransactionType.GenerationRefund,
                Amount = creditCost,
                BalanceAfter = user.CreditsBalance,
                Description = "Hoàn trả credit do lỗi ngoại lệ provider",
                ReferenceJobId = job.Id
            });

            await _context.SaveChangesAsync();
        }

        return Ok(new GenerationJobDto(
            job.Id,
            job.ProjectId,
            job.Prompt,
            job.Lyrics,
            job.Genre,
            job.Mood,
            job.Status,
            job.CreditCost,
            job.ErrorMessage,
            job.ResultVersionId,
            job.CreatedAtUtc,
            job.FinishedAtUtc
        ));
    }
}
