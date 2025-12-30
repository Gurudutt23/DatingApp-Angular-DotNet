namespace API.Entities
{
    public class UserPhoto
    {
        public int Id { get; set; }
        public string Url { get; set; } = "";
        public bool IsMain { get; set; }

        public int AppUserId { get; set; }
        public AppUser AppUser { get; set; } = null!;
    }
}
