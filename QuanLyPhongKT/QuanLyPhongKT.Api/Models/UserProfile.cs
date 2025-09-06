using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace QuanLyPhongKT.Api.Models;

public partial class UserProfile
{
    [Key]
    public int UserID { get; set; }

    public int? ManagerID { get; set; }

    [StringLength(50)]
    public string? Code { get; set; }

    [StringLength(100)]
    public string? Position { get; set; }

    public DateOnly? JoinDate { get; set; }

    [StringLength(100)]
    public string? WorkLocation { get; set; }

    [StringLength(50)]
    public string? EmploymentType { get; set; }

    [StringLength(30)]
    public string? Phone { get; set; }

    [StringLength(255)]
    public string? Address { get; set; }

    public DateOnly? DOB { get; set; }

    [StringLength(20)]
    public string? Gender { get; set; }

    [StringLength(100)]
    public string? BankName { get; set; }

    [StringLength(50)]
    public string? BankAccount { get; set; }

    [StringLength(50)]
    public string? TaxID { get; set; }

    [StringLength(100)]
    public string? EmergencyName { get; set; }

    [StringLength(30)]
    public string? EmergencyPhone { get; set; }

    [StringLength(400)]
    public string? Skills { get; set; }

    [StringLength(400)]
    public string? Certifications { get; set; }

    public int LeaveAnnual { get; set; }

    public int LeaveAnnualUsed { get; set; }

    public int LeaveSick { get; set; }

    public int LeaveSickUsed { get; set; }

    [Precision(0)]
    public DateTime CreatedAt { get; set; }

    [Precision(0)]
    public DateTime UpdatedAt { get; set; }

    [ForeignKey("ManagerID")]
    [InverseProperty("UserProfileManagers")]
    public virtual User? Manager { get; set; }

    [ForeignKey("UserID")]
    [InverseProperty("UserProfileUser")]
    public virtual User User { get; set; } = null!;
}
