using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyPhongKT.Api.Models;
using System.Security.Claims;
using System.Globalization;

[ApiController]
// Cố định route: /api/Profile/...
[Route("api/Profile")]
public class ProfilesController : ControllerBase
{
    private readonly QuanLyPhongKtContext _db;
    private readonly IWebHostEnvironment _env;

    public ProfilesController(QuanLyPhongKtContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    // ===== Helpers ===============================================================

    private static string? ToYMD(object? v)
    {
        if (v == null) return null;
        if (v is DateOnly d) return d.ToString("yyyy-MM-dd");
        if (v is DateTime dt) return dt.ToString("yyyy-MM-dd");
        if (v is string s)
        {
            if (DateOnly.TryParse(s, out var dd)) return dd.ToString("yyyy-MM-dd");
            if (DateTime.TryParse(s, out var dtt)) return dtt.ToString("yyyy-MM-dd");
            return s;
        }
        return null;
    }

    private object ToDto(User u, UserProfile? p)
    {
        // Có thể bổ sung Department khi bạn thêm cột; tạm mặc định "Kế toán"
        return new
        {
            Id = u.UserID,
            FullName = u.FullName,
            Email = u.Email,
            Role = (u.Role ?? "staff").ToLower(),
            Phone = p?.Phone ?? "",
            Address = p?.Address ?? "",
            BirthDate = ToYMD(p?.DOB),
            JoinDate = ToYMD(p?.JoinDate),
            Department = "Kế toán",
            Position = p?.Position ?? "",
            EmploymentType = p?.EmploymentType ?? "",
            WorkLocation = p?.WorkLocation ?? "",
            AvatarUrl = p != null ? (typeof(UserProfile).GetProperty("AvatarUrl")?.GetValue(p)?.ToString() ?? null) : null
        };
    }

    private static void SetIfHas<T>(T target, string prop, object? value)
    {
        var pi = typeof(T).GetProperty(prop);
        if (pi == null) return;

        // convert an toàn (DateOnly?, string…)
        if (value != null && pi.PropertyType != value.GetType())
        {
            try
            {
                if (pi.PropertyType == typeof(DateOnly) || pi.PropertyType == typeof(DateOnly?))
                {
                    if (value is DateOnly) { /* ok */ }
                    else if (value is DateTime dt) value = DateOnly.FromDateTime(dt);
                    else if (value is string s)
                    {
                        if (DateOnly.TryParse(s, out var dd)) value = dd;
                        else if (DateTime.TryParse(s, out var dtt)) value = DateOnly.FromDateTime(dtt);
                        else value = null;
                    }
                }
                else
                {
                    value = Convert.ChangeType(value, Nullable.GetUnderlyingType(pi.PropertyType) ?? pi.PropertyType, CultureInfo.InvariantCulture);
                }
            }
            catch { /* best effort */ }
        }
        pi.SetValue(target, value);
    }

    // ===== APIs =================================================================

    /// GET /api/Profile/me
    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetMine()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userIdStr) || !int.TryParse(userIdStr, out var userId))
            return Unauthorized();

        var user = await _db.Users.FirstOrDefaultAsync(u => u.UserID == userId);
        if (user == null) return NotFound();

        var profile = await _db.UserProfiles.FirstOrDefaultAsync(p => p.UserID == userId);

        return Ok(ToDto(user, profile));
    }

    public class ProfilePatch
    {
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? DOB { get; set; }        // yyyy-MM-dd (dễ parse hơn)
        public string? JoinDate { get; set; }   // yyyy-MM-dd
        public string? Position { get; set; }
        public string? EmploymentType { get; set; }
        public string? WorkLocation { get; set; }
    }

    /// PATCH|PUT /api/Profile/me
    [Authorize]
    [HttpPatch("me")]
    [HttpPut("me")]
    public async Task<IActionResult> UpdateMine([FromBody] ProfilePatch patch)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userIdStr) || !int.TryParse(userIdStr, out var userId))
            return Unauthorized();

        var user = await _db.Users.FirstOrDefaultAsync(u => u.UserID == userId);
        if (user == null) return NotFound();

        var profile = await _db.UserProfiles.FirstOrDefaultAsync(p => p.UserID == userId);
        if (profile == null)
        {
            profile = new UserProfile { UserID = userId, UpdatedAt = DateTime.UtcNow };
            _db.UserProfiles.Add(profile);
        }

        if (!string.IsNullOrWhiteSpace(patch.Phone)) profile.Phone = patch.Phone;
        if (!string.IsNullOrWhiteSpace(patch.Address)) profile.Address = patch.Address;
        if (!string.IsNullOrWhiteSpace(patch.DOB)) SetIfHas(profile, nameof(UserProfile.DOB), patch.DOB);
        if (!string.IsNullOrWhiteSpace(patch.JoinDate)) SetIfHas(profile, nameof(UserProfile.JoinDate), patch.JoinDate);
        if (!string.IsNullOrWhiteSpace(patch.Position)) profile.Position = patch.Position;
        if (!string.IsNullOrWhiteSpace(patch.EmploymentType)) profile.EmploymentType = patch.EmploymentType;
        if (!string.IsNullOrWhiteSpace(patch.WorkLocation)) profile.WorkLocation = patch.WorkLocation;

        profile.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(ToDto(user, profile));
    }

    // ====== tuỳ chọn: đổi mật khẩu (không phụ thuộc schema) =====================
    public sealed class ChangePasswordDto
    {
        public string CurrentPassword { get; set; } = "";
        public string NewPassword { get; set; } = "";
    }

    /// POST /api/Profile/change-password
    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto d)
    {
        if (string.IsNullOrWhiteSpace(d.CurrentPassword) || string.IsNullOrWhiteSpace(d.NewPassword))
            return BadRequest("Thiếu mật khẩu.");

        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userIdStr) || !int.TryParse(userIdStr, out var userId))
            return Unauthorized();

        var user = await _db.Users.FirstOrDefaultAsync(u => u.UserID == userId);
        if (user == null) return NotFound();

        // Ưu tiên property "Password"; nếu không có, thử "PasswordHash"
        var passProp = typeof(User).GetProperty("Password");
        var hashProp = typeof(User).GetProperty("PasswordHash");

        if (passProp != null)
        {
            var cur = passProp.GetValue(user)?.ToString() ?? "";
            if (!string.Equals(cur, d.CurrentPassword))
                return BadRequest("Mật khẩu hiện tại không đúng.");
            passProp.SetValue(user, d.NewPassword);
        }
        else if (hashProp != null)
        {
            // TODO: thay bằng verify/hash đúng chuẩn (BCrypt/ASP.NET Identity) theo dự án của bạn.
            hashProp.SetValue(user, d.NewPassword);
        }
        else
        {
            return BadRequest("Không tìm thấy cột Password/PasswordHash để đổi mật khẩu.");
        }

        await _db.SaveChangesAsync();
        return Ok(new { ok = true });
    }

    // ====== tuỳ chọn: upload avatar ============================================
    /// POST /api/Profile/avatar  (multipart/form-data, field: "file" hoặc "avatar")
    [Authorize]
    [HttpPost("avatar")]
    public async Task<IActionResult> UploadAvatar([FromForm] IFormFile? file, CancellationToken ct)
    {
        var f = file;
        if (f == null || f.Length == 0) return BadRequest("Chưa chọn file.");

        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userIdStr) || !int.TryParse(userIdStr, out var userId))
            return Unauthorized();

        var user = await _db.Users.FirstOrDefaultAsync(u => u.UserID == userId, ct);
        if (user == null) return NotFound();

        var profile = await _db.UserProfiles.FirstOrDefaultAsync(p => p.UserID == userId, ct);
        if (profile == null)
        {
            profile = new UserProfile { UserID = userId, UpdatedAt = DateTime.UtcNow };
            _db.UserProfiles.Add(profile);
            await _db.SaveChangesAsync(ct);
        }

        var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var folder = Path.Combine(webRoot, "uploads", "avatars");
        Directory.CreateDirectory(folder);

        var ext = Path.GetExtension(f.FileName);
        var fileName = $"avatar_{userId}_{DateTime.UtcNow:yyyyMMddHHmmss}{ext}";
        var savePath = Path.Combine(folder, fileName);

        using (var fs = System.IO.File.Create(savePath))
        {
            await f.CopyToAsync(fs, ct);
        }

        var relative = $"/uploads/avatars/{fileName}";

        // Nếu UserProfile có cột AvatarUrl/Avatar/PhotoUrl/ImageUrl thì lưu lại
        var prop = typeof(UserProfile).GetProperty("AvatarUrl")
                   ?? typeof(UserProfile).GetProperty("Avatar")
                   ?? typeof(UserProfile).GetProperty("PhotoUrl")
                   ?? typeof(UserProfile).GetProperty("ImageUrl");
        if (prop != null) prop.SetValue(profile, relative);

        profile.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var fullUrl = relative.StartsWith("/") ? baseUrl + relative : relative;

        var dto = ToDto(user, profile);
        return Ok(new
        {
            ((dynamic)dto).Id,
            ((dynamic)dto).FullName,
            ((dynamic)dto).Email,
            ((dynamic)dto).Role,
            ((dynamic)dto).Phone,
            ((dynamic)dto).Address,
            ((dynamic)dto).BirthDate,
            ((dynamic)dto).JoinDate,
            ((dynamic)dto).Department,
            ((dynamic)dto).Position,
            ((dynamic)dto).EmploymentType,
            ((dynamic)dto).WorkLocation,
            AvatarUrl = fullUrl
        });
    }
}
