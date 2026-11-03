using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MusicStudio.Application.Interfaces;

namespace MusicStudio.Infrastructure.Services;

/// <summary>
/// Turns a free-text song description into a full composition brief (title, Suno-style prompt,
/// Vietnamese lyrics with [Verse]/[Chorus] tags, genre, mood, BPM...) using OpenAI Chat Completions.
/// The API key is read only from server config (user-secrets "OpenAI:ApiKey") or env OPENAI_API_KEY.
/// </summary>
public class OpenAiSongCompositionService : ISongCompositionService
{
    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<OpenAiSongCompositionService> _logger;

    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

    public OpenAiSongCompositionService(
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        ILogger<OpenAiSongCompositionService> logger)
    {
        _configuration = configuration;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    private string? ApiKey =>
        _configuration["OpenAI:ApiKey"] is { Length: > 0 } k ? k.Trim()
        : Environment.GetEnvironmentVariable("OPENAI_API_KEY")?.Trim();

    private string Model => _configuration["OpenAI:Model"] is { Length: > 0 } m ? m : "gpt-4o-mini";

    private string BaseUrl => (_configuration["OpenAI:Endpoint"] is { Length: > 0 } e
        ? e : "https://api.openai.com/v1").TrimEnd('/');

    public bool IsConfigured => !string.IsNullOrWhiteSpace(ApiKey);

    public async Task<SongCompositionResult> ComposeAsync(SongCompositionRequest request, CancellationToken cancellationToken = default)
    {
        if (!IsConfigured)
            throw new InvalidOperationException("Chưa cấu hình OpenAI API key trên máy chủ (OpenAI:ApiKey).");

        var systemPrompt = BuildSystemPrompt(request);
        var userPrompt = $"Mô tả bài hát của người dùng:\n\"\"\"\n{request.Description.Trim()}\n\"\"\"";

        var body = new
        {
            model = Model,
            temperature = 0.9,
            response_format = new { type = "json_object" },
            messages = new object[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = userPrompt }
            }
        };

        var client = _httpClientFactory.CreateClient("OpenAIClient");
        client.Timeout = TimeSpan.FromSeconds(90);

        using var httpReq = new HttpRequestMessage(HttpMethod.Post, $"{BaseUrl}/chat/completions")
        {
            Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json")
        };
        httpReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", ApiKey);

        using var resp = await client.SendAsync(httpReq, cancellationToken);
        var raw = await resp.Content.ReadAsStringAsync(cancellationToken);

        if (!resp.IsSuccessStatusCode)
        {
            _logger.LogWarning("OpenAI error {Status}: {Body}", (int)resp.StatusCode, raw);
            var msg = TryReadOpenAiError(raw) ?? $"OpenAI trả về lỗi {(int)resp.StatusCode}.";
            throw new HttpRequestException(msg);
        }

        using var doc = JsonDocument.Parse(raw);
        var content = doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString();

        if (string.IsNullOrWhiteSpace(content))
            throw new InvalidOperationException("OpenAI không trả về nội dung sáng tác.");

        var parsed = JsonSerializer.Deserialize<RawComposition>(content, JsonOpts)
                     ?? throw new InvalidOperationException("Không đọc được kết quả sáng tác từ AI.");

        return Normalize(parsed, request);
    }

    private static string BuildSystemPrompt(SongCompositionRequest r)
    {
        static string List(IReadOnlyList<string>? items) =>
            items is { Count: > 0 } ? string.Join(" | ", items.Select(i => $"\"{i}\"")) : "(tự do)";

        var vocal = r.Instrumental
            ? "Bài hát KHÔNG LỜI (instrumental): trường \"lyrics\" phải là chuỗi rỗng."
            : $"Bài hát CÓ LỜI, ca sĩ {(r.VocalGender == "male" ? "nam" : "nữ")}. Viết lời tiếng Việt (trừ khi người dùng yêu cầu ngôn ngữ khác).";

        return $$"""
        Bạn là nhạc sĩ & nhà sản xuất âm nhạc chuyên nghiệp người Việt. Nhiệm vụ: từ mô tả của người dùng,
        sáng tác một bản brief hoàn chỉnh để đưa vào AI tạo nhạc (kiểu Suno).

        {{vocal}}

        Quy tắc lời bài hát (Tối ưu cho giọng hát Tiếng Việt AI):
        - Dùng các thẻ cấu trúc chuẩn trên dòng riêng: [Intro], [Verse 1], [Pre-Chorus], [Chorus], [Verse 2], [Bridge], [Outro]. (Không viết thêm mô tả tiếng Anh vào trong ngoặc vuông để tránh ca sĩ AI hát nhầm thẻ).
        - Lời tiếng Việt có vần điệu tự nhiên, ưu tiên nguyên âm mở ở cuối câu để ca sĩ AI ngân (vibrato) mượt mà, rõ 6 thanh điệu tiếng Việt; điệp khúc bắt tai và giàu cảm xúc.
        - Độ dài vừa với bài 2-4 phút (khoảng 16-32 dòng hát).

        Trường "prompt": mô tả phong cách & kỹ thuật giọng hát bằng TIẾNG ANH, ngắn gọn (<= 200 ký tự), gồm thể loại, nhạc cụ,
        chất giọng (airy/warm/soulful, smooth vibrato, clear vietnamese pronunciation, studio vocal reverb), không khí, tempo.
        Ví dụ: "emotional vietnamese pop ballad, soft piano, lush strings, sweet female soprano vocals, smooth vibrato, 72 bpm".

        Chọn giá trị từ các danh sách sau (copy CHÍNH XÁC một giá trị):
        - genre: {{List(r.Genres)}}
        - mood: {{List(r.Moods)}}
        - style: {{List(r.Styles)}}
        - instruments (chọn 1-4 giá trị): {{List(r.Instruments)}}

        Trả về DUY NHẤT một JSON object với đúng các khóa:
        {
          "title": "tên bài hát tiếng Việt",
          "prompt": "english style prompt",
          "lyrics": "lời bài hát có thẻ cấu trúc, xuống dòng bằng \n",
          "genre": "...",
          "mood": "...",
          "style": "...",
          "instruments": ["..."],
          "bpm": 60-180,
          "durationSeconds": 30-360,
          "negativeTags": "những âm thanh nên tránh (tiếng Anh) hoặc chuỗi rỗng",
          "explanation": "1-2 câu tiếng Việt giải thích ý tưởng sáng tác"
        }
        """;
    }

    private static SongCompositionResult Normalize(RawComposition p, SongCompositionRequest r)
    {
        static string Pick(string? value, IReadOnlyList<string>? options, string fallback)
        {
            if (options is not { Count: > 0 }) return string.IsNullOrWhiteSpace(value) ? fallback : value.Trim();
            if (string.IsNullOrWhiteSpace(value)) return options[0];
            return options.FirstOrDefault(o => o.Equals(value.Trim(), StringComparison.OrdinalIgnoreCase))
                   ?? options.FirstOrDefault(o => o.Contains(value.Trim(), StringComparison.OrdinalIgnoreCase)
                                                  || value.Contains(o, StringComparison.OrdinalIgnoreCase))
                   ?? options[0];
        }

        var instruments = (p.Instruments ?? new List<string>())
            .Select(i => r.Instruments is { Count: > 0 }
                ? r.Instruments.FirstOrDefault(o => o.Equals(i?.Trim(), StringComparison.OrdinalIgnoreCase))
                : i?.Trim())
            .Where(i => !string.IsNullOrWhiteSpace(i))
            .Select(i => i!)
            .Distinct()
            .ToList();

        string? negativeTags = null;
        if (p.NegativeTags.HasValue)
        {
            if (p.NegativeTags.Value.ValueKind == JsonValueKind.String)
                negativeTags = p.NegativeTags.Value.GetString();
            else if (p.NegativeTags.Value.ValueKind == JsonValueKind.Array)
                negativeTags = string.Join(", ", p.NegativeTags.Value.EnumerateArray().Select(x => x.GetString()).Where(x => !string.IsNullOrEmpty(x)));
        }

        return new SongCompositionResult(
            Title: string.IsNullOrWhiteSpace(p.Title) ? "Bài hát mới" : p.Title.Trim(),
            Prompt: (p.Prompt ?? r.Description).Trim(),
            Lyrics: r.Instrumental ? null : p.Lyrics?.Trim(),
            Genre: Pick(p.Genre, r.Genres, "Pop / Ballad"),
            Mood: Pick(p.Mood, r.Moods, "Thư giãn & Bình yên"),
            Style: Pick(p.Style, r.Styles, "Modern Studio Production"),
            Instruments: instruments,
            Bpm: Math.Clamp(p.Bpm ?? 100, 60, 180),
            DurationSeconds: Math.Clamp(p.DurationSeconds ?? 150, 30, 360),
            NegativeTags: string.IsNullOrWhiteSpace(negativeTags) ? null : negativeTags.Trim(),
            Explanation: p.Explanation?.Trim());
    }

    private static string? TryReadOpenAiError(string raw)
    {
        try
        {
            using var doc = JsonDocument.Parse(raw);
            return doc.RootElement.GetProperty("error").GetProperty("message").GetString();
        }
        catch
        {
            return null;
        }
    }

    private sealed class RawComposition
    {
        public string? Title { get; set; }
        public string? Prompt { get; set; }
        public string? Lyrics { get; set; }
        public string? Genre { get; set; }
        public string? Mood { get; set; }
        public string? Style { get; set; }
        public List<string>? Instruments { get; set; }
        public int? Bpm { get; set; }
        public int? DurationSeconds { get; set; }
        public JsonElement? NegativeTags { get; set; }
        public string? Explanation { get; set; }
    }
}
