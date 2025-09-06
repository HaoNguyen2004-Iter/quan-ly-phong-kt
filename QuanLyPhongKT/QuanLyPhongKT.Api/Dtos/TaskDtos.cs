namespace QuanLyPhongKT.Api.Dtos;

public class TaskItemDto
{
    public int TaskId { get; set; }
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public string Status { get; set; } = "todo"; // todo|in-progress|overdue|done
    public int? Priority { get; set; }
    public DateTime? DueDate { get; set; }
    public int? AssigneeId { get; set; }
    public int? CreatorId { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class UpdateTaskStatusRequest
{
    public string Status { get; set; } = "todo";
}
