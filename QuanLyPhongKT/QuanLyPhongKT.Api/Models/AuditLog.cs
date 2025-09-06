using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace QuanLyPhongKT.Api.Models;

[Index("ActorID", Name = "IX_AuditLogs_Actor")]
[Index("TargetType", "TargetID", Name = "IX_AuditLogs_Target")]
public partial class AuditLog
{
    [Key]
    public int AuditID { get; set; }

    public int? ActorID { get; set; }

    [StringLength(100)]
    public string Action { get; set; } = null!;

    [StringLength(50)]
    public string? TargetType { get; set; }

    [StringLength(50)]
    public string? TargetID { get; set; }

    public string? Details { get; set; }

    [Precision(0)]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("ActorID")]
    [InverseProperty("AuditLogs")]
    public virtual User? Actor { get; set; }
}
