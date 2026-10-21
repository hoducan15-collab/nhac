using Microsoft.EntityFrameworkCore;
using MusicStudio.Domain.Entities;
using MusicStudio.Infrastructure;
using MusicStudio.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// Add Infrastructure & Application services
builder.Services.AddInfrastructure(builder.Configuration);

// Add Controllers and JSON options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// Configure CORS for Next.js frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Configure OpenAPI
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

// Ensure Database is Created & Seeded in Development
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await context.Database.EnsureCreatedAsync();

    // Seed Demo Users if empty
    if (!await context.Users.AnyAsync())
    {
        var hasher = scope.ServiceProvider.GetRequiredService<MusicStudio.Application.Interfaces.IPasswordHasher>();

        var adminUser = new ApplicationUser
        {
            FullName = "Admin Quản Trị",
            Email = "admin@musicstudio.ai",
            PasswordHash = hasher.HashPassword("Admin@123456"),
            Role = "Admin",
            CreditsBalance = 9999,
            IsActive = true
        };

        var demoUser = new ApplicationUser
        {
            FullName = "Nhạc Sĩ Demo",
            Email = "demo@musicstudio.ai",
            PasswordHash = hasher.HashPassword("Demo@123456"),
            Role = "User",
            CreditsBalance = 100,
            IsActive = true
        };

        context.Users.AddRange(adminUser, demoUser);
        await context.SaveChangesAsync();

        // Seed sample projects & versions
        var sampleProject = new MusicProject
        {
            UserId = demoUser.Id,
            Title = "Album Khởi Đầu Mới",
            Description = "Tuyển tập các giai điệu acoustic và lofi mộc mạc",
            Genre = "Acoustic / Indie"
        };
        context.MusicProjects.Add(sampleProject);
        await context.SaveChangesAsync();

        var sampleVersion = new MusicVersion
        {
            ProjectId = sampleProject.Id,
            Title = "Khúc Hát Ban Mai",
            VersionName = "v1.0 (Master Mix)",
            AudioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            DurationSeconds = 174
        };
        context.MusicVersions.Add(sampleVersion);

        // Seed subscription plans
        context.SubscriptionPlans.AddRange(
            new SubscriptionPlan { Name = "Free Starter", Description = "Miễn phí khởi đầu", PriceVnd = 0, MonthlyCredits = 15 },
            new SubscriptionPlan { Name = "Creator", Description = "Gói nhà sáng tạo nội dung", PriceVnd = 199000, MonthlyCredits = 500 },
            new SubscriptionPlan { Name = "Pro Studio", Description = "Gói phòng thu chuyên nghiệp", PriceVnd = 499000, MonthlyCredits = 1500 }
        );

        await context.SaveChangesAsync();
    }
}

// HTTP Pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
