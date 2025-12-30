namespace API.Entities
{
    public class UserLike
    {
        public int Id { get; set; }

        public int LikerUserId { get; set; }
        public int LikedUserId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
