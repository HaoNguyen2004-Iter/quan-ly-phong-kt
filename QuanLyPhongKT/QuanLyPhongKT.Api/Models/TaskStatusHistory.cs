using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace QuanLyPhongKT.Api.Models;

[Table("TaskStatusHistory")]
[Index("TaskID", Name = "IX_TSH_Task")]
public partial class TaskStatusHistory
{
    [Key]
    public int HistoryID { get; set; }

    public int TaskID { get; set; }

    [StringLength(20)]
    public string? OldStatus { get; set; }

    [StringLength(20)]
    public string NewStatus { get; set; } = null!;

    public int? ChangedBy { get; set; }

    [StringLength(400)]
    public string? Note { get; set; }

    [Precision(0)]
    public DateTime ChangedAt { get; set; }

    [ForeignKey("ChangedBy")]
    [InverseProperty("TaskStatusHistories")]
    public virtual User? ChangedByNavigation { get; set; }

    [ForeignKey("TaskID")]
    [InverseProperty("TaskStatusHistories")]
    public virtual Task Task { get; set; } = null!;
}
