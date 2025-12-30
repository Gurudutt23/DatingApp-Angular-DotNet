using API.Entities;
using Microsoft.EntityFrameworkCore;

[Index(nameof(Username), IsUnique = true)]
public class AppUser
{
    public int Id { get; set; }

    public string Username { get; set; } = "";

    // 🔐 Store HASH, not password
    public string PasswordHash { get; set; } = "";

    public UserProfile? UserProfile { get; set; }

    public ICollection<UserPhoto> Photos { get; set; } 
        = new List<UserPhoto>();
}
