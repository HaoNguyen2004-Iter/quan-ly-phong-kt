// src/auth/roles.js
export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
};

export const toRole = (r) => (r || '').toString().toLowerCase();

// Khai báo menu + quyền truy cập
export const NAV = {
  // Admin
  dashboard:   { label: 'Dashboard',           roles: [ROLES.ADMIN] },
  employees:   { label: 'Nhân viên',           roles: [ROLES.ADMIN] },
  tasks:       { label: 'Công việc',           roles: [ROLES.ADMIN] },
  reports:     { label: 'Báo cáo',             roles: [ROLES.ADMIN] },
  leave:       { label: 'Quản lý ngày nghỉ',   roles: [ROLES.ADMIN] },
  settings:    { label: 'Cài đặt',             roles: [ROLES.ADMIN] },

  // Staff (nhân viên)
  'emp-dashboard': { label: 'Trang nhân viên',   roles: [ROLES.STAFF] },
  'emp-tasks':     { label: 'Công việc của tôi', roles: [ROLES.STAFF] },
  'emp-leave':     { label: 'Nghỉ phép của tôi', roles: [ROLES.STAFF] },
  'emp-profile':   { label: 'Hồ sơ cá nhân',     roles: [ROLES.STAFF] },
  'emp-news':      { label: 'Thông báo',         roles: [ROLES.STAFF] },
  'emp-settings':  { label: 'Cài đặt',           roles: [ROLES.STAFF] }, 
};

export const canAccess = (role, itemId) => {
  const r = toRole(role);
  return (NAV[itemId]?.roles || []).includes(r);
};

export const visibleItemsFor = (role) => {
  const r = toRole(role);
  return Object.entries(NAV)
    .filter(([, v]) => v.roles.includes(r))
    .map(([id, v]) => ({ id, label: v.label }));
};

export const firstItemForRole = (role) =>
  toRole(role) === ROLES.ADMIN ? 'dashboard' : 'emp-dashboard';
