using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using API.Entities;

namespace API.Services;

public class TokenService
{
    private readonly IConfiguration _config;

    public TokenService(IConfiguration config)
    {
        _config = config;
    }

    public string CreateToken(AppUser user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username)
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["TokenKey"]!)
        );

        var creds = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha512Signature
        );

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = creds
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        return tokenHandler.WriteToken(
            tokenHandler.CreateToken(tokenDescriptor)
        );
    }
}
