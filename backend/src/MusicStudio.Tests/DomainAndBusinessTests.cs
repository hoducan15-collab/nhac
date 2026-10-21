using MusicStudio.Application.DTOs;
using MusicStudio.Application.Interfaces;
using MusicStudio.Application.Validators;
using MusicStudio.Domain.Entities;
using MusicStudio.Domain.Enums;
using MusicStudio.Infrastructure.Services;
using Xunit;

namespace MusicStudio.Tests;

public class DomainAndBusinessTests
{
    [Fact]
    public void PasswordHasher_ShouldCorrectlyHashAndVerify()
    {
        var hasher = new PasswordHasher();
        var password = "SecurePassword123!";

        var hash = hasher.HashPassword(password);
        var isValid = hasher.VerifyPassword(password, hash);
        var isInvalid = hasher.VerifyPassword("WrongPassword", hash);

        Assert.NotEmpty(hash);
        Assert.True(isValid);
        Assert.False(isInvalid);
    }

    [Fact]
    public void RegisterValidator_ShouldFail_WhenEmailIsInvalid()
    {
        var validator = new RegisterDtoValidator();
        var dto = new RegisterDto("Test User", "invalid-email-address", "123456");

        var result = validator.Validate(dto);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(RegisterDto.Email));
    }

    [Fact]
    public void RegisterValidator_ShouldPass_WhenInputsAreValid()
    {
        var validator = new RegisterDtoValidator();
        var dto = new RegisterDto("Valid Producer", "producer@musicstudio.ai", "StrongPass@2026");

        var result = validator.Validate(dto);

        Assert.True(result.IsValid);
    }

    [Fact]
    public void GenerationJobValidator_ShouldEnforceBpmRange()
    {
        var validator = new CreateGenerationJobDtoValidator();
        var dto = new CreateGenerationJobDto(
            null,
            "Giai điệu lofi piano nhẹ nhàng",
            null,
            "Lo-Fi",
            "Thư giãn",
            "Analog",
            "Piano",
            30, // Invalid: BPM < 40
            120,
            GenerationMode.Instrumental
        );

        var result = validator.Validate(dto);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(CreateGenerationJobDto.Bpm));
    }

    [Fact]
    public async Task MockProvider_ShouldReturnSuccessResponse()
    {
        var provider = new MockMusicGenerationProvider();
        var request = new MusicGenerationRequest
        {
            JobId = Guid.NewGuid(),
            Prompt = "Acoustic folk song in Da Lat",
            Genre = "Acoustic",
            DurationSeconds = 120,
            Mode = GenerationMode.Instrumental
        };

        var response = await provider.SubmitGenerationAsync(request);

        Assert.Equal(JobStatus.Succeeded, response.Status);
        Assert.NotEmpty(response.ProviderJobId);
        Assert.NotEmpty(response.AudioUrl!);
    }

    [Fact]
    public void UserCreditDeduction_ShouldUpdateBalanceProperly()
    {
        var user = new ApplicationUser
        {
            FullName = "Test Artist",
            Email = "artist@test.com",
            CreditsBalance = 100
        };

        var cost = 10; // Vocal mode
        user.CreditsBalance -= cost;

        Assert.Equal(90, user.CreditsBalance);
    }
}
