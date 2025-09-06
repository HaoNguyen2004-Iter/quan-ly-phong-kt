using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace QuanLyPhongKT.Api.Models;

[Index("Type", Name = "IX_Notifications_Type")]
[Index("UserID", Name = "IX_Notifications_User")]
public partial class Notification
{
    [Key]
    public int NotificationID { get; set; }

    public int UserID { get; set; }

    [StringLength(50)]
    public string Type { get; set; } = null!;

    public string? Message { get; set; }

    public string? Payload { get; set; }

    public bool IsRead { get; set; }

    [Precision(0)]
    public DateTime CreatedAt { get; set; }

    [Precision(0)]
    public DateTime? ReadAt { get; set; }

    [ForeignKey("UserID")]
    [InverseProperty("Notifications")]
    public virtual User User { get; set; } = null!;
}
