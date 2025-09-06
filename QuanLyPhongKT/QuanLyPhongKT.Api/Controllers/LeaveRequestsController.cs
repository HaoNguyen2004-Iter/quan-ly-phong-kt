using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyPhongKT.Api.Models;
using System.Security.Claims;
using System.Linq;

[ApiController]
[Route("api/[controller]")]
public class LeaveRequestsController : ControllerBase
{
    private readonly QuanLyPhongKtContext _db;
    public LeaveRequestsController(QuanLyPhongKtContext db) { _db = db; }

    // ======================= SEARCH (Admin xem tất cả) =======================
    public sealed class SearchDto
    {
        public int PageIndex { get; set; } = 1;
        public int PageSize  { get; set; } = 1000;
        public string? Search { get; set; }   // tìm theo mã/userId, lý do, tên
        public string? Status { get; set; }   // pending/approved/rejected/cancelled...
        public bool OnlyStaff { get; set; } = false;  // chỉ lấy đơn của Nhân viên
        public string? RoleEquals { get; set; }       // lọc đúng 1 role (vd: "admin" / "staff" / "Nhân viên")
    }

    /// <summary>
    /// Liệt kê đơn nghỉ (Admin). Trả về { items, pageIndex, pageSize, total }.
    /// Có trả về employeeName (join Users) và có thể lọc chỉ nhân viên.
    /// </summary>
    [Authorize(Policy = "AdminOnly")]
    [HttpPost("search")]
    public async Task<IActionResult> Search([FromBody] SearchDto q)
    {
        q ??= new SearchDto();
        var pageIndex = Math.Max(1, q.PageIndex);
        var pageSize  = q.PageSize <= 0 ? 1000 : q.PageSize;

        // JOIN Users để lấy tên + role
        // TODO: nếu dự án dùng bảng khác => đổi _db.Users thành _db.Employees
        // TODO: nếu khoá khác => đổi u.UserID
        // TODO: nếu cột tên khác => đổi u.FullName (vd: u.Name)
        var baseQuery =
            from lr in _db.LeaveRequests
            join u0 in _db.Users on lr.UserID equals u0.UserID into g
            from u in g.DefaultIfEmpty()
            select new
            {
                lr,
                UserId   = lr.UserID,
                UserName = u != null ? u.FullName : null,
                UserRole = u != null ? u.Role     : null
            };

        // Lọc theo trạng thái
        if (!string.IsNullOrWhiteSpace(q.Status))
        {
            var st = q.Status.Trim().ToLower();
            baseQuery = baseQuery.Where(x => (x.lr.Status ?? "").ToLower() == st);
        }

        // Lọc theo từ khoá (mã user / lý do / tên)
        if (!string.IsNullOrWhiteSpace(q.Search))
        {
            var term = q.Search.Trim().ToLower();
            baseQuery = baseQuery.Where(x =>
                x.UserId.ToString().ToLower().Contains(term) ||
                ((x.lr.Reason ?? "").ToLower().Contains(term)) ||
                (((x.UserName ?? "").ToLower().Contains(term)))
            );
        }

        // Lọc role người nộp đơn
        if (q.OnlyStaff)
        {
            baseQuery = baseQuery.Where(x =>
                (x.UserRole ?? "").ToLower() == "staff" ||
                (x.UserRole ?? "").ToLower() == "nhân viên" ||
                (x.UserRole ?? "").ToLower() == "employee"
            );
        }
        else if (!string.IsNullOrWhiteSpace(q.RoleEquals))
        {
            var want = q.RoleEquals.Trim().ToLower();
            baseQuery = baseQuery.Where(x => (x.UserRole ?? "").ToLower() == want);
        }

        baseQuery = baseQuery.OrderByDescending(x => x.lr.CreatedAt);

        var total = await baseQuery.CountAsync();
        var skip  = (pageIndex - 1) * pageSize;

        var items = await baseQuery
            .Skip(skip)
            .Take(pageSize)
            .Select(x => new
            {
                id           = x.lr.LeaveID,
                employeeId   = x.UserId,
                employeeName = string.IsNullOrWhiteSpace(x.UserName) ? ("ID " + x.UserId) : x.UserName,
                // trả role để FE có thể debug/lọc thêm nếu cần
                employeeRole = x.UserRole,

                startDate    = x.lr.StartDate,
                endDate      = x.lr.EndDate,
                reason       = x.lr.Reason,
                status       = x.lr.Status,      // pending/approved/rejected/cancelled
                approver     = x.lr.DecidedBy,
                createdAt    = x.lr.CreatedAt
            })
            .ToListAsync();

        return Ok(new { items, pageIndex, pageSize, total });
    }
    // ===================== HẾT PHẦN SEARCH (Admin) ==========================

    public class LeaveCreateDto
    {
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate   { get; set; }
        public string? Reason     { get; set; }
    }

    // Tạo đơn nghỉ (user)
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] LeaveCreateDto req)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var entity = new LeaveRequest
        {
            UserID    = userId,
            StartDate = req.StartDate,
            EndDate   = req.EndDate,
            Reason    = req.Reason,
            Status    = "pending",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _db.LeaveRequests.Add(entity);
        await _db.SaveChangesAsync();
        return Ok(entity);
    }

    // Lấy đơn nghỉ của chính mình
    [Authorize]
    [HttpGet("my")]
    public async Task<IActionResult> GetMine()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var list = await _db.LeaveRequests
            .Where(x => x.UserID == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
        return Ok(list);
    }

    // Hủy đơn (user) khi còn pending
    [Authorize]
    [HttpPut("{id:int}/cancel")]
    [HttpPatch("{id:int}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var r = await _db.LeaveRequests.FirstOrDefaultAsync(x => x.LeaveID == id);
        if (r == null) return NotFound();
        if (r.UserID != userId) return Forbid();
        if (r.Status != "pending") return BadRequest("Chỉ được hủy khi đang ở trạng thái pending.");

        r.Status    = "cancelled";
        r.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(r);
    }

    public class LeaveUpdateDto
    {
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate   { get; set; }
        public string? Reason      { get; set; }
    }

    // Sửa đơn (user) khi còn pending
    [Authorize]
    [HttpPut("{id:int}")]
    [HttpPatch("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] LeaveUpdateDto body)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var r = await _db.LeaveRequests.FirstOrDefaultAsync(x => x.LeaveID == id);
        if (r == null) return NotFound();
        if (r.UserID != userId) return Forbid();
        if (r.Status != "pending") return BadRequest("Chỉ sửa khi đang pending.");

        if (body.StartDate.HasValue) r.StartDate = body.StartDate.Value;
        if (body.EndDate.HasValue)   r.EndDate   = body.EndDate.Value;
        if (!string.IsNullOrWhiteSpace(body.Reason)) r.Reason = body.Reason;

        r.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(r);
    }

    // Admin duyệt
    [Authorize(Policy = "AdminOnly")]
    [HttpPatch("{id:int}/approve")]
    public async Task<IActionResult> Approve(int id)
    {
        var r = await _db.LeaveRequests.FirstOrDefaultAsync(x => x.LeaveID == id);
        if (r == null) return NotFound();
        r.Status    = "approved";
        r.DecidedBy = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        r.DecidedAt = DateTime.UtcNow;
        r.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(r);
    }

    // Admin từ chối
    [Authorize(Policy = "AdminOnly")]
    [HttpPatch("{id:int}/reject")]
    public async Task<IActionResult> Reject(int id)
    {
        var r = await _db.LeaveRequests.FirstOrDefaultAsync(x => x.LeaveID == id);
        if (r == null) return NotFound();
        r.Status    = "rejected";
        r.DecidedBy = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        r.DecidedAt = DateTime.UtcNow;
        r.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(r);
    }
}
