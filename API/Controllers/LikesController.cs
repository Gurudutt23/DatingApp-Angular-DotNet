using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/likes")]
    public class LikesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LikesController(AppDbContext context)
        {
            _context = context;
        }

        // =====================================================
        // ❤️ LIKE / LIKE BACK (IDEMPOTENT)
        // =====================================================
        [HttpPost("{likedUserId}")]
        public async Task<IActionResult> LikeUser(int likedUserId)
        {
            var likerId = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!
            );

            // 🔐 Guard: cannot like yourself
            if (likerId == likedUserId)
                return BadRequest("Cannot like yourself");

            // 🔁 Check if already liked
            var alreadyLiked = await _context.UserLikes.AnyAsync(
                x => x.LikerUserId == likerId &&
                     x.LikedUserId == likedUserId
            );

            // ✅ Already liked → just return OK (LIKE BACK SAFE)
            if (alreadyLiked)
                return Ok();

            _context.UserLikes.Add(new UserLike
            {
                LikerUserId = likerId,
                LikedUserId = likedUserId,
                CreatedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return Ok();
        }

        // =====================================================
        // 🔔 WHO LIKED ME
        // =====================================================
        [HttpGet("received")]
        public async Task<IActionResult> LikesReceived()
        {
            var userId = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!
            );

            var likes = await _context.UserLikes
                .Where(x =>
                    x.LikedUserId == userId &&
                    x.LikerUserId != userId
                )
                .Select(x => new
                {
                    x.LikerUserId,
                    x.CreatedAt
                })
                .ToListAsync();

            return Ok(likes);
        }

        // =====================================================
        // ❤️ WHO I LIKED
        // =====================================================
        [HttpGet("given")]
        public async Task<IActionResult> LikesGiven()
        {
            var userId = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!
            );

            var likes = await _context.UserLikes
                .Where(x => x.LikerUserId == userId)
                .Select(x => new
                {
                    x.LikedUserId
                })
                .ToListAsync();

            return Ok(likes);
        }

        // =====================================================
        // 💞 MATCHES
        // =====================================================
        [HttpGet("matches")]
        public async Task<IActionResult> GetMatches()
        {
            var userId = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!
            );

            var matches = await _context.UserLikes
                .Where(l =>
                    l.LikerUserId == userId &&
                    _context.UserLikes.Any(r =>
                        r.LikerUserId == l.LikedUserId &&
                        r.LikedUserId == userId
                    )
                )
                .Select(l => new
                {
                    id = l.LikedUserId
                })
                .ToListAsync();

            return Ok(matches);
        }
    }
}
