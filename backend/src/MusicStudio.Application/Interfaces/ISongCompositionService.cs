namespace MusicStudio.Application.Interfaces;

/// <summary>
/// Request: a free-text description of the song the user wants, plus the option lists
/// the UI supports so the AI picks values that map directly onto the studio form.
/// </summary>
public record SongCompositionRequest(
    string Description,
    bool Instrumental,
    string? VocalGender,
    IReadOnlyList<string>? Genres,
    IReadOnlyList<string>? Moods,
    IReadOnlyList<string>? Styles,
    IReadOnlyList<string>? Instruments);

public record SongCompositionResult(
    string Title,
    string Prompt,
    string? Lyrics,
    string Genre,
    string Mood,
    string Style,
    IReadOnlyList<string> Instruments,
    int Bpm,
    int DurationSeconds,
    string? NegativeTags,
    string? Explanation);

public interface ISongCompositionService
{
    bool IsConfigured { get; }
    Task<SongCompositionResult> ComposeAsync(SongCompositionRequest request, CancellationToken cancellationToken = default);
}
