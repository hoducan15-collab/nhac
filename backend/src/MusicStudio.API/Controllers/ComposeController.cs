using Microsoft.AspNetCore.Mvc;
using MusicStudio.Application.Interfaces;

namespace MusicStudio.API.Controllers;

/// <summary>
/// AI songwriting assistant: describe a song in plain words, get back title, lyrics and a full style brief.
/// POST /api/v1/compose
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
public class ComposeController : ControllerBase
{
    private readonly ISongCompositionService _composer;
    private readonly ILogger<ComposeController> _logger;

    public ComposeController(ISongCompositionService composer, ILogger<ComposeController> logger)
    {
        _composer = composer;
        _logger = logger;
    }

    [HttpGet("status")]
    public ActionResult GetStatus() => Ok(new { configured = _composer.IsConfigured });

    [HttpPost]
    public async Task<ActionResult<SongCompositionResult>> Compose([FromBody] SongCompositionRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Description) || request.Description.Trim().Length < 5)
            return BadRequest(new { message = "Vui lòng mô tả bài hát chi tiết hơn (ít nhất 5 ký tự)." });

        if (request.Description.Length > 2000)
            return BadRequest(new { message = "Mô tả quá dài (tối đa 2000 ký tự)." });

        if (!_composer.IsConfigured)
            return StatusCode(503, new { message = "Máy chủ chưa cấu hình OpenAI API key." });

        try
        {
            var result = await _composer.ComposeAsync(request, ct);
            return Ok(result);
        }
        catch (Exception ex) when (ex is HttpRequestException or InvalidOperationException or System.Text.Json.JsonException)
        {
            _logger.LogWarning(ex, "Compose failed");
            return StatusCode(502, new { message = $"AI sáng tác gặp lỗi: {ex.Message}" });
        }
        catch (TaskCanceledException)
        {
            return StatusCode(504, new { message = "AI phản hồi quá lâu, vui lòng thử lại." });
        }
    }
}
