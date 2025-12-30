using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization; // 🔥 MISSING IMPORT
using API.Data;
using API.Entities;

namespace API.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        // ===============================
        // GET ALL USERS (DISCOVER)
        // ===============================
        // ===============================
// GET ALL USERS (DISCOVER)
// ===============================
[HttpGet]
public async Task<IActionResult> GetUsers()
{
    var users = await _context.Users
        .Include(u => u.UserProfile)
        .Include(u => u.Photos)
        .Select(u => new
        {
            id = u.Id,
            username = u.Username,

            age = u.UserProfile != null ? u.UserProfile.Age : 0,
            city = u.UserProfile != null ? u.UserProfile.City : "",
            bio = u.UserProfile != null ? u.UserProfile.Bio : "",

            photos = u.Photos
                .OrderByDescending(p => p.IsMain) // main first
                .Select(p => new
                {
                    url = p.Url,
                    isMain = p.IsMain
                })
                .ToList()
        })
        .ToListAsync();

    return Ok(users);
}

// ===============================
// GET SINGLE USER (CHAT HEADER)
// ===============================
[Authorize]
[HttpGet("{id}")]
public async Task<IActionResult> GetUser(int id)
{
    var user = await _context.Users
        .Where(u => u.Id == id)
        .Include(u => u.UserProfile)
        .Include(u => u.Photos)
        .Select(u => new
        {
            id = u.Id,
            name = u.Username, // or display name later
            imageUrl = u.Photos
                .Where(p => p.IsMain)
                .Select(p => p.Url)
                .FirstOrDefault()
        })
        .FirstOrDefaultAsync();

    if (user == null)
        return NotFound();

    return Ok(user);
}

        // ===============================
        // GET USERS BY IDS (LIKED PROFILES)
        // ===============================
[Authorize]
[HttpPost("by-ids")]
public async Task<IActionResult> GetUsersByIds([FromBody] List<int> ids)
{
    if (ids == null || ids.Count == 0)
        return Ok(new List<object>());

    var users = await _context.Users
        .Where(u => ids.Contains(u.Id))
        .Include(u => u.UserProfile)
        .Include(u => u.Photos)
        .Select(u => new
        {
            id = u.Id,
            username = u.Username,

            age = u.UserProfile != null ? u.UserProfile.Age : 0,
            city = u.UserProfile != null ? u.UserProfile.City : "",
            bio = u.UserProfile != null ? u.UserProfile.Bio : "",

            imageUrl = u.Photos
                .Where(p => p.IsMain)
                .Select(p => p.Url)
                .FirstOrDefault()
        })
        .ToListAsync();

    return Ok(users);
}

    }
}
