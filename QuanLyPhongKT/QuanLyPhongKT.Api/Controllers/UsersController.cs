using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyPhongKT.Api.Models;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly QuanLyPhongKtContext _db;
    public UsersController(QuanLyPhongKtContext db) { _db = db; }

    // ===== Helpers =====
    private static byte[] HashPassword(string? pwd)
    {
        using var sha = SHA256.Create();
        return sha.ComputeHash(Encoding.UTF8.GetBytes(pwd ?? ""));
    }

    private static string NormalizeRole(string? input)
    {
        var s = (input ?? "").Trim().ToLowerInvariant();
        if (s == "admin") return "admin";
        if (s == "quản lý" || s == "quan ly" || s == "manager") return "manager";
        return "staff";
    }

    private static object ToEmployeeDto(User u, UserProfile? p)
    {
        var status = (p?.EmploymentType == "Tạm nghỉ") ? "Tạm nghỉ" : "Đang làm việc";
        return new
        {
            id = u.UserID,
            name = u.FullName,
            email = u.Email,
            role = u.Role,
            phone = p?.Phone,
            address = p?.Address,
            birthDate = p?.DOB,     // "YYYY-MM-DD"
            joinDate = p?.JoinDate, // "YYYY-MM-DD"
            position = p?.Position,
            department = p?.WorkLocation,
            status
        };
    }

    // ===== ADMIN: lấy toàn bộ nhân viên =====
    [Authorize(Policy = "AdminOnly")]
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? q, [FromQuery] string? department, [FromQuery] string? position, [FromQuery] string? status)
    {
        var query = from u in _db.Users
                    join p in _db.UserProfiles on u.UserID equals p.UserID into gp
                    from p in gp.DefaultIfEmpty()
                    select new { u, p };

        if (!string.IsNullOrWhiteSpace(q))
        {
            var key = q.Trim().ToLower();
            query = query.Where(x =>
                x.u.FullName.ToLower().Contains(key) ||
                x.u.Email.ToLower().Contains(key) ||
                (x.p != null && (
                    (x.p.Phone ?? "").ToLower().Contains(key) ||
                    (x.p.Position ?? "").ToLower().Contains(key) ||
                    (x.p.WorkLocation ?? "").ToLower().Contains(key)
                ))
            );
        }
        if (!string.IsNullOrWhiteSpace(department))
            query = query.Where(x => (x.p!.WorkLocation ?? "") == department);
        if (!string.IsNullOrWhiteSpace(position))
            query = query.Where(x => (x.p!.Position ?? "") == position);
        if (!string.IsNullOrWhiteSpace(status))
        {
            if (status == "Tạm nghỉ")
                query = query.Where(x => x.p!.EmploymentType == "Tạm nghỉ");
            else if (status == "Đang làm việc")
                query = query.Where(x => x.p == null || x.p.EmploymentType != "Tạm nghỉ");
        }

        var list = await query
            .OrderBy(x => x.u.FullName)
            .Select(x => ToEmployeeDto(x.u, x.p))
            .ToListAsync();

        return Ok(list);
    }

    // ===== ADMIN: lấy chi tiết =====
    [Authorize(Policy = "AdminOnly")]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var u = await _db.Users.FirstOrDefaultAsync(x => x.UserID == id);
        if (u == null) return NotFound();
        var p = await _db.UserProfiles.FirstOrDefaultAsync(x => x.UserID == id);
        return Ok(ToEmployeeDto(u, p));
    }

    public class AccountDto
    {
        public string? Role { get; set; }
        public string? Password { get; set; }
    }
    public class CreateEmployeeDto
    {
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public DateOnly? BirthDate { get; set; }
        public DateOnly? JoinDate { get; set; }
        public string? Position { get; set; }
        public string? Department { get; set; }
        public string? Status { get; set; } // "Đang làm việc" | "Tạm nghỉ"
        public AccountDto Account { get; set; } = new();
    }
    public class UpdateEmployeeDto
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public DateOnly? BirthDate { get; set; }
        public DateOnly? JoinDate { get; set; }
        public string? Position { get; set; }
        public string? Department { get; set; }
        public string? Status { get; set; } // "Đang làm việc" | "Tạm nghỉ"
        public AccountDto? Account { get; set; }
    }

    // ===== ADMIN: tạo nhân viên =====
    [Authorize(Policy = "AdminOnly")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEmployeeDto body)
    {
        if (string.IsNullOrWhiteSpace(body.Name) || string.IsNullOrWhiteSpace(body.Email))
            return BadRequest("Thiếu tên hoặc email.");

        if (await _db.Users.AnyAsync(x => x.Email == body.Email))
            return Conflict("Email đã tồn tại.");

        var u = new User
        {
            FullName = body.Name,
            Email = body.Email,
            Role = NormalizeRole(body.Account?.Role),
            PasswordHash = HashPassword(body.Account?.Password),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _db.Users.Add(u);
        await _db.SaveChangesAsync();

        var p = new UserProfile
        {
            UserID = u.UserID,
            Phone = body.Phone,
            Address = body.Address,
            DOB = body.BirthDate,
            JoinDate = body.JoinDate,
            Position = body.Position,
            WorkLocation = body.Department,
            EmploymentType = body.Status == "Tạm nghỉ" ? "Tạm nghỉ" : (body.Account?.Role ?? "Nhân viên")
        };
        _db.UserProfiles.Add(p);
        await _db.SaveChangesAsync();

        return Ok(ToEmployeeDto(u, p));
    }

    // ===== ADMIN: cập nhật =====
    [Authorize(Policy = "AdminOnly")]
    [HttpPut("{id:int}")]
    [HttpPatch("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateEmployeeDto body)
    {
        var u = await _db.Users.FirstOrDefaultAsync(x => x.UserID == id);
        if (u == null) return NotFound();
        var p = await _db.UserProfiles.FirstOrDefaultAsync(x => x.UserID == id);
        if (p == null) { p = new UserProfile { UserID = id }; _db.UserProfiles.Add(p); }

        if (!string.IsNullOrWhiteSpace(body.Name)) u.FullName = body.Name;
        if (!string.IsNullOrWhiteSpace(body.Email))
        {
            var exists = await _db.Users.AnyAsync(x => x.Email == body.Email && x.UserID != id);
            if (exists) return Conflict("Email đã được dùng bởi người khác.");
            u.Email = body.Email;
        }
        if (body.Account != null)
        {
            if (!string.IsNullOrWhiteSpace(body.Account.Role))
                u.Role = NormalizeRole(body.Account.Role);
            if (!string.IsNullOrWhiteSpace(body.Account.Password))
                u.PasswordHash = HashPassword(body.Account.Password);
        }
        u.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(body.Phone)) p.Phone = body.Phone;
        if (!string.IsNullOrWhiteSpace(body.Address)) p.Address = body.Address;
        if (body.BirthDate.HasValue) p.DOB = body.BirthDate.Value;
        if (body.JoinDate.HasValue) p.JoinDate = body.JoinDate.Value;
        if (!string.IsNullOrWhiteSpace(body.Position)) p.Position = body.Position;
        if (!string.IsNullOrWhiteSpace(body.Department)) p.WorkLocation = body.Department;
        if (!string.IsNullOrWhiteSpace(body.Status))
            p.EmploymentType = body.Status == "Tạm nghỉ" ? "Tạm nghỉ" : p.EmploymentType;

        await _db.SaveChangesAsync();
        return Ok(ToEmployeeDto(u, p));
    }

    // ===== ADMIN: xoá =====
    [Authorize(Policy = "AdminOnly")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var u = await _db.Users.FirstOrDefaultAsync(x => x.UserID == id);
        if (u == null) return NotFound();
        var p = await _db.UserProfiles.FirstOrDefaultAsync(x => x.UserID == id);
        var s = await _db.UserSettings.FirstOrDefaultAsync(x => x.UserID == id);

        if (p != null) _db.UserProfiles.Remove(p);
        if (s != null) _db.UserSettings.Remove(s);
        _db.Users.Remove(u);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
