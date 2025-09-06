// src/services/mapper.js
// Chuẩn hoá JSON từ BE -> shape FE đang dùng trong components

export const mapTaskFromApi = (t) => {
  if (!t) return null;
  return {
    id: t.TaskID,                 // FE đang dùng task.id
    name: t.Title,                // FE đang dùng task.name
    description: t.Description,
    status: t.Status,             // "moi" | "dang_lam" | "hoan_thanh" | ...
    priority: t.Priority,         // số (0..n), component đang dùng priority
    assigneeId: t.AssigneeID ?? null,
    creatorId: t.CreatorID ?? null,
    dueDate: t.DueDate ?? null,   // "YYYY-MM-DD" (DateOnly)
    completedAt: t.CompletedAt ?? null,
    createdAt: t.CreatedAt ?? null,
    updatedAt: t.UpdatedAt ?? null,

    // Nếu sau này bạn có join thêm user -> gán các field này:
    assignee: t.AssigneeName ?? null,
    assigneeEmail: t.AssigneeEmail ?? null,

    // Một số component nhắc tới "deadline" → alias cho dueDate
    deadline: t.DueDate ?? null,
  };
};

export const mapTaskToApiCreate = (p) => ({
  Title: p.name,
  Description: p.description ?? null,
  Status: p.status ?? "moi",
  Priority: typeof p.priority === "number" ? p.priority : 0,
  AssigneeID: p.assigneeId ?? null,
  DueDate: p.dueDate ?? null, // "YYYY-MM-DD"
});

export const mapTaskToApiUpdate = (p) => ({
  // cho phép update từng phần (PUT/PATCH trên BE đều hỗ trợ)
  Title: p.name,
  Description: p.description,
  Status: p.status,
  Priority: p.priority,
  AssigneeID: p.assigneeId,
  DueDate: p.dueDate,
});

// (Nếu bạn có màn hình đơn nghỉ, dùng luôn bộ map này)
export const mapLeaveFromApi = (r) => r && ({
  id: r.LeaveID,
  userId: r.UserID,
  startDate: r.StartDate,  // "YYYY-MM-DD"
  endDate: r.EndDate,
  reason: r.Reason ?? "",
  status: r.Status,        // pending | approved | rejected | cancelled
  decidedBy: r.DecidedBy ?? null,
  decidedAt: r.DecidedAt ?? null,
  createdAt: r.CreatedAt ?? null,
  updatedAt: r.UpdatedAt ?? null,
});
