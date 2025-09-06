using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuanLyPhongKT.Api.Models;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly QuanLyPhongKtContext _db;
    public SettingsController(QuanLyPhongKtContext db) { _db = db; }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetMine()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var setting = await _db.UserSettings.FirstOrDefaultAsync(s => s.UserID == userId);

        if (setting == null)
        {
            setting = new UserSetting
            {
                UserID = userId,
                AppearanceTheme = "light",
                DashboardDefaultTab = "emp-dashboard",
                NotifyTaskStatusChange = true,
                NotifyOverdueAlerts = true,
                NotifyEmailReminders = false,
                UpdatedAt = DateTime.UtcNow
            };
            _db.UserSettings.Add(setting);
            await _db.SaveChangesAsync();
        }

        return Ok(setting);
    }

    public class SettingPatch
    {
        public string? AppearanceTheme { get; set; }
        public string? DashboardDefaultTab { get; set; }
        public bool? NotifyTaskStatusChange { get; set; }
        public bool? NotifyOverdueAlerts { get; set; }
        public bool? NotifyEmailReminders { get; set; }
    }

    [Authorize]
    [HttpPatch("me")]
    [HttpPut("me")]
    public async Task<IActionResult> UpdateMine([FromBody] SettingPatch body)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var setting = await _db.UserSettings.FirstOrDefaultAsync(s => s.UserID == userId);

        if (setting == null)
        {
            setting = new UserSetting
            {
                UserID = userId,
                AppearanceTheme = body.AppearanceTheme ?? "light",
                DashboardDefaultTab = body.DashboardDefaultTab ?? "emp-dashboard",
                NotifyTaskStatusChange = body.NotifyTaskStatusChange ?? true,
                NotifyOverdueAlerts = body.NotifyOverdueAlerts ?? true,
                NotifyEmailReminders = body.NotifyEmailReminders ?? false,
                UpdatedAt = DateTime.UtcNow
            };
            _db.UserSettings.Add(setting);
        }
        else
        {
            if (!string.IsNullOrWhiteSpace(body.AppearanceTheme)) setting.AppearanceTheme = body.AppearanceTheme;
            if (!string.IsNullOrWhiteSpace(body.DashboardDefaultTab)) setting.DashboardDefaultTab = body.DashboardDefaultTab;
            if (body.NotifyTaskStatusChange.HasValue) setting.NotifyTaskStatusChange = body.NotifyTaskStatusChange.Value;
            if (body.NotifyOverdueAlerts.HasValue) setting.NotifyOverdueAlerts = body.NotifyOverdueAlerts.Value;
            if (body.NotifyEmailReminders.HasValue) setting.NotifyEmailReminders = body.NotifyEmailReminders.Value;
            setting.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        return Ok(setting);
    }
}
