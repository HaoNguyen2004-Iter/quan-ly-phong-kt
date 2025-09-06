using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using QuanLyPhongKT.Api.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly QuanLyPhongKtContext _db;
    private readonly IConfiguration _cfg;

    public AuthController(QuanLyPhongKtContext db, IConfiguration cfg)
    {
        _db = db;
        _cfg = cfg;
    }

    public class LoginRequest
    {
        public string? Email { get; set; }
        public string? Password { get; set; }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest body)
    {
        if (string.IsNullOrWhiteSpace(body.Email) || string.IsNullOrWhiteSpace(body.Password))
            return BadRequest("Thiếu email hoặc mật khẩu.");

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == body.Email);
        if (user == null) return Unauthorized("Email hoặc mật khẩu không đúng.");

        if (!VerifyPassword(body.Password, user.PasswordHash))
            return Unauthorized("Email hoặc mật khẩu không đúng.");

        var now = DateTime.UtcNow;
        var jwtSection = _cfg.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSection["Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserID.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role ?? "staff")
        };

        var token = new JwtSecurityToken(
            issuer: jwtSection["Issuer"],
            audience: jwtSection["Audience"],
            claims: claims,
            notBefore: now,
            expires: now.AddMinutes(jwtSection.GetValue<int>("ExpireMinutes")),
            signingCredentials: creds
        );

        return Ok(new
        {
            token = new JwtSecurityTokenHandler().WriteToken(token),
            userId = user.UserID,
            email = user.Email,
            fullName = user.FullName,
            role = user.Role
        });
    }

    private static bool VerifyPassword(string inputPassword, byte[] storedHash)
    {
        using var sha = SHA256.Create();
        var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(inputPassword ?? ""));
        return storedHash != null && bytes.SequenceEqual(storedHash);
    }
}
