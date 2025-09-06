using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace QuanLyPhongKT.Api.Models;

public partial class Announcement
{
    [Key]
    public int AnnouncementID { get; set; }

    [StringLength(200)]
    public string Title { get; set; } = null!;

    public string? Content { get; set; }

    [Precision(0)]
    public DateTime PublishedAt { get; set; }

    public int? CreatedBy { get; set; }

    [ForeignKey("CreatedBy")]
    [InverseProperty("Announcements")]
    public virtual User? CreatedByNavigation { get; set; }
}
