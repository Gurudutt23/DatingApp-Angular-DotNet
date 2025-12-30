public class UserProfileDto
{
    public string? Name { get; set; }
    public int? Age { get; set; }
    public string? City { get; set; }
    public string? Bio { get; set; }

    // This handles the Main Photo
    public IFormFile? Image { get; set; }

    // 🔥 ADD THIS: This handles the other 5 photos sent during first-time setup
    public List<IFormFile>? Images { get; set; } = new List<IFormFile>();
}