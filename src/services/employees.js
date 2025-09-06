// src/services/employees.js
// Dựa trên version bạn gửi, bổ sung:
// - Tự dò base route: /api/Users hoặc /api/Employees
// - Chịu nhiều kiểu payload/response khác nhau
// - Log console endpoint đã gọi để debug
// - Map dữ liệu "dẻo" hơn, default Department = "Kế toán"

import api from '../lib/api';

const log = (...args) => console.log('[employees]', ...args);

let _baseRoute; // cache sau khi dò thành công

async function detectBaseRoute() {
  if (_baseRoute) return _baseRoute;
  const candidates = ['/api/Users', '/api/Employees'];
  for (const c of candidates) {
    try {
      // thử GET: có thể array hoặc { items }
      const { data, status } = await api.get(c, {
        params: { page: 1, pageSize: 10, size: 10, limit: 10 },
      });
      log('probe GET', c, '->', status);
      if (Array.isArray(data) || Array.isArray(data?.items)) {
        _baseRoute = c;
        return _baseRoute;
      }
    } catch (e) {
      log('probe GET failed', c, '->', e?.response?.status || e?.message);
    }
    // fallback thử POST /search nếu GET không có
    try {
      const { data, status } = await api.post(`${c}/search`, { pageIndex: 1, pageSize: 1 });
      log('probe POST', `${c}/search`, '->', status);
      if (Array.isArray(data) || Array.isArray(data?.items)) {
        _baseRoute = c;
        return _baseRoute;
      }
    } catch (e) {
      log('probe POST failed', `${c}/search`, '->', e?.response?.status || e?.message);
    }
  }
  // nếu vẫn không đoán được, mặc định /api/Users
  _baseRoute = '/api/Users';
  return _baseRoute;
}

const mapEmployeeFromApi = (e) => {
  // Hợp nhất nhiều biến thể field từ BE
  const id =
    e?.id ?? e?.ID ?? e?.UserID ?? e?.EmployeeID ?? e?.userId ?? e?.employeeId ?? null;

  const name =
    e?.name ?? e?.FullName ?? e?.fullName ?? e?.employeeName ?? e?.account?.fullName ?? '';

  const email = e?.email ?? e?.Email ?? e?.account?.email ?? '';

  const phone =
    e?.phone ?? e?.Phone ?? e?.profile?.Phone ?? e?.Profile?.Phone ?? '';

  const address =
    e?.address ?? e?.Address ?? e?.profile?.Address ?? e?.Profile?.Address ?? '';

  const birthDate =
    e?.birthDate ?? e?.BirthDate ?? e?.DOB ?? e?.profile?.DOB ?? e?.Profile?.DOB ?? null;

  const joinDate =
    e?.joinDate ?? e?.JoinDate ?? e?.profile?.JoinDate ?? e?.Profile?.JoinDate ?? null;

  const position =
    e?.position ?? e?.Position ?? e?.profile?.Position ?? e?.Profile?.Position ?? '';

  const department =
    e?.department ??
    e?.Department ??
    e?.WorkLocation ??
    e?.profile?.Department ??
    e?.Profile?.Department ??
    'Kế toán';

  const status =
    e?.status ??
    e?.Status ??
    (e?.EmploymentType === 'Tạm nghỉ' ? 'Tạm nghỉ' : 'Đang làm việc');

  const role =
    (e?.role ?? e?.Role ?? e?.account?.role ?? 'staff').toLowerCase() === 'admin'
      ? 'admin'
      : 'staff';

  const active = (e?.active ?? e?.Active ?? e?.account?.active ?? true) ? true : false;

  return {
    id,
    name,
    email,
    phone,
    address,
    birthDate,
    joinDate,
    position,
    department,
    status,
    role,
    active,
  };
};

// ===== CRUD =====

export const getEmployees = async (params = {}) => {
  const base = await detectBaseRoute();

  // thử lần lượt: GET base (paged) -> GET base -> POST base/search
  const candidates = [
    { method: 'get', url: base, params: { page: 1, pageSize: 1000, ...params } },
    { method: 'get', url: base, params },
    { method: 'post', url: `${base}/search`, data: { pageIndex: 1, pageSize: 1000, ...params } },
  ];

  for (const c of candidates) {
    try {
      const { data, status } = await api.request(c);
      log('tried', c.method.toUpperCase(), c.url, '->', status);
      const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : null;
      if (Array.isArray(list)) return list.map(mapEmployeeFromApi);
    } catch (e) {
      log('failed', c.method.toUpperCase(), c.url, '->', e?.response?.status || e?.message);
    }
  }
  return []; // an toàn: không ném lỗi để UI vẫn chạy
};

export const getEmployeeById = async (id) => {
  const base = await detectBaseRoute();
  const urls = [`${base}/${id}`, `${base}?id=${id}`];
  for (const url of urls) {
    try {
      const { data, status } = await api.get(url);
      log('tried GET', url, '->', status);
      if (data) return mapEmployeeFromApi(data);
    } catch (e) {
      log('failed GET', url, '->', e?.response?.status || e?.message);
    }
  }
  throw new Error('Không lấy được thông tin nhân viên.');
};

export const createEmployee = async (payload) => {
  const base = await detectBaseRoute();

  // map payload từ AddEmployee
  const body = {
    // Users:
    FullName: payload.name,
    Email: payload.email,
    Role:
      (payload?.account?.role || payload?.role || 'staff').toLowerCase() === 'admin'
        ? 'admin'
        : 'staff',
    Active: payload?.account?.active ?? true,
    Password: payload?.account?.password || undefined,

    // “Profile-like” fields: nhiều BE accept hoặc ignore, gửi kèm không hại
    Phone: payload.phone || null,
    Address: payload.address || null,
    DOB: payload.birthDate || null,
    JoinDate: payload.joinDate || null,
    Position: payload.position || null,
    Department: payload.department || 'Kế toán',
    Status: payload.status || 'Đang làm việc',
  };

  // Thử POST base rồi fallback /api/Users/register
  const candidates = [
    { method: 'post', url: base, data: body },
    { method: 'post', url: '/api/Users/register', data: body },
  ];

  for (const c of candidates) {
    try {
      const { data, status } = await api.request(c);
      log('tried', c.method.toUpperCase(), c.url, '->', status);
      if (data) return mapEmployeeFromApi(data);
    } catch (e) {
      log('failed', c.method.toUpperCase(), c.url, '->', e?.response?.status || e?.message);
    }
  }
  throw new Error('Tạo nhân viên thất bại.');
};

// Hỗ trợ cả 2 kiểu gọi:
// - updateEmployee(id, payload)
// - updateEmployee({ id, ...patch })
export const updateEmployee = async (idOrPatch, maybePayload) => {
  const base = await detectBaseRoute();

  const id = typeof idOrPatch === 'object' ? idOrPatch.id : idOrPatch;
  const patch = typeof idOrPatch === 'object' ? idOrPatch : maybePayload || {};

  if (!id) throw new Error('Thiếu id khi cập nhật nhân viên.');

  const body = {
    FullName: patch.name,
    Email: patch.email,
    Phone: patch.phone,
    Address: patch.address,
    DOB: patch.birthDate,
    JoinDate: patch.joinDate,
    Position: patch.position,
    Department: patch.department || 'Kế toán',
    Status: patch.status,
    Role:
      (patch?.account?.role || patch?.role)
        ? (patch?.account?.role || patch?.role)
        : undefined,
    Active: patch?.account?.active,
  };

  const candidates = [
    { method: 'put', url: `${base}/${id}`, data: body },
    { method: 'patch', url: `${base}/${id}`, data: body },
  ];

  for (const c of candidates) {
    try {
      const { data, status } = await api.request(c);
      log('tried', c.method.toUpperCase(), c.url, '->', status);
      if (status === 204) return { id, ...patch }; // NoContent
      if (data) return mapEmployeeFromApi(data);
    } catch (e) {
      log('failed', c.method.toUpperCase(), c.url, '->', e?.response?.status || e?.message);
    }
  }
  throw new Error('Cập nhật nhân viên thất bại.');
};

export const deleteEmployee = async (id) => {
  const base = await detectBaseRoute();
  const candidates = [
    { method: 'delete', url: `${base}/${id}` },
    { method: 'delete', url: `${base}`, params: { id } },
  ];
  for (const c of candidates) {
    try {
      const { status } = await api.request(c);
      log('tried', c.method.toUpperCase(), c.url, '->', status);
      if (status >= 200 && status < 300) return true;
    } catch (e) {
      log('failed', c.method.toUpperCase(), c.url, '->', e?.response?.status || e?.message);
    }
  }
  throw new Error('Xoá nhân viên thất bại.');
};
