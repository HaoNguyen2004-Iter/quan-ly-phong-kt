// src/components/filters/FilterBar.jsx
import React, { useMemo } from 'react';
import { Filter, X } from 'lucide-react';

/**
 * API:
 * <FilterBar
 *   value={{ q:'', dept:'', position:'', status:'', role:'' }}
 *   onChange={(next) => ...}
 *   onReset={() => ...}
 *   options={{
 *     departments: string[],
 *     positions: string[],
 *     statuses: string[],
 *     roles: string[],
 *   }}
 * />
 */
const asArray = (v) => (Array.isArray(v) ? v : []);

export default function FilterBar({
  value,
  onChange,
  onReset,
  options,
}) {
  const v = value ?? {};
  const q = v.q ?? '';
  const dept = v.dept ?? '';
  const position = v.position ?? '';
  const status = v.status ?? '';
  const role = v.role ?? '';

  const opts = options ?? {};
  // BẢO VỆ: luôn là mảng
  const departments = useMemo(() => asArray(opts.departments), [opts.departments]);
  const positions   = useMemo(() => asArray(opts.positions),   [opts.positions]);
  const statuses    = useMemo(() => asArray(opts.statuses),    [opts.statuses]);
  const roles       = useMemo(() => asArray(opts.roles),       [opts.roles]);

  const handleChange = (patch) => {
    if (typeof onChange === 'function') {
      onChange({ q, dept, position, status, role, ...patch });
    }
  };

  const handleReset = () => {
    if (typeof onReset === 'function') onReset();
    else if (typeof onChange === 'function')
      onChange({ q: '', dept: '', position: '', status: '', role: '' });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => handleChange({ q: e.target.value })}
              placeholder="Tìm theo tên, email..."
              className="w-full pl-3 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Filter className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Department */}
        <select
          value={dept}
          onChange={(e) => handleChange({ dept: e.target.value })}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả phòng ban</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        {/* Position */}
        <select
          value={position}
          onChange={(e) => handleChange({ position: e.target.value })}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả chức vụ</option>
          {positions.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => handleChange({ status: e.target.value })}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả trạng thái</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Role */}
        <select
          value={role}
          onChange={(e) => handleChange({ role: e.target.value })}
          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả vai trò</option>
          {roles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleReset}
          className="px-3 py-2 border rounded-lg hover:bg-gray-50 inline-flex items-center gap-1"
          title="Xoá bộ lọc"
        >
          <X className="w-4 h-4" /> Xoá
        </button>
      </div>
    </div>
  );
}
