using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyPhongKT.Api.Models;
using System.Security.Claims;
using TaskEntity = QuanLyPhongKT.Api.Models.Task; // alias entity Task

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly QuanLyPhongKtContext _db;
    public TasksController(QuanLyPhongKtContext db) { _db = db; }

    // Admin xem tất cả: GET /api/Tasks/admin
    [Authorize(Policy = "AdminOnly")]
    [HttpGet("admin")]
    public async Task<IActionResult> GetAllForAdmin([FromQuery] string? status, [FromQuery] int? assigneeId)
    {
        var q = _db.Tasks.AsQueryable();
        if (!string.IsNullOrWhiteSpace(status)) q = q.Where(x => x.Status == status);
        if (assigneeId.HasValue) q = q.Where(x => x.AssigneeID == assigneeId.Value);

        var list = await q.OrderByDescending(x => x.CreatedAt).ToListAsync();
        return Ok(list);
    }

    // Alias để tương thích FE: GET /api/Tasks
    [Authorize(Policy = "AdminOnly")]
    [HttpGet]
    public Task<IActionResult> GetAll() => GetAllForAdmin(null, null);

    // Staff: GET /api/Tasks/my
    [Authorize]
    [HttpGet("my")]
    public async Task<IActionResult> MyTasks()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var list = await _db.Tasks.Where(x => x.AssigneeID == userId)
                                  .OrderByDescending(x => x.CreatedAt)
                                  .ToListAsync();
        return Ok(list);
    }

    public class TaskCreateDto
    {
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public string? Status { get; set; }   // "moi" | "dang_lam" | ...
        public int? Priority { get; set; }
        public int? AssigneeID { get; set; }
        public DateOnly? DueDate { get; set; }
    }

    // Admin tạo task
    [Authorize(Policy = "AdminOnly")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] TaskCreateDto dto)
    {
        var creatorId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var model = new TaskEntity
        {
            Title = dto.Title,
            Description = dto.Description,
            Status = dto.Status ?? "moi",
            Priority = dto.Priority ?? 0,
            AssigneeID = dto.AssigneeID,
            CreatorID = creatorId,
            DueDate = dto.DueDate,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _db.Tasks.Add(model);
        await _db.SaveChangesAsync();
        return Ok(model);
    }

    public class TaskPatchDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; }
        public int? Priority { get; set; }
        public int? AssigneeID { get; set; }
        public DateOnly? DueDate { get; set; }
    }

    // Admin cập nhật (PATCH/PUT)
    [Authorize(Policy = "AdminOnly")]
    [HttpPatch("{id:int}")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] TaskPatchDto patch)
    {
        var t = await _db.Tasks.FirstOrDefaultAsync(x => x.TaskID == id);
        if (t == null) return NotFound();

        if (!string.IsNullOrWhiteSpace(patch.Title)) t.Title = patch.Title;
        if (!string.IsNullOrWhiteSpace(patch.Description)) t.Description = patch.Description;
        if (!string.IsNullOrWhiteSpace(patch.Status)) t.Status = patch.Status;
        if (patch.Priority.HasValue) t.Priority = patch.Priority.Value;
        if (patch.AssigneeID.HasValue) t.AssigneeID = patch.AssigneeID.Value;
        if (patch.DueDate.HasValue) t.DueDate = patch.DueDate.Value;

        t.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(t);
    }

    // Lấy chi tiết task
    [Authorize]
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var t = await _db.Tasks.FirstOrDefaultAsync(x => x.TaskID == id);
        if (t == null) return NotFound();

        // Admin hoặc chính assignee/creator mới xem được
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int userId = userIdStr != null ? int.Parse(userIdStr) : 0;
        var isAdmin = User.IsInRole("admin");

        if (!isAdmin && t.AssigneeID != userId && t.CreatorID != userId) return Forbid();

        return Ok(t);
    }

    // Admin xoá task
    [Authorize(Policy = "AdminOnly")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var t = await _db.Tasks.Include(x => x.TaskComments)
                               .Include(x => x.TaskStatusHistories)
                               .FirstOrDefaultAsync(x => x.TaskID == id);
        if (t == null) return NotFound();

        if (t.TaskComments != null) _db.TaskComments.RemoveRange(t.TaskComments);
        if (t.TaskStatusHistories != null) _db.TaskStatusHistories.RemoveRange(t.TaskStatusHistories);
        _db.Tasks.Remove(t);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Staff xác nhận hoàn thành
    [Authorize]
    [HttpPost("{id:int}/complete")]
    public async Task<IActionResult> ConfirmComplete(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var t = await _db.Tasks.FirstOrDefaultAsync(x => x.TaskID == id);
        if (t == null) return NotFound();

        if (t.AssigneeID != userId) return Forbid();

        t.Status = "hoan_thanh";
        t.CompletedAt = DateTime.UtcNow;
        t.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(t);
    }
}
