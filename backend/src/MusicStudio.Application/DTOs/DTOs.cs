using MusicStudio.Domain.Enums;

namespace MusicStudio.Application.DTOs;

// --- Auth DTOs ---
public record RegisterDto(string FullName, string Email, string Password);
public record LoginDto(string Email, string Password);
public record RefreshTokenRequestDto(string AccessToken, string RefreshToken);

public record UserProfileDto(
    Guid Id,
    string FullName,
    string Email,
    string Role,
    int CreditsBalance,
    DateTime CreatedAtUtc
);

public record AuthResponseDto(
    string AccessToken,
    string RefreshToken,
    int ExpiresInSeconds,
    UserProfileDto User
);

// --- Project DTOs ---
public record CreateProjectDto(string Title, string Description, string Genre);
public record UpdateProjectDto(string Title, string Description, string Genre);

public record ProjectDto(
    Guid Id,
    string Title,
    string Description,
    string Genre,
    int VersionsCount,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc
);

// --- Generation DTOs ---
public record VocalPerformanceControlDto(
    string Language = "vi",
    string SingingStyle = "pop_ballad",
    string VocalGender = "female",
    string Emotion = "romantic",
    double ExpressionLevel = 0.85,
    string Vibrato = "natural",
    string PitchTransition = "smooth",
    string Breathiness = "moderate",
    string VocalDynamics = "expressive",
    string Phrasing = "natural",
    string Melisma = "subtle",
    string VocalQuality = "studio"
);

public record CreateGenerationJobDto(
    Guid? ProjectId,
    string Prompt,
    string? Lyrics,
    string Genre,
    string Mood,
    string Style,
    string Instruments,
    int Bpm,
    int DurationSeconds,
    GenerationMode Mode,
    string? Title = null,
    string? VocalGender = null,
    string? Model = null,
    string? NegativeTags = null,
    string? ApiKey = null,
    bool StrictLyricsMode = true,
    string? VoiceId = null,
    string? VoiceModelId = null,
    bool EnableVoiceConversion = true,
    bool ProfessionalVocalMode = true,
    bool HumanVocalQualityMode = true,
    VocalPerformanceControlDto? VocalPerformanceControl = null
);

public record VocalCandidateDto(
    string CandidateId,
    string CandidateName,
    string Description,
    string AudioUrl,
    string VocalAudioUrl,
    bool IsSelected,
    double Naturalness,
    double PitchAccuracy,
    double PronunciationAccuracy,
    double Expressiveness,
    double TimbreConsistency,
    double ArtifactFree,
    double OverallScore,
    double RhythmAccuracy = 99.4,
    double PhonemeAlignment = 99.2,
    double VocalClarity = 98.8
);

public record WordAlignmentDto(
    string? OriginalWord,
    string? RecognizedWord,
    string Status
);

public record LineVerificationReportDto(
    int LineIndex,
    string Section,
    string OriginalLine,
    string PronunciationLine,
    string RecognizedLine,
    double StartTime,
    double EndTime,
    string TargetMidiNote,
    double TargetSemitone,
    IReadOnlyList<string> Tones,
    IReadOnlyList<string> Phonemes,
    double WordErrorRate,
    double AccuracyPercent,
    bool HasError,
    IReadOnlyList<WordAlignmentDto> WordAlignments
);

public record LyricsVerificationReportDto(
    bool StrictLyricsMode,
    string StyleProfile,
    string VoiceId,
    string OriginalLyrics,
    string NormalizedLyrics,
    string RecognizedLyrics,
    double WordErrorRate,
    double AccuracyPercent,
    IReadOnlyList<string> MissingWords,
    IReadOnlyList<string> SubstitutedWords,
    IReadOnlyList<string> ExtraWords,
    IReadOnlyList<WordAlignmentDto> WordAlignments,
    IReadOnlyList<LineVerificationReportDto> LineReports,
    string? VocalAudioUrl = null,
    IReadOnlyList<VocalCandidateDto>? VocalCandidates = null
);

public record RegenerateSegmentRequestDto(
    int LineIndex,
    string? UpdatedLineText = null,
    double SemitoneNudge = 0.5
);

public record VoiceProfileDto(
    string VoiceId,
    string VoiceName,
    string VoiceDescription,
    string Gender,
    string VoiceSampleUrl,
    IReadOnlyList<string> SupportedLanguages,
    IReadOnlyList<string> SupportedSingingStyles,
    string VoiceModelReference,
    string ConsentStatus,
    bool IsAuthorizedForUse,
    string VocalRange = "A3 - A5",
    string Timbre = "Warm, Open Chest & Silky Air",
    string EmotionalCharacteristics = "Deep Emotional Ballad, Natural Vibrato & Legato"
);

public record CreateVoiceCloneRequestDto(
    string VoiceName,
    string VoiceDescription,
    string Gender,
    string SampleAudioUrl,
    bool HasExplicitOwnerConsent,
    string OwnerFullName,
    string ConsentStatement,
    bool IsCelebrityOrThirdPartyWithoutLicense = false
);

// --- AI Voice Cloning & Singing Voice Conversion (SVC) DTOs ---
public record VocalExtractionRequestDto(
    string AudioUrl,
    string Mode = "ai"
);

public record VocalExtractionResponseDto(
    string Status,
    double DurationSeconds,
    string VocalAudioUrl,
    string InstrumentalAudioUrl,
    double VocalIsolationRatio = 99.1,
    double InstrumentalPreservationRatio = 99.4,
    string ModelUsed = "HDemucs High MUSDB+ (Deep Neural Source Separation)",
    double VocalLeakageDb = -28.6,
    double SnrDb = 26.2
);

public record SingingConversionRequestDto(
    string GuideVocalUrl,
    string VoiceId,
    double SemitoneShift = 0.0,
    string? OptionalInstrumentalUrl = null
);

public record SingingConversionResponseDto(
    string Status,
    string VoiceId,
    string ConvertedVocalUrl,
    string? MixedSongUrl,
    double DurationSeconds,
    double Naturalness,
    double TimbreSimilarity,
    double PitchPreservation,
    double RhythmPreservation,
    double ArtifactFree
);

public record GenerationJobDto(
    Guid Id,
    Guid? ProjectId,
    string Prompt,
    string? Lyrics,
    string Genre,
    string Mood,
    JobStatus Status,
    int CreditCost,
    string? ErrorMessage,
    Guid? ResultVersionId,
    DateTime CreatedAtUtc,
    DateTime? FinishedAtUtc,
    string? AudioUrl = null,
    LyricsVerificationReportDto? VerificationReport = null,
    string? PipelineStage = null,
    string? VoiceModelId = null
);

public record MusicVersionDto(
    Guid Id,
    Guid ProjectId,
    string Title,
    string VersionName,
    string AudioUrl,
    int DurationSeconds,
    bool IsFavorite,
    DateTime CreatedAtUtc,
    string? Lyrics = null,
    bool HasVocals = false
);

// --- Credit & Billing DTOs ---
public record CreditLedgerDto(
    Guid Id,
    CreditTransactionType TransactionType,
    int Amount,
    int BalanceAfter,
    string Description,
    DateTime CreatedAtUtc
);

public record CheckoutRequestDto(
    int CreditsAmount,
    decimal PriceVnd,
    string PaymentGateway
);

public record CheckoutResponseDto(
    string OrderCode,
    decimal AmountVnd,
    int CreditsGranted,
    string PaymentUrl,
    string Status
);

// --- Admin DTOs ---
public record AdminStatsDto(
    int TotalUsers,
    int TotalJobs,
    decimal TotalRevenueVnd,
    double ErrorRatePercentage
);
