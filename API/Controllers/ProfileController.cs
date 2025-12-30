using API.Data;
using API.DTOs;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace API.Controllers;

[Authorize]
[ApiController]
[Route("api/profile")]
public class ProfileController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public ProfileController(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    // =====================================================
    // CREATE OR UPDATE PROFILE + MAIN IMAGE
    // =====================================================
    [HttpPost]
public async Task<IActionResult> CreateOrUpdate([FromForm] UserProfileDto dto)
{
    var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    var user = await _context.Users
        .Include(u => u.Photos)
        .Include(u => u.UserProfile)
        .FirstOrDefaultAsync(u => u.Id == userId);

    if (user == null) return Unauthorized();

    if (user.UserProfile == null)
        user.UserProfile = new UserProfile { AppUserId = userId };

    var uploads = Path.Combine(_env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot"), "uploads");
    Directory.CreateDirectory(uploads);

    // 1. Process Main Image
    if (dto.Image != null)
    {
        var fileName = Guid.NewGuid() + Path.GetExtension(dto.Image.FileName);
        var filePath = Path.Combine(uploads, fileName);
        using var stream = new FileStream(filePath, FileMode.Create);
        await dto.Image.CopyToAsync(stream);

        var imageUrl = $"/uploads/{fileName}";
        foreach (var p in user.Photos) p.IsMain = false;

        user.Photos.Add(new UserPhoto { Url = imageUrl, IsMain = true, AppUserId = userId });
        user.UserProfile.ImageUrl = imageUrl;
    }

    // 2. Process Extra Gallery Images (The fix for first-time login)
    if (dto.Images != null && dto.Images.Count > 0)
    {
        foreach (var file in dto.Images)
        {
            var fileName = Guid.NewGuid() + Path.GetExtension(file.FileName);
            var path = Path.Combine(uploads, fileName);
            using var stream = new FileStream(path, FileMode.Create);
            await file.CopyToAsync(stream);

            user.Photos.Add(new UserPhoto { Url = $"/uploads/{fileName}", IsMain = false, AppUserId = userId });
        }
    }

    user.UserProfile.Age = dto.Age ?? user.UserProfile.Age;
    user.UserProfile.City = dto.City ?? user.UserProfile.City;
    user.UserProfile.Bio = dto.Bio ?? user.UserProfile.Bio;

    await _context.SaveChangesAsync();
    return Ok(user.UserProfile);
}

    // =====================================================
    // UPLOAD EXTRA IMAGES (MAX 5)
    // =====================================================
    [HttpPost("images")]
    public async Task<IActionResult> UploadImages([FromForm] List<IFormFile> images)
    {
        var userId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );

        var user = await _context.Users
            .Include(u => u.Photos)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return Unauthorized();

        if (user.Photos.Count + images.Count > 6)
            return BadRequest("Total images cannot exceed 6");

        var uploads = Path.Combine(
            _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot"),
            "uploads"
        );

        Directory.CreateDirectory(uploads);

        foreach (var file in images)
        {
            var fileName = Guid.NewGuid() + Path.GetExtension(file.FileName);
            var path = Path.Combine(uploads, fileName);

            using var stream = new FileStream(path, FileMode.Create);
            await file.CopyToAsync(stream);

            user.Photos.Add(new UserPhoto
            {
                Url = $"/uploads/{fileName}",
                IsMain = false,
                AppUserId = userId
            });
        }

        await _context.SaveChangesAsync();
        return Ok(user.Photos);
    }

    // =====================================================
    // SET MAIN PHOTO
    // =====================================================
    [HttpPut("images/{photoId}/set-main")]
    public async Task<IActionResult> SetMainPhoto(int photoId)
    {
        var userId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );

        var user = await _context.Users
            .Include(u => u.Photos)
            .Include(u => u.UserProfile)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return Unauthorized();

        if (user.UserProfile == null)
        {
            user.UserProfile = new UserProfile
            {
                AppUserId = userId
            };
        }

        var selected = user.Photos.FirstOrDefault(p => p.Id == photoId);
        if (selected == null)
            return BadRequest("Photo not found");

        foreach (var p in user.Photos)
            p.IsMain = false;

        selected.IsMain = true;
        user.UserProfile.ImageUrl = selected.Url;

        await _context.SaveChangesAsync();
        return Ok("Done");
    }

    // =====================================================
    // DELETE PHOTO
    // =====================================================
    [HttpDelete("images/{id}")]
    public async Task<IActionResult> DeleteImage(int id)
    {
        var userId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );

        var photo = await _context.UserPhotos
            .FirstOrDefaultAsync(p => p.Id == id && p.AppUserId == userId);

        if (photo == null)
            return NotFound();

        _context.UserPhotos.Remove(photo);
        await _context.SaveChangesAsync();

        return Ok();
    }

    // =====================================================
    // GET MY PROFILE (🔥 KEY FOR REDIRECT LOGIC)
    // =====================================================
    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        var userId = int.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!
        );

        var user = await _context.Users
            .Include(u => u.UserProfile)
            .Include(u => u.Photos)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return NotFound();

        // 🔥 THIS LINE IS CRITICAL
        if (user.UserProfile == null)
            return NotFound();

        return Ok(new
        {
            userProfile = user.UserProfile,
            photos = user.Photos
        });
    }
}
