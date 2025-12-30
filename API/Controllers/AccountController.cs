using API.Data;
using API.DTOs;
using API.Entities;
using API.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("api/account")]
public class AccountController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly TokenService _tokenService;
    private readonly PasswordHasher<AppUser> _passwordHasher;

    public AccountController(AppDbContext context, TokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
        _passwordHasher = new PasswordHasher<AppUser>();
    }

    // ==========================
    // REGISTER
    // ==========================
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Username) ||
            string.IsNullOrWhiteSpace(dto.Password))
        {
            return BadRequest("Username and password are required");
        }

        if (await _context.Users.AnyAsync(x => x.Username == dto.Username))
        {
            return BadRequest("Username already exists");
        }

        var user = new AppUser
        {
            Username = dto.Username
        };

        // 🔐 HASH PASSWORD
        user.PasswordHash = _passwordHasher.HashPassword(user, dto.Password);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok("Registered successfully");
    }

    // ==========================
    // LOGIN
    // ==========================
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Username) ||
            string.IsNullOrWhiteSpace(dto.Password))
        {
            return BadRequest("Username and password are required");
        }

        var user = await _context.Users
            .SingleOrDefaultAsync(x => x.Username == dto.Username);

        if (user == null)
        {
            // ❌ Never reveal which part is wrong
            return Unauthorized("Invalid username or password");
        }

        var result = _passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            dto.Password
        );

        if (result == PasswordVerificationResult.Failed)
        {
            return Unauthorized("Invalid username or password");
        }

        return Ok(new
        {
            token = _tokenService.CreateToken(user)
        });
    }
}
