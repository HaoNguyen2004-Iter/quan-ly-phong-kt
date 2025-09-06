using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace QuanLyPhongKT.Api.Models;

[Index("UserID", Name = "IX_UserDocuments_User")]
public partial class UserDocument
{
    [Key]
    public int DocumentID { get; set; }

    public int UserID { get; set; }

    [StringLength(200)]
    public string Name { get; set; } = null!;

    [StringLength(400)]
    public string Url { get; set; } = null!;

    [Precision(0)]
    public DateTime UpdatedAt { get; set; }

    [Precision(0)]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("UserID")]
    [InverseProperty("UserDocuments")]
    public virtual User User { get; set; } = null!;
}
