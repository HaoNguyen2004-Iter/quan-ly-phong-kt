using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace QuanLyPhongKT.Api.Models;

[Index("AssigneeID", Name = "IX_Tasks_Assignee")]
[Index("DueDate", Name = "IX_Tasks_DueDate")]
[Index("Status", Name = "IX_Tasks_Status")]
public partial class Task
{
    [Key]
    public int TaskID { get; set; }

    [StringLength(200)]
    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    [StringLength(20)]
    public string Status { get; set; } = null!;

    public int? Priority { get; set; }

    public DateOnly? DueDate { get; set; }

    public int? AssigneeID { get; set; }

    public int? CreatorID { get; set; }

    [Precision(0)]
    public DateTime? CompletedAt { get; set; }

    [Precision(0)]
    public DateTime CreatedAt { get; set; }

    [Precision(0)]
    public DateTime UpdatedAt { get; set; }

    [ForeignKey("AssigneeID")]
    [InverseProperty("TaskAssignees")]
    public virtual User? Assignee { get; set; }

    [ForeignKey("CreatorID")]
    [InverseProperty("TaskCreators")]
    public virtual User? Creator { get; set; }

    [InverseProperty("Task")]
    public virtual ICollection<TaskComment> TaskComments { get; set; } = new List<TaskComment>();

    [InverseProperty("Task")]
    public virtual ICollection<TaskStatusHistory> TaskStatusHistories { get; set; } = new List<TaskStatusHistory>();
}
