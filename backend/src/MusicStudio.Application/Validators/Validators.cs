using FluentValidation;
using MusicStudio.Application.DTOs;

namespace MusicStudio.Application.Validators;

public class RegisterDtoValidator : AbstractValidator<RegisterDto>
{
    public RegisterDtoValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Họ và tên không được để trống")
            .MaximumLength(100).WithMessage("Họ và tên tối đa 100 ký tự");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email không được để trống")
            .EmailAddress().WithMessage("Địa chỉ email không hợp lệ");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Mật khẩu không được để trống")
            .MinimumLength(6).WithMessage("Mật khẩu phải có ít nhất 6 ký tự");
    }
}

public class CreateProjectDtoValidator : AbstractValidator<CreateProjectDto>
{
    public CreateProjectDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Tên dự án không được để trống")
            .MaximumLength(150).WithMessage("Tên dự án tối đa 150 ký tự");

        RuleFor(x => x.Genre)
            .NotEmpty().WithMessage("Thể loại không được để trống");
    }
}

public class CreateGenerationJobDtoValidator : AbstractValidator<CreateGenerationJobDto>
{
    public CreateGenerationJobDtoValidator()
    {
        RuleFor(x => x.Prompt)
            .NotEmpty().WithMessage("Prompt mô tả bài nhạc không được để trống")
            .MaximumLength(1000).WithMessage("Prompt tối đa 1000 ký tự");

        RuleFor(x => x.Genre)
            .NotEmpty().WithMessage("Thể loại không được để trống");

        RuleFor(x => x.Bpm)
            .InclusiveBetween(40, 240).WithMessage("BPM phải nằm trong khoảng từ 40 đến 240");

        RuleFor(x => x.DurationSeconds)
            .InclusiveBetween(15, 300).WithMessage("Thời lượng bài hát từ 15 đến 300 giây");
    }
}
