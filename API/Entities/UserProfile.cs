namespace API.Entities
{
    public class UserProfile
    {
        public int Id { get; set; }
         public int AppUserId { get; set; }
         public AppUser? AppUser { get; set; } 
        public string Username { get; set; } = "";
        public int Age { get; set; }
        public string City { get; set; } = "";
        public string Bio { get; set; } = "";
        public string ImageUrl { get; set; } = "";
    }
}
