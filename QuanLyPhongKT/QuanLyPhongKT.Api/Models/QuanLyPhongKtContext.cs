using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace QuanLyPhongKT.Api.Models;

public partial class QuanLyPhongKtContext : DbContext
{
    public QuanLyPhongKtContext(DbContextOptions<QuanLyPhongKtContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Announcement> Announcements { get; set; }

    public virtual DbSet<AuditLog> AuditLogs { get; set; }

    public virtual DbSet<LeaveRequest> LeaveRequests { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<Task> Tasks { get; set; }

    public virtual DbSet<TaskComment> TaskComments { get; set; }

    public virtual DbSet<TaskStatusHistory> TaskStatusHistories { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserDocument> UserDocuments { get; set; }

    public virtual DbSet<UserProfile> UserProfiles { get; set; }

    public virtual DbSet<UserSetting> UserSettings { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Announcement>(entity =>
        {
            entity.HasKey(e => e.AnnouncementID).HasName("PK__Announce__9DE44554B3C62F86");

            entity.Property(e => e.PublishedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.Announcements).HasConstraintName("FK_Announcements_CreatedBy");
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(e => e.AuditID).HasName("PK__AuditLog__A17F23B8018C3E07");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Actor).WithMany(p => p.AuditLogs).HasConstraintName("FK_AuditLogs_User");
        });

        modelBuilder.Entity<LeaveRequest>(entity =>
        {
            entity.HasKey(e => e.LeaveID).HasName("PK__LeaveReq__796DB9797B38370C");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.DecidedByNavigation).WithMany(p => p.LeaveRequestDecidedByNavigations).HasConstraintName("FK_LeaveRequests_Decider");

            entity.HasOne(d => d.User).WithMany(p => p.LeaveRequestUsers).HasConstraintName("FK_LeaveRequests_User");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotificationID).HasName("PK__Notifica__20CF2E3240A3C861");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.User).WithMany(p => p.Notifications).HasConstraintName("FK_Notifications_User");
        });

        modelBuilder.Entity<Task>(entity =>
        {
            entity.HasKey(e => e.TaskID).HasName("PK__Tasks__7C6949D112063596");

            entity.ToTable(tb => tb.HasTrigger("trg_Task_StatusHistory"));

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Assignee).WithMany(p => p.TaskAssignees).HasConstraintName("FK_Tasks_Assignee");

            entity.HasOne(d => d.Creator).WithMany(p => p.TaskCreators).HasConstraintName("FK_Tasks_Creator");
        });

        modelBuilder.Entity<TaskComment>(entity =>
        {
            entity.HasKey(e => e.CommentID).HasName("PK__TaskComm__C3B4DFAA71B1ED58");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Author).WithMany(p => p.TaskComments).HasConstraintName("FK_TaskComments_User");

            entity.HasOne(d => d.Task).WithMany(p => p.TaskComments).HasConstraintName("FK_TaskComments_Task");
        });

        modelBuilder.Entity<TaskStatusHistory>(entity =>
        {
            entity.HasKey(e => e.HistoryID).HasName("PK__TaskStat__4D7B4ADDAE91CA6B");

            entity.Property(e => e.ChangedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.ChangedByNavigation).WithMany(p => p.TaskStatusHistories).HasConstraintName("FK_TSH_User");

            entity.HasOne(d => d.Task).WithMany(p => p.TaskStatusHistories).HasConstraintName("FK_TSH_Task");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserID).HasName("PK__Users__1788CCAC6C21CA5B");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(sysutcdatetime())");
        });

        modelBuilder.Entity<UserDocument>(entity =>
        {
            entity.HasKey(e => e.DocumentID).HasName("PK__UserDocu__1ABEEF6FFB186200");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.User).WithMany(p => p.UserDocuments).HasConstraintName("FK_UserDocuments_User");
        });

        modelBuilder.Entity<UserProfile>(entity =>
        {
            entity.HasKey(e => e.UserID).HasName("PK__UserProf__1788CCAC46CF0B38");

            entity.Property(e => e.UserID).ValueGeneratedNever();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.LeaveAnnual).HasDefaultValue(12);
            entity.Property(e => e.LeaveSick).HasDefaultValue(5);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Manager).WithMany(p => p.UserProfileManagers).HasConstraintName("FK_UserProfiles_Manager");

            entity.HasOne(d => d.User).WithOne(p => p.UserProfileUser).HasConstraintName("FK_UserProfiles_Users");
        });

        modelBuilder.Entity<UserSetting>(entity =>
        {
            entity.HasKey(e => e.UserID).HasName("PK__UserSett__1788CCAC0BA50940");

            entity.Property(e => e.UserID).ValueGeneratedNever();
            entity.Property(e => e.AppearanceDensity).HasDefaultValue("comfortable");
            entity.Property(e => e.AppearanceTheme).HasDefaultValue("system");
            entity.Property(e => e.DashboardDefaultTab).HasDefaultValue("emp-dashboard");
            entity.Property(e => e.Language).HasDefaultValue("vi");
            entity.Property(e => e.NotifyOverdueAlerts).HasDefaultValue(true);
            entity.Property(e => e.NotifyTaskAssigned).HasDefaultValue(true);
            entity.Property(e => e.NotifyTaskStatusChange).HasDefaultValue(true);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.User).WithOne(p => p.UserSetting).HasConstraintName("FK_UserSettings_Users");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
