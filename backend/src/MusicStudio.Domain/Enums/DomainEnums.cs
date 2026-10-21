namespace MusicStudio.Domain.Enums;

public enum JobStatus
{
    Queued = 0,
    Processing = 1,
    Succeeded = 2,
    Failed = 3,
    CancelRequested = 4,
    Cancelled = 5
}

public enum CreditTransactionType
{
    WelcomeBonus = 1,
    PackagePurchase = 2,
    GenerationHold = 3,
    GenerationSettle = 4,
    GenerationRefund = 5,
    AdminAdjustment = 6
}

public enum PaymentStatus
{
    Pending = 0,
    Completed = 1,
    Failed = 2,
    Refunded = 3
}

public enum GenerationMode
{
    Instrumental = 0,
    Vocal = 1
}
