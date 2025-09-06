// Map trạng thái -> tiếng Việt + badge class gợi ý

export const TASK_STATUS_LABEL = {
  "todo": "Chờ xử lý",
  "in-progress": "Đang thực hiện",
  "overdue": "Quá hạn",
  "done": "Hoàn thành",
};

export const LEAVE_STATUS_LABEL = {
  "pending": "Chờ duyệt",
  "approved": "Đã duyệt",
  "rejected": "Từ chối",
  "cancelled": "Đã hủy",
};

export function badgeClassForTask(status) {
  switch ((status || "").toLowerCase()) {
    case "todo": return "bg-gray-100 text-gray-700";
    case "in-progress": return "bg-blue-100 text-blue-700";
    case "overdue": return "bg-red-100 text-red-700";
    case "done": return "bg-green-100 text-green-700";
    default: return "bg-slate-100 text-slate-700";
  }
}

export function badgeClassForLeave(status) {
  switch ((status || "").toLowerCase()) {
    case "pending": return "bg-amber-100 text-amber-700";
    case "approved": return "bg-green-100 text-green-700";
    case "rejected": return "bg-red-100 text-red-700";
    case "cancelled": return "bg-gray-100 text-gray-700";
    default: return "bg-slate-100 text-slate-700";
  }
}
