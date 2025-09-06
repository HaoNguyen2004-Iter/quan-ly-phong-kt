// Mock data for the dashboard
export const todoTasks = [
  {
    name: "Lập báo cáo tài chính Q4",
    deadline: "2024-01-15"
  },
  {
    name: "Kiểm tra hóa đơn tháng 12",
    deadline: "2024-01-10"
  },
  {
    name: "Cập nhật sổ sách kế toán",
    deadline: "2024-01-12"
  }
];

export const inProgressTasks = [
  {
    name: "Xử lý chứng từ kế toán",
    progress: 75,
    assignee: "Nguyễn Văn A"
  },
  {
    name: "Đối soát công nợ khách hàng",
    progress: 45,
    assignee: "Trần Thị B"
  },
  {
    name: "Lập bảng lương tháng 12",
    progress: 90,
    assignee: "Lê Văn C"
  }
];

export const overdueTasks = [
  {
    name: "Nộp báo cáo thuế VAT",
    overdueDays: 3,
    deadline: "2024-01-05"
  },
  {
    name: "Hoàn thiện báo cáo chi phí",
    overdueDays: 1,
    deadline: "2024-01-08"
  }
];

export const notifications = [
  {
    type: "success",
    text: "Báo cáo tài chính đã được phê duyệt",
    time: "2 giờ trước"
  },
  {
    type: "warning",
    text: "Có 3 hóa đơn cần xử lý gấp",
    time: "4 giờ trước"
  },
  {
    type: "info",
    text: "Nhân viên Nguyễn Văn A đã hoàn thành công việc",
    time: "6 giờ trước"
  },
  {
    type: "error",
    text: "Deadline báo cáo thuế sắp đến hạn",
    time: "1 ngày trước"
  }
];

