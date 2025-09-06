using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace QuanLyPhongKT.Api.Models;

[Index("Status", Name = "IX_Leave_Status")]
[Index("UserID", Name = "IX_Leave_User")]
public partial class LeaveRequest
{
    [Key]
    public int LeaveID { get; set; }

    public int UserID { get; set; }

    public DateOnly StartDate { get; set; }

    public DateOnly EndDate { get; set; }

    public string? Reason { get; set; }

    [StringLength(20)]
    public string Status { get; set; } = null!;

    public int? DecidedBy { get; set; }

    [Precision(0)]
    public DateTime? DecidedAt { get; set; }

    [Precision(0)]
    public DateTime CreatedAt { get; set; }

    [Precision(0)]
    public DateTime UpdatedAt { get; set; }

    [ForeignKey("DecidedBy")]
    [InverseProperty("LeaveRequestDecidedByNavigations")]
    public virtual User? DecidedByNavigation { get; set; }

    [ForeignKey("UserID")]
    [InverseProperty("LeaveRequestUsers")]
    public virtual User User { get; set; } = null!;
}
