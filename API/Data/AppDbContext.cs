using Microsoft.EntityFrameworkCore;
using API.Entities;

namespace API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<UserProfile> UserProfiles { get; set; }
    public DbSet<UserPhoto> UserPhotos { get; set; }
    public DbSet<UserLike> UserLikes { get; set; }
    public DbSet<Message> Messages { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // builder.Entity<AppUser>()
        //     .HasOne(u => u.UserProfile)
        //     .WithOne(p => p.AppUser)
        //     .HasForeignKey<UserProfile>(p => p.AppUserId);
    }
}
