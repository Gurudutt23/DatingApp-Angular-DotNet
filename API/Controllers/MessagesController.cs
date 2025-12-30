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
    [Route("api/messages")]
    public class MessagesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MessagesController(AppDbContext context)
        {
            _context = context;
        }

        // =====================================================
        // GET MESSAGES BETWEEN CURRENT USER AND MATCHED USER
        // =====================================================
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetMessages(int userId)
        {
            var currentUserId = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!
            );

            var messages = await _context.Messages
                .Where(m =>
                    (m.SenderId == currentUserId && m.ReceiverId == userId) ||
                    (m.SenderId == userId && m.ReceiverId == currentUserId)
                )
                .OrderBy(m => m.CreatedAt)
                .Select(m => new
                {
                    m.Id,
                    m.Content,
                    m.SenderId,      // 🔥 MUST BE RETURNED
                    m.ReceiverId,
                    m.CreatedAt
                })
                .ToListAsync();

            return Ok(messages);
        }

        // =====================================================
        // SEND MESSAGE (ONLY BETWEEN MATCHED USERS)
        // =====================================================
        [HttpPost("{userId}")]
        public async Task<IActionResult> SendMessage(
            int userId,
            [FromBody] MessageDto dto)
        {
            var senderId = int.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!
            );

            if (string.IsNullOrWhiteSpace(dto.Content))
                return BadRequest("Message cannot be empty");

            // 🔐 ENSURE BOTH USERS LIKED EACH OTHER (MATCH)
            var isMatched =
                await _context.UserLikes.AnyAsync(l =>
                    l.LikerUserId == senderId &&
                    l.LikedUserId == userId
                )
                &&
                await _context.UserLikes.AnyAsync(l =>
                    l.LikerUserId == userId &&
                    l.LikedUserId == senderId
                );

            if (!isMatched)
                return Forbid("You are not matched with this user");

            var message = new Message
            {
                SenderId = senderId,           // 🔥 CRITICAL
                ReceiverId = userId,
                Content = dto.Content,
                CreatedAt = DateTime.UtcNow
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            // 🔥 RETURN FULL MESSAGE BACK
            return Ok(new
            {
                message.Id,
                message.Content,
                message.SenderId,
                message.ReceiverId,
                message.CreatedAt
            });
        }
        // =====================================================
// GET ALL CONVERSATIONS (CHAT LIST)
// =====================================================
[HttpGet("conversations")]
public async Task<IActionResult> GetConversations()
{
    var currentUserId = int.Parse(
        User.FindFirstValue(ClaimTypes.NameIdentifier)!
    );

    var conversations = await _context.Messages
        .Where(m =>
            m.SenderId == currentUserId ||
            m.ReceiverId == currentUserId
        )
        .GroupBy(m =>
            m.SenderId == currentUserId
                ? m.ReceiverId
                : m.SenderId
        )
        .Select(g => new
        {
            userId = g.Key,

            lastMessage = g
                .OrderByDescending(m => m.CreatedAt)
                .Select(m => m.Content)
                .FirstOrDefault(),

            lastMessageAt = g.Max(m => m.CreatedAt)
        })
        .OrderByDescending(c => c.lastMessageAt)
        .ToListAsync();

    // 🔥 JOIN USER DATA
    var userIds = conversations.Select(c => c.userId).ToList();

    var users = await _context.Users
        .Where(u => userIds.Contains(u.Id))
        .Include(u => u.Photos)
        .Select(u => new
        {
            u.Id,
            u.Username,
            imageUrl = u.Photos
                .Where(p => p.IsMain)
                .Select(p => p.Url)
                .FirstOrDefault()
        })
        .ToListAsync();

    var result = conversations.Select(c =>
    {
        var user = users.First(u => u.Id == c.userId);
        return new
        {
            userId = user.Id,
            name = user.Username,
            imageUrl = user.imageUrl,
            c.lastMessage,
            c.lastMessageAt
        };
    });

    return Ok(result);
}

    }
    
    // =====================================================
    // DTO
    // =====================================================
    public class MessageDto
    {
        public string Content { get; set; } = string.Empty;
    }
}
