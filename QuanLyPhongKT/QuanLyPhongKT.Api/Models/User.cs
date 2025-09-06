using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace QuanLyPhongKT.Api.Models;

[Index("Email", Name = "UQ__Users__A9D105347A4A6DA6", IsUnique = true)]
public partial class User
{
    [Key]
    public int UserID { get; set; }

    [StringLength(255)]
    public string Email { get; set; } = null!;

    [MaxLength(64)]
    public byte[] PasswordHash { get; set; } = null!;

    [StringLength(100)]
    public string FullName { get; set; } = null!;

    [StringLength(20)]
    public string Role { get; set; } = null!;

    public bool IsActive { get; set; }

    [Precision(0)]
    public DateTime? LastLoginAt { get; set; }

    [Precision(0)]
    public DateTime CreatedAt { get; set; }

    [Precision(0)]
    public DateTime UpdatedAt { get; set; }

    [InverseProperty("CreatedByNavigation")]
    public virtual ICollection<Announcement> Announcements { get; set; } = new List<Announcement>();

    [InverseProperty("Actor")]
    public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();

    [InverseProperty("DecidedByNavigation")]
    public virtual ICollection<LeaveRequest> LeaveRequestDecidedByNavigations { get; set; } = new List<LeaveRequest>();

    [InverseProperty("User")]
    public virtual ICollection<LeaveRequest> LeaveRequestUsers { get; set; } = new List<LeaveRequest>();

    [InverseProperty("User")]
    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    [InverseProperty("Assignee")]
    public virtual ICollection<Task> TaskAssignees { get; set; } = new List<Task>();

    [InverseProperty("Author")]
    public virtual ICollection<TaskComment> TaskComments { get; set; } = new List<TaskComment>();

    [InverseProperty("Creator")]
    public virtual ICollection<Task> TaskCreators { get; set; } = new List<Task>();

    [InverseProperty("ChangedByNavigation")]
    public virtual ICollection<TaskStatusHistory> TaskStatusHistories { get; set; } = new List<TaskStatusHistory>();

    [InverseProperty("User")]
    public virtual ICollection<UserDocument> UserDocuments { get; set; } = new List<UserDocument>();

    [InverseProperty("Manager")]
    public virtual ICollection<UserProfile> UserProfileManagers { get; set; } = new List<UserProfile>();

    [InverseProperty("User")]
    public virtual UserProfile? UserProfileUser { get; set; }

    [InverseProperty("User")]
    public virtual UserSetting? UserSetting { get; set; }
}
