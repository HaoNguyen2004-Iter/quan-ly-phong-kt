using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace QuanLyPhongKT.Api.Models;

[Index("TaskID", Name = "IX_TaskComments_Task")]
public partial class TaskComment
{
    [Key]
    public int CommentID { get; set; }

    public int TaskID { get; set; }

    public int? AuthorID { get; set; }

    public string Content { get; set; } = null!;

    [Precision(0)]
    public DateTime CreatedAt { get; set; }

    [ForeignKey("AuthorID")]
    [InverseProperty("TaskComments")]
    public virtual User? Author { get; set; }

    [ForeignKey("TaskID")]
    [InverseProperty("TaskComments")]
    public virtual Task Task { get; set; } = null!;
}
