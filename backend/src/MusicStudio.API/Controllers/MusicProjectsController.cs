using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MusicStudio.Application.DTOs;
using MusicStudio.Application.Interfaces;
using MusicStudio.Domain.Entities;

namespace MusicStudio.API.Controllers;

[ApiController]
[Route("api/v1/music-projects")]
public class MusicProjectsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public MusicProjectsController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProjectDto>>> GetProjects([FromQuery] string? search)
    {
        var query = _context.MusicProjects
            .Include(p => p.Versions)
            .AsNoTracking();

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(p => p.Title.Contains(search) || p.Genre.Contains(search));
        }

        var projects = await query
            .OrderByDescending(p => p.CreatedAtUtc)
            .Select(p => new ProjectDto(
                p.Id,
                p.Title,
                p.Description,
                p.Genre,
                p.Versions.Count,
                p.CreatedAtUtc,
                p.UpdatedAtUtc
            ))
            .ToListAsync();

        return Ok(projects);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProjectDto>> GetProject(Guid id)
    {
        var project = await _context.MusicProjects
            .Include(p => p.Versions)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null)
        {
            return NotFound(new { message = "Không tìm thấy dự án." });
        }

        return Ok(new ProjectDto(
            project.Id,
            project.Title,
            project.Description,
            project.Genre,
            project.Versions.Count,
            project.CreatedAtUtc,
            project.UpdatedAtUtc
        ));
    }

    [HttpPost]
    public async Task<ActionResult<ProjectDto>> CreateProject([FromBody] CreateProjectDto dto)
    {
        // Get or default user
        var user = await _context.Users.FirstOrDefaultAsync();
        var userId = user?.Id ?? Guid.NewGuid();

        var project = new MusicProject
        {
            UserId = userId,
            Title = dto.Title,
            Description = dto.Description,
            Genre = dto.Genre
        };

        _context.MusicProjects.Add(project);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetProject), new { id = project.Id },
            new ProjectDto(project.Id, project.Title, project.Description, project.Genre, 0, project.CreatedAtUtc, null));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateProject(Guid id, [FromBody] UpdateProjectDto dto)
    {
        var project = await _context.MusicProjects.FirstOrDefaultAsync(p => p.Id == id);
        if (project == null)
        {
            return NotFound(new { message = "Không tìm thấy dự án." });
        }

        project.Title = dto.Title;
        project.Description = dto.Description;
        project.Genre = dto.Genre;
        project.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteProject(Guid id)
    {
        var project = await _context.MusicProjects.FirstOrDefaultAsync(p => p.Id == id);
        if (project == null)
        {
            return NotFound(new { message = "Không tìm thấy dự án." });
        }

        _context.MusicProjects.Remove(project);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
