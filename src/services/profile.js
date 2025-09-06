// src/services/profile.js
import api from "../lib/api";

/**
 * BẬT log debug bằng cách thêm vào .env.local:
 *   VITE_DEBUG_API=true
 */
const DBG = import.meta?.env?.VITE_DEBUG_API === "true";
const dlog = (...args) => DBG && console.log(...args);

// Chuẩn hoá object hồ sơ từ các schema khác nhau của BE
export function normalizeProfile(p = {}) {
  const id =
    p?.id ?? p?.Id ?? p?.UserId ?? p?.UserID ?? p?.AccountId ?? null;

  const fullName =
    p?.fullName ?? p?.FullName ?? p?.name ?? p?.Name ?? p?.username ?? "";

  const email = p?.email ?? p?.Email ?? "";
  const phone = p?.phone ?? p?.Phone ?? "";
  const address = p?.address ?? p?.Address ?? "";
  const role =
    p?.role ?? p?.Role ?? p?.account?.role ?? p?.AccountRole ?? "staff";

  // yyyy-MM-dd cho input date
  const toYMD = (v) => {
    if (!v) return "";
    const dt = new Date(v);
    if (isNaN(+dt)) return String(v); // nếu BE trả yyyy-MM-dd rồi thì giữ nguyên
    const m = `${dt.getMonth() + 1}`.padStart(2, "0");
    const d = `${dt.getDate()}`.padStart(2, "0");
    return `${dt.getFullYear()}-${m}-${d}`;
  };

  const birthDate =
    p?.birthDate ?? p?.BirthDate ?? p?.dob ?? p?.DOB ?? "";
  const joinDate =
    p?.joinDate ?? p?.JoinDate ?? p?.startDate ?? p?.StartDate ?? "";

  // avatar url (nếu có)
  const avatarUrl =
    p?.avatarUrl ??
    p?.AvatarUrl ??
    p?.avatar ??
    p?.Avatar ??
    null;

  const department =
    p?.department ?? p?.Department ?? "Kế toán";

  const position =
    p?.position ?? p?.Position ?? "";

  return {
    id,
    fullName,
    email,
    phone,
    address,
    role,
    birthDate: toYMD(birthDate),
    joinDate: toYMD(joinDate),
    department,
    position,
    avatarUrl,
    raw: p,
  };
}

/**
 * Thử nhiều endpoint để GET hồ sơ
 */
export async function getMyProfile() {
  const GETs = [
    "/api/Users/me",
    "/api/User/me",
    "/api/Account/me",
    "/api/Accounts/me",
    "/api/Profile/me",
  ];
  let lastErr;
  for (const path of GETs) {
    try {
      dlog("[profile] GET", path);
      const { data } = await api.get(path);
      return normalizeProfile(data ?? {});
    } catch (e) {
      lastErr = e;
      dlog("[profile] GET fail", path, e?.response?.status, e?.message);
    }
  }
  throw lastErr ?? new Error("Không lấy được hồ sơ.");
}

/**
 * Cập nhật hồ sơ (thông tin cơ bản)
 * Gửi PascalCase để khớp với Program.cs đang tắt naming policy.
 */
export async function updateMyProfile({
  fullName,
  phone,
  address,
  birthDate,
  position,
} = {}) {
  const body = {
    FullName: fullName,
    Phone: phone,
    Address: address,
    BirthDate: birthDate || null,
    Position: position,
  };

  const PATCHes = [
    { m: "patch", url: "/api/Users/me" },
    { m: "put",   url: "/api/Users/me" },
    { m: "patch", url: "/api/Account/me" },
    { m: "put",   url: "/api/Account/me" },
    { m: "patch", url: "/api/Profile/me" },
    { m: "put",   url: "/api/Profile/me" },
  ];

  let lastErr;
  for (const { m, url } of PATCHes) {
    try {
      dlog("[profile] UPDATE", m.toUpperCase(), url, body);
      const { data } = await api[m](url, body);
      return normalizeProfile(data ?? {});
    } catch (e) {
      lastErr = e;
      dlog("[profile] UPDATE fail", m, url, e?.response?.status, e?.message);
    }
  }
  throw lastErr ?? new Error("Cập nhật hồ sơ thất bại.");
}

/**
 * Đổi mật khẩu
 */
export async function changeMyPassword(currentPassword, newPassword) {
  const payloads = [
    { url: "/api/Users/change-password", body: { CurrentPassword: currentPassword, NewPassword: newPassword } },
    { url: "/api/Users/me/password",     body: { CurrentPassword: currentPassword, NewPassword: newPassword } },
    { url: "/api/Account/change-password", body: { CurrentPassword: currentPassword, NewPassword: newPassword } },
  ];

  let lastErr;
  for (const { url, body } of payloads) {
    try {
      dlog("[profile] CHANGE PASSWORD POST", url);
      const { data } = await api.post(url, body);
      return data ?? { ok: true };
    } catch (e) {
      lastErr = e;
      dlog("[profile] CHANGE PASSWORD fail", url, e?.response?.status, e?.message);
    }
  }
  throw lastErr ?? new Error("Đổi mật khẩu thất bại.");
}

/**
 * Upload avatar (multipart/form-data)
 */
export async function uploadMyAvatar(file) {
  const fd = new FormData();
  // Thử cả 'file' và 'avatar' cho BE khác nhau
  fd.append("file", file);
  fd.append("avatar", file);

  const POSTS = [
    "/api/Users/me/avatar",
    "/api/Account/avatar",
    "/api/Profile/avatar",
  ];

  let lastErr;
  for (const url of POSTS) {
    try {
      dlog("[profile] UPLOAD AVATAR", url, file?.name, file?.size);
      const { data } = await api.post(url, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return normalizeProfile(data ?? {});
    } catch (e) {
      lastErr = e;
      dlog("[profile] UPLOAD AVATAR fail", url, e?.response?.status, e?.message);
    }
  }
  throw lastErr ?? new Error("Tải ảnh đại diện thất bại.");
}
