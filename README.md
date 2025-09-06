# Dashboard Quản lý Phòng Kế Toán

Dự án React được chuyển đổi từ template HTML/CSS sang kiến trúc MVC với các components được chia nhỏ.

## Tính năng

- **Dashboard Tổng quan**: Hiển thị thống kê công việc và thông báo
- **Quản lý Nhân viên**: Danh sách và thông tin nhân viên phòng kế toán
- **Quản lý Công việc**: Theo dõi tiến độ công việc (đang phát triển)
- **Báo cáo**: Tạo và xem báo cáo (đang phát triển)
- **Quản lý ngày nghỉ**: Quản lý lịch nghỉ phép (đang phát triển)

## Cấu trúc dự án

```
src/
├── components/          # Các React components
│   ├── Sidebar.jsx     # Component thanh bên
│   ├── Header.jsx      # Component header
│   ├── TaskCard.jsx    # Component thẻ công việc
│   ├── NotificationCard.jsx # Component thông báo
│   └── EmployeePage.jsx # Component trang nhân viên
├── data/               # Dữ liệu mẫu
│   └── mockData.js     # Dữ liệu giả lập
├── assets/             # Tài nguyên tĩnh
│   ├── Image/          # Hình ảnh và icons
│   └── style.css       # CSS gốc (tham khảo)
├── App.jsx             # Component chính
├── App.css             # Styles chính
└── main.jsx            # Entry point
```

## Công nghệ sử dụng

- **React 18**: Framework chính
- **Vite**: Build tool và dev server
- **Tailwind CSS**: Framework CSS
- **Lucide React**: Icon library
- **shadcn/ui**: UI components

## Cài đặt và chạy

1. Cài đặt dependencies:
```bash
pnpm install
```

2. Chạy development server:
```bash
pnpm run dev
```

3. Mở trình duyệt tại: `http://localhost:5173`

## Build production

```bash
pnpm run build
```

## Ghi chú

- Dự án được chuyển đổi từ template HTML/CSS gốc
- Giao diện được giữ nguyên theo yêu cầu
- Các components được tổ chức theo mô hình MVC
- Không có xử lý backend, chỉ sử dụng dữ liệu mẫu
- Một số trang vẫn đang trong quá trình phát triển

