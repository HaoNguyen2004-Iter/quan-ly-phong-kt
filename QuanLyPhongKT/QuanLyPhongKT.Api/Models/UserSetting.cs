using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace QuanLyPhongKT.Api.Models;

public partial class UserSetting
{
    [Key]
    public int UserID { get; set; }

    [StringLength(20)]
    public string AppearanceTheme { get; set; } = null!;

    [StringLength(20)]
    public string AppearanceDensity { get; set; } = null!;

    [StringLength(10)]
    public string Language { get; set; } = null!;

    public bool NotifyTaskAssigned { get; set; }

    public bool NotifyTaskStatusChange { get; set; }

    public bool NotifyOverdueAlerts { get; set; }

    public bool NotifyEmailReminders { get; set; }

    [StringLength(50)]
    public string DashboardDefaultTab { get; set; } = null!;

    [Precision(0)]
    public DateTime UpdatedAt { get; set; }

    [ForeignKey("UserID")]
    [InverseProperty("UserSetting")]
    public virtual User User { get; set; } = null!;
}
