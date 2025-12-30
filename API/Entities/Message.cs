public class Message
{
    public int Id { get; set; }

    public int SenderId { get; set; }      // ❌ NOT nullable
    public int ReceiverId { get; set; }    // ❌ NOT nullable

    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
