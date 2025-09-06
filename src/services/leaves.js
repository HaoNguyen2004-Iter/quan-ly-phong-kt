// src/services/leaves.js
import api from "../lib/api";

/* ================= utils ================= */

// Bật log nhanh khi cần: đặt VITE_DEBUG_API=true trong .env.local
const debug = (...args) => {
  if (import.meta?.env?.VITE_DEBUG_API === "true") {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
};

// map EN -> VI (từ DB/backend sang giao diện)
const toVIStatus = (s) => {
  const v = String(s ?? "").toLowerCase();
  if (v.includes("approved")) return "Đã duyệt";
  if (v.includes("rejected")) return "Từ chối";
  if (v.includes("cancel"))  return "Đã huỷ";
  return "Chờ duyệt"; // pending mặc định
};

// map VI -> EN (đưa vào request lọc/truy vấn)
const toAPIStatus = (s) => {
  if (!s) return "";
  const v = String(s).trim().toLowerCase();
  if (["approved", "rejected", "pending", "cancelled"].includes(v)) return v;
  if (v.includes("duyệt") && v.includes("đã")) return "approved";
  if (v.includes("từ chối")) return "rejected";
  if (v.includes("huỷ") || v.includes("hủy")) return "cancelled";
  if (v.includes("chờ")) return "pending";
  return "";
};

const calcDays = (start, end) => {
  if (!start || !end) return 1;
  const A = new Date(start);
  const B = new Date(end);
  if (isNaN(+A) || isNaN(+B)) return 1;
  // tính inclusive (ví dụ 2025-01-01 -> 2025-01-01 = 1 ngày)
  return Math.max(1, Math.round((B - A) / 86400000) + 1);
};

const normalizeLeave = (r) => {
  const id =
    r?.id ?? r?.Id ?? r?.LeaveID ?? r?.LeaveId ?? r?.leaveId ?? null;

  const employeeId =
    r?.employeeId ?? r?.EmployeeId ?? r?.userId ?? r?.UserID ?? "";

  const startDate =
    r?.startDate ?? r?.StartDate ?? r?.fromDate ?? r?.FromDate ?? null;

  const endDate =
    r?.endDate ?? r?.EndDate ?? r?.toDate ?? r?.ToDate ?? startDate;

  const status = toVIStatus(r?.status ?? r?.Status);

  return {
    id,
    employeeId: String(employeeId || ""),
    employeeName: r?.employeeName ?? r?.EmployeeName ?? (employeeId ? `ID ${employeeId}` : ""),
    startDate,
    endDate,
    days: r?.days ?? r?.totalDays ?? calcDays(startDate, endDate),
    reason: r?.reason ?? r?.Reason ?? "",
    status, // VI
    approver: r?.approver ?? r?.Approver ?? r?.decidedBy ?? r?.DecidedBy ?? "",
    createdAt: r?.createdAt ?? r?.CreatedAt ?? null,
    // Nếu BE trả employeeRole để debug, giữ lại:
    employeeRole: r?.employeeRole ?? r?.EmployeeRole ?? undefined,
  };
};

const extractItems = (data) => {
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data)) return data;
  return [];
};

/* =============== USER APIs =============== */

/**
 * Lấy đơn nghỉ của chính mình (GET /api/LeaveRequests/my)
 */
export async function getMyLeaveRequests() {
  debug("[leaves] GET /api/LeaveRequests/my");
  const { data } = await api.get("/api/LeaveRequests/my");
  const list = Array.isArray(data) ? data : [];
  return list.map(normalizeLeave);
}

/**
 * Tạo đơn nghỉ (POST /api/LeaveRequests)
 * @param {{startDate: string, endDate: string, reason?: string}}
 */
export async function createLeaveRequest({ startDate, endDate, reason = "" }) {
  const body = {
    // BE dùng System.Text.Json case-insensitive, nhưng để chắc chắn
    StartDate: startDate,
    EndDate: endDate,
    Reason: reason,
  };
  debug("[leaves] POST /api/LeaveRequests", body);
  const { data } = await api.post("/api/LeaveRequests", body);
  return normalizeLeave(data ?? {});
}

/**
 * Huỷ đơn khi còn pending (PUT/PATCH /api/LeaveRequests/{id}/cancel)
 */
export async function cancelLeaveRequest(id) {
  debug("[leaves] PATCH /api/LeaveRequests/:id/cancel", id);
  try {
    const { data } = await api.patch(`/api/LeaveRequests/${id}/cancel`);
    return normalizeLeave(data ?? {});
  } catch (err) {
    // fallback nếu server chỉ cho PUT (ít gặp)
    const { data } = await api.put(`/api/LeaveRequests/${id}/cancel`);
    return normalizeLeave(data ?? {});
  }
}

/**
 * Sửa đơn khi còn pending (PUT/PATCH /api/LeaveRequests/{id})
 */
export async function updateLeaveRequest(id, { startDate, endDate, reason } = {}) {
  const body = {};
  if (startDate) body.StartDate = startDate;
  if (endDate)   body.EndDate = endDate;
  if (reason != null) body.Reason = reason;

  debug("[leaves] PATCH /api/LeaveRequests/:id", id, body);
  try {
    const { data } = await api.patch(`/api/LeaveRequests/${id}`, body);
    return normalizeLeave(data ?? {});
  } catch (err) {
    const { data } = await api.put(`/api/LeaveRequests/${id}`, body);
    return normalizeLeave(data ?? {});
  }
}

/* =============== ADMIN APIs =============== */

/**
 * Tìm kiếm/liet kê đơn nghỉ cho admin (POST /api/LeaveRequests/search).
 * Hỗ trợ OnlyStaff & RoleEquals để lọc theo role người nộp.
 */
export async function adminSearchLeaves({
  pageIndex = 1,
  pageSize = 1000,
  search = "",
  status = "",
  onlyStaff = false,
  roleEquals, // ví dụ: "Nhân viên" / "staff" / "admin"
} = {}) {
  const body = {
    // gửi đúng casing như DTO để chắc chắn
    PageIndex: pageIndex,
    PageSize: pageSize,
    Search: search || undefined,
    Status: toAPIStatus(status) || undefined,
    OnlyStaff: !!onlyStaff,
    RoleEquals: roleEquals || undefined,
  };

  debug("[leaves] POST /api/LeaveRequests/search", body);
  const { data } = await api.post("/api/LeaveRequests/search", body);
  const items = extractItems(data);
  return items.map(normalizeLeave);
}

/**
 * Giữ tương thích với code cũ: alias sang adminSearchLeaves
 */
export async function getAllLeaveRequests(params) {
  return adminSearchLeaves(params);
}

/**
 * Đếm tổng/pending/approved/rejected bằng cách dùng tổng số trả về (data.total)
 * của endpoint search. (Nhanh, không cần thêm endpoint BE riêng)
 */
export async function countLeaves({ onlyStaff = false, roleEquals } = {}) {
  const base = {
    PageIndex: 1,
    PageSize: 1, // chỉ cần total
    OnlyStaff: !!onlyStaff,
    RoleEquals: roleEquals || undefined,
  };

  const ask = async (status) => {
    try {
      const { data } = await api.post("/api/LeaveRequests/search", {
        ...base,
        Status: status ? toAPIStatus(status) : undefined,
      });
      return Number(data?.total || 0);
    } catch {
      return 0;
    }
  };

  const [total, pending, approved, rejected] = await Promise.all([
    ask(""),            // all
    ask("pending"),
    ask("approved"),
    ask("rejected"),
  ]);

  return { total, pending, approved, rejected };
}

/**
 * Duyệt đơn (PATCH /api/LeaveRequests/{id}/approve)
 */
export async function approveLeave(id) {
  debug("[leaves] PATCH /api/LeaveRequests/:id/approve", id);
  const { data } = await api.patch(`/api/LeaveRequests/${id}/approve`);
  return normalizeLeave(data ?? {});
}

/**
 * Từ chối đơn (PATCH /api/LeaveRequests/{id}/reject)
 * (BE hiện tại không dùng note, gửi cũng không sao)
 */
export async function rejectLeave(id, note = "") {
  debug("[leaves] PATCH /api/LeaveRequests/:id/reject", id, { note });
  const { data } = await api.patch(`/api/LeaveRequests/${id}/reject`, { note });
  return normalizeLeave(data ?? {});
}
