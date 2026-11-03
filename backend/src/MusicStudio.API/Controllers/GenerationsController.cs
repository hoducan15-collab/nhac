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
    private readonly ILogger<GenerationsController> _logger;

    public GenerationsController(
        IApplicationDbContext context,
        IMusicGenerationProvider provider,
        ILogger<GenerationsController> logger)
    {
        _context = context;
        _provider = provider;
        _logger = logger;
    }

    [HttpGet("audio/{fileName}")]
    public IActionResult GetAudioFile(string fileName)
    {
        var safeName = Path.GetFileName(fileName);
        if (string.IsNullOrWhiteSpace(safeName) || !safeName.EndsWith(".mp3", StringComparison.OrdinalIgnoreCase))
        {
            return NotFound();
        }

        var filePath = Path.Combine(Directory.GetCurrentDirectory(), "Storage", "Audio", safeName);
        if (!System.IO.File.Exists(filePath))
        {
            return NotFound();
        }

        var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read);
        return File(stream, "audio/mpeg", enableRangeProcessing: true);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GenerationJobDto>>> GetGenerations()
    {
        // Reconcile any Processing jobs that already finished on disk/cache
        var processingJobs = await _context.GenerationJobs
            .Where(j => j.Status == JobStatus.Processing && j.ProviderJobId != null)
            .OrderByDescending(j => j.CreatedAtUtc)
            .Take(10)
            .ToListAsync();

        foreach (var pj in processingJobs)
        {
            try
            {
                var checkRes = await _provider.CheckStatusAsync(pj.ProviderJobId!);
                if (checkRes.Status == JobStatus.Succeeded && !string.IsNullOrWhiteSpace(checkRes.AudioUrl))
                {
                    Guid targetProjectId = pj.ProjectId ?? Guid.Empty;
                    if (targetProjectId == Guid.Empty)
                    {
                        var newProj = new MusicProject
                        {
                            UserId = pj.UserId,
                            Title = string.IsNullOrWhiteSpace(pj.Prompt) ? $"Dự án: {pj.Genre} ({DateTime.UtcNow:dd/MM})" : pj.Prompt[..Math.Min(60, pj.Prompt.Length)],
                            Description = pj.Prompt,
                            Genre = pj.Genre
                        };
                        _context.MusicProjects.Add(newProj);
                        await _context.SaveChangesAsync();
                        targetProjectId = newProj.Id;
                        pj.ProjectId = targetProjectId;
                    }

                    var version = new MusicVersion
                    {
                        ProjectId = targetProjectId,
                        GenerationJobId = pj.Id,
                        VoiceModelId = pj.VoiceModelId,
                        Title = string.IsNullOrWhiteSpace(pj.Prompt) ? $"{pj.Genre} - {pj.Mood}" : pj.Prompt[..Math.Min(50, pj.Prompt.Length)],
                        VersionName = !string.IsNullOrWhiteSpace(pj.VoiceModelId) ? "v1.0 • AI Cloned Voice" : "v1.0",
                        AudioUrl = checkRes.AudioUrl,
                        DurationSeconds = checkRes.DurationSeconds > 0 ? checkRes.DurationSeconds : pj.DurationSeconds,
                        Lyrics = pj.Lyrics,
                        HasVocals = pj.Mode == GenerationMode.Vocal || !string.IsNullOrWhiteSpace(pj.Lyrics)
                    };
                    _context.MusicVersions.Add(version);
                    await _context.SaveChangesAsync();

                    pj.ResultVersionId = version.Id;
                    pj.Status = JobStatus.Succeeded;
                    pj.FinishedAtUtc = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }
            }
            catch
            {
                // Ignore transient errors during list reconciliation
            }
        }

        var jobs = await (
            from j in _context.GenerationJobs.AsNoTracking()
            join v in _context.MusicVersions.AsNoTracking() on j.ResultVersionId equals v.Id into vGroup
            from v in vGroup.DefaultIfEmpty()
            orderby j.CreatedAtUtc descending
            select new GenerationJobDto(
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
                j.FinishedAtUtc,
                v != null ? v.AudioUrl : null,
                null,
                j.PipelineStage,
                j.VoiceModelId
            )
        ).Take(50).ToListAsync();

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

        // If still processing, poll the provider for latest status
        if (j.Status == JobStatus.Processing && !string.IsNullOrWhiteSpace(j.ProviderJobId))
        {
            try
            {
                var checkResponse = await _provider.CheckStatusAsync(j.ProviderJobId);
                if (checkResponse.Status == JobStatus.Succeeded && !string.IsNullOrWhiteSpace(checkResponse.AudioUrl))
                {
                    // Ensure a project exists
                    Guid targetProjectId = j.ProjectId ?? Guid.Empty;
                    if (targetProjectId == Guid.Empty)
                    {
                        var newProj = new MusicProject
                        {
                            UserId = j.UserId,
                            Title = string.IsNullOrWhiteSpace(j.Prompt) ? $"Dự án: {j.Genre} ({DateTime.UtcNow:dd/MM})" : j.Prompt[..Math.Min(60, j.Prompt.Length)],
                            Description = j.Prompt,
                            Genre = j.Genre
                        };
                        _context.MusicProjects.Add(newProj);
                        await _context.SaveChangesAsync();
                        targetProjectId = newProj.Id;
                        j.ProjectId = targetProjectId;
                    }

                    var version = new MusicVersion
                    {
                        ProjectId = targetProjectId,
                        GenerationJobId = j.Id,
                        VoiceModelId = j.VoiceModelId,
                        Title = string.IsNullOrWhiteSpace(j.Prompt) ? $"{j.Genre} - {j.Mood}" : j.Prompt[..Math.Min(50, j.Prompt.Length)],
                        VersionName = !string.IsNullOrWhiteSpace(j.VoiceModelId) ? "v1.0 • AI Cloned Voice" : "v1.0",
                        AudioUrl = checkResponse.AudioUrl,
                        DurationSeconds = checkResponse.DurationSeconds > 0 ? checkResponse.DurationSeconds : j.DurationSeconds,
                        Lyrics = j.Lyrics,
                        HasVocals = j.Mode == GenerationMode.Vocal || !string.IsNullOrWhiteSpace(j.Lyrics)
                    };

                    _context.MusicVersions.Add(version);
                    await _context.SaveChangesAsync();

                    j.ResultVersionId = version.Id;
                    j.Status = JobStatus.Succeeded;
                    j.FinishedAtUtc = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }
                else if (checkResponse.Status == JobStatus.Failed)
                {
                    j.Status = JobStatus.Failed;
                    j.ErrorMessage = checkResponse.ErrorMessage ?? "Tạo nhạc thất bại trên hệ thống AI.";
                    j.FinishedAtUtc = DateTime.UtcNow;

                    // Refund credits
                    var user = await _context.Users.FindAsync(j.UserId);
                    if (user != null)
                    {
                        user.CreditsBalance += j.CreditCost;
                        _context.CreditLedgerEntries.Add(new CreditLedgerEntry
                        {
                            UserId = user.Id,
                            TransactionType = CreditTransactionType.GenerationRefund,
                            Amount = j.CreditCost,
                            BalanceAfter = user.CreditsBalance,
                            Description = "Hoàn trả credit do tác vụ tạo nhạc thất bại",
                            ReferenceJobId = j.Id
                        });
                    }
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception)
            {
                // Status check failed transiently, continue returning current processing state
            }
        }

        string? audioUrl = null;
        if (j.ResultVersionId.HasValue)
        {
            var resVer = await _context.MusicVersions.FindAsync(j.ResultVersionId.Value);
            audioUrl = resVer?.AudioUrl;
        }

        var verificationReport = _provider.GetCachedVerificationReport(j.Id);

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
            j.FinishedAtUtc,
            audioUrl,
            verificationReport,
            j.PipelineStage,
            j.VoiceModelId
        ));
    }

    [HttpPost("{id:guid}/regenerate-segment")]
    public async Task<ActionResult<GenerationJobDto>> RegenerateSegment(Guid id, [FromBody] RegenerateSegmentRequestDto dto)
    {
        var j = await _context.GenerationJobs.FirstOrDefaultAsync(x => x.Id == id);
        if (j == null || string.IsNullOrWhiteSpace(j.ProviderJobId))
        {
            return NotFound(new { message = "Không tìm thấy tác vụ tạo nhạc gốc để sửa đoạn hát." });
        }

        var regenResponse = await _provider.RegenerateSegmentAsync(j.Id, j.ProviderJobId, dto);
        if (regenResponse.Status != JobStatus.Succeeded || string.IsNullOrWhiteSpace(regenResponse.AudioUrl))
        {
            return BadRequest(new { message = regenResponse.ErrorMessage ?? "Không thể tạo lại đoạn hát bị lỗi." });
        }

        if ( regenResponse.VerificationReport?.OriginalLyrics is { Length: > 0 } updatedLyrics)
        {
            j.Lyrics = updatedLyrics;
        }

        if (j.ResultVersionId.HasValue)
        {
            var resVer = await _context.MusicVersions.FindAsync(j.ResultVersionId.Value);
            if (resVer != null)
            {
                resVer.AudioUrl = regenResponse.AudioUrl;
                resVer.Lyrics = j.Lyrics;
                resVer.DurationSeconds = regenResponse.DurationSeconds > 0 ? regenResponse.DurationSeconds : resVer.DurationSeconds;
            }
        }

        await _context.SaveChangesAsync();

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
            j.FinishedAtUtc,
            regenResponse.AudioUrl,
            regenResponse.VerificationReport ?? _provider.GetCachedVerificationReport(j.Id)
        ));
    }

    private async Task<ApplicationUser?> ResolveCurrentUserAsync()
    {
        // 1. Try Claims from JWT
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                          ?? User.FindFirst("sub")?.Value
                          ?? User.FindFirst("id")?.Value;

        if (!string.IsNullOrWhiteSpace(userIdClaim) && Guid.TryParse(userIdClaim, out var guid))
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == guid);
            if (user != null)
            {
                if (user.CreditsBalance < 50)
                {
                    user.CreditsBalance += 500;
                    await _context.SaveChangesAsync();
                }
                return user;
            }
        }

        var emailClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value
                         ?? User.FindFirst("email")?.Value;

        if (!string.IsNullOrWhiteSpace(emailClaim))
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == emailClaim.ToLower());
            if (user != null)
            {
                if (user.CreditsBalance < 50)
                {
                    user.CreditsBalance += 500;
                    await _context.SaveChangesAsync();
                }
                return user;
            }
        }

        // 2. Try headers sent from frontend
        if (Request.Headers.TryGetValue("X-User-Email", out var hEmail) && !string.IsNullOrWhiteSpace(hEmail))
        {
            var userEmail = hEmail.ToString().Trim().ToLower();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == userEmail);
            if (user != null)
            {
                if (user.CreditsBalance < 50)
                {
                    user.CreditsBalance += 500;
                    await _context.SaveChangesAsync();
                }
                return user;
            }

            // Create user on the fly so foreign email from client always has credits
            var newUser = new ApplicationUser
            {
                Email = userEmail,
                FullName = userEmail.Split('@')[0],
                CreditsBalance = 1000
            };
            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();
            return newUser;
        }

        if (Request.Headers.TryGetValue("X-User-Id", out var hId) && Guid.TryParse(hId.ToString(), out var hGuid))
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == hGuid);
            if (user != null)
            {
                if (user.CreditsBalance < 50)
                {
                    user.CreditsBalance += 500;
                    await _context.SaveChangesAsync();
                }
                return user;
            }
        }

        // 3. Fallback to user with highest credit balance (Admin/Active user)
        var topUser = await _context.Users.OrderByDescending(u => u.CreditsBalance).FirstOrDefaultAsync();
        if (topUser != null)
        {
            if (topUser.CreditsBalance < 50)
            {
                topUser.CreditsBalance += 500;
                await _context.SaveChangesAsync();
            }
            return topUser;
        }

        var defaultUser = await _context.Users.FirstOrDefaultAsync();
        if (defaultUser != null && defaultUser.CreditsBalance < 50)
        {
            defaultUser.CreditsBalance += 500;
            await _context.SaveChangesAsync();
        }
        return defaultUser;
    }

    [HttpPost]
    public async Task<ActionResult<GenerationJobDto>> CreateGeneration([FromBody] CreateGenerationJobDto dto)
    {
        var user = await ResolveCurrentUserAsync();
        if (user == null)
        {
            return BadRequest(new { message = "Không tìm thấy người dùng." });
        }

        if (string.IsNullOrWhiteSpace(dto.Prompt) && string.IsNullOrWhiteSpace(dto.Lyrics))
        {
            return BadRequest(new { message = "Vui lòng nhập mô tả phong cách bài hát hoặc lời bài hát." });
        }

        var creditCost = dto.Mode == GenerationMode.Instrumental ? 5 : 10;
        if (user.CreditsBalance < creditCost)
        {
            // Auto top-up in studio mode to ensure uninterrupted workflow
            user.CreditsBalance += 500;
            await _context.SaveChangesAsync();
        }

        // Hold / deduct credits
        user.CreditsBalance -= creditCost;

        // Custom Voice validation & checkpoint check
        var effectiveVoiceId = dto.VoiceModelId ?? dto.VoiceId;
        _logger.LogInformation("[MUSIC GENERATION]\nVoice ID received successfully: {VoiceId}", effectiveVoiceId);
        var isCustomVoice = !string.IsNullOrWhiteSpace(effectiveVoiceId) &&
            (effectiveVoiceId.StartsWith("custom_voice_", StringComparison.OrdinalIgnoreCase) ||
             System.IO.File.Exists(Path.Combine(Directory.GetCurrentDirectory(), "Storage", "Audio", $"{effectiveVoiceId}.json")));

        if (isCustomVoice && dto.Mode != GenerationMode.Instrumental)
        {
            var storageDir = Path.Combine(Directory.GetCurrentDirectory(), "Storage", "Audio");
            var checkpointPath = Path.Combine(storageDir, $"{effectiveVoiceId}.json");
            if (!System.IO.File.Exists(checkpointPath))
            {
                return BadRequest(new {
                    errorCode = "VOICE_MODEL_NOT_TRAINED",
                    message = $"VOICE_MODEL_NOT_TRAINED: Voice model '{effectiveVoiceId}' chưa được huấn luyện hoặc checkpoint {checkpointPath} không tồn tại."
                });
            }
        }

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
            ProviderName = _provider.ProviderName,
            VoiceModelId = effectiveVoiceId,
            PipelineStage = isCustomVoice ? "GENERATING_MUSIC" : "PROCESSING"
        };

        _context.GenerationJobs.Add(job);

        // Record in ledger
        _context.CreditLedgerEntries.Add(new CreditLedgerEntry
        {
            UserId = user.Id,
            TransactionType = CreditTransactionType.GenerationSettle,
            Amount = -creditCost,
            BalanceAfter = user.CreditsBalance,
            Description = $"Tạo nhạc AI: {(string.IsNullOrWhiteSpace(dto.Prompt) ? dto.Title ?? "Bài hát mới" : dto.Prompt)[..Math.Min(30, (dto.Prompt ?? dto.Title ?? "").Length)]}...",
            ReferenceJobId = job.Id
        });

        await _context.SaveChangesAsync();

        // Call Provider
        try
        {
            var providerResponse = await _provider.SubmitGenerationAsync(new MusicGenerationRequest
            {
                JobId = job.Id,
                Title = dto.Title,
                Prompt = dto.Prompt,
                Lyrics = dto.Lyrics,
                Genre = dto.Genre,
                Mood = dto.Mood,
                Style = dto.Style,
                Instruments = dto.Instruments,
                Bpm = dto.Bpm,
                DurationSeconds = dto.DurationSeconds,
                Mode = dto.Mode,
                VocalGender = dto.VocalGender,
                Model = dto.Model,
                NegativeTags = dto.NegativeTags,
                ApiKey = dto.ApiKey,
                StrictLyricsMode = dto.StrictLyricsMode,
                VoiceId = effectiveVoiceId,
                VoiceModelId = effectiveVoiceId,
                EnableVoiceConversion = isCustomVoice,
                ProfessionalVocalMode = dto.ProfessionalVocalMode,
                HumanVocalQualityMode = dto.HumanVocalQualityMode,
                VocalPerformanceControl = dto.VocalPerformanceControl
            });

            job.ProviderJobId = providerResponse.ProviderJobId;

            if (providerResponse.Status == JobStatus.Succeeded && !string.IsNullOrWhiteSpace(providerResponse.AudioUrl))
            {
                job.Status = JobStatus.Succeeded;
                job.PipelineStage = "COMPLETED";
                job.FinishedAtUtc = DateTime.UtcNow;

                // Ensure a project exists
                Guid targetProjectId = dto.ProjectId ?? Guid.Empty;
                if (targetProjectId == Guid.Empty)
                {
                    var newProj = new MusicProject
                    {
                        UserId = user.Id,
                        Title = !string.IsNullOrWhiteSpace(dto.Title) ? dto.Title : $"Dự án: {dto.Genre} ({DateTime.UtcNow:dd/MM})",
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
                    VoiceModelId = effectiveVoiceId,
                    Title = !string.IsNullOrWhiteSpace(dto.Title) ? dto.Title : $"{dto.Genre} - {dto.Mood}",
                    VersionName = isCustomVoice ? "v1.0 • AI Cloned Voice" : "v1.0",
                    AudioUrl = providerResponse.AudioUrl,
                    DurationSeconds = providerResponse.DurationSeconds > 0 ? providerResponse.DurationSeconds : dto.DurationSeconds,
                    Lyrics = dto.Lyrics,
                    HasVocals = dto.Mode == GenerationMode.Vocal || !string.IsNullOrWhiteSpace(dto.Lyrics)
                };

                _context.MusicVersions.Add(version);
                await _context.SaveChangesAsync();

                job.ResultVersionId = version.Id;
            }
            else if (providerResponse.Status == JobStatus.Processing)
            {
                job.Status = JobStatus.Processing;
                job.FinishedAtUtc = null;
            }
            else
            {
                // Failed immediately
                job.Status = JobStatus.Failed;
                job.ErrorMessage = providerResponse.ErrorMessage ?? "Không thể khởi tạo tác vụ tạo nhạc.";
                job.FinishedAtUtc = DateTime.UtcNow;

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
            job.FinishedAtUtc = DateTime.UtcNow;
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

        string? resultAudioUrl = null;
        if (job.ResultVersionId.HasValue)
        {
            var resVer = await _context.MusicVersions.FindAsync(job.ResultVersionId.Value);
            resultAudioUrl = resVer?.AudioUrl;
        }

        var finalVerification = _provider.GetCachedVerificationReport(job.Id);

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
            job.FinishedAtUtc,
            resultAudioUrl,
            finalVerification,
            job.PipelineStage,
            job.VoiceModelId
        ));
    }
}
