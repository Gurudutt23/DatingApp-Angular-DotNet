using API.Data;
using API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ==================== SERVICES ====================

builder.Services.AddControllers()
.AddJsonOptions(options => 
    {
        // This prevents the infinite loop crash
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy
            .WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});


// DB
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlite("Data Source=app.db");
});

// JWT
builder.Services.AddScoped<TokenService>();

var tokenKey = builder.Configuration["TokenKey"];
if (string.IsNullOrEmpty(tokenKey))
    throw new Exception("TokenKey missing");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey =
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey)),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// ==================== MIDDLEWARE ====================

// 1️⃣ Static files (uploads)
app.UseStaticFiles();

// 2️⃣ CORS — MUST BE FIRST REAL MIDDLEWARE
app.UseCors("AllowAngularApp");

// 3️⃣ Auth
app.UseAuthentication();
app.UseAuthorization();

// 4️⃣ Controllers
app.MapControllers();

app.Run();
    