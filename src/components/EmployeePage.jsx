// src/components/EmployeePage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Users, Plus, Eye, Edit, Trash2 } from 'lucide-react';
// LƯU Ý: import đúng FilterBar an toàn hoá (đừng dùng bản cũ)
import FilterBar from './common/FilterBar';
import { useEmployeesStore } from '../store/employeesStore';

const uniq = (arr) => [...new Set((arr || []).filter(Boolean))];
const toLower = (s) => String(s || '').toLowerCase();

const EmployeePage = ({ onViewEmployee, onAddEmployee, onEditEmployee }) => {
  // store
  const employees   = useEmployeesStore((s) => s.items || []);
  const fetchAll    = useEmployeesStore((s) => s.fetchAll);
  const removeRemote = useEmployeesStore((s) => s.removeRemote);

  // tải danh sách
  useEffect(() => {
    fetchAll().catch(err => console.error('Load employees error:', err));
  }, [fetchAll]);

  // loại bỏ admin khỏi danh sách hiển thị
  const visibleEmployees = useMemo(
    () => employees.filter((e) => toLower(e.role) !== 'admin'),
    [employees]
  );

  // state filter/search (đúng API FilterBar mới)
  const [filters, setFilters] = useState({
    q: '',
    dept: '',
    position: '',
    status: '',
    role: '', // không dùng nhưng giữ cho tương thích FilterBar
  });

  // options cho FilterBar (không có 'all'; FilterBar tự render 'Tất cả …')
  const options = useMemo(() => {
    return {
      departments: uniq(visibleEmployees.map((e) => e.department)),
      positions:   uniq(visibleEmployees.map((e) => e.position)),
      statuses:    uniq(visibleEmployees.map((e) => e.status)),
      roles:       [], // không lọc theo role ở đây
    };
  }, [visibleEmployees]);

  // áp bộ lọc
  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return visibleEmployees.filter((e) => {
      if (q) {
        const hay = `${e.name} ${e.email} ${e.phone || ''} ${e.position || ''} ${e.department || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filters.dept && e.department !== filters.dept) return false;
      if (filters.position && e.position !== filters.position) return false;
      if (filters.status && e.status !== filters.status) return false;
      return true;
    });
  }, [visibleEmployees, filters]);

  const statusPill = (s) => {
    if (s === 'Đang làm việc') return 'bg-green-100 text-green-800';
    if (s === 'Tạm nghỉ') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-200 text-gray-700';
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc muốn xoá nhân viên này?')) return;
    try {
      await removeRemote(id);
    } catch (e) {
      alert(e?.response?.data || e?.message || 'Lỗi xoá nhân viên');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-gray-700" />
          <h1 className="text-2xl font-bold text-gray-800">Danh sách nhân viên</h1>
        </div>
        <button
          onClick={onAddEmployee}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Thêm nhân viên
        </button>
      </div>

      {/* Filter bar (API mới) */}
      <FilterBar
        value={filters}
        onChange={setFilters}
        onReset={() => setFilters({ q: '', dept: '', position: '', status: '', role: '' })}
        options={options}
      />

      {/* Table */}
      <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhân viên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phòng ban</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chức vụ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Liên hệ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{e.name}</div>
                    <div className="text-sm text-gray-500">{e.email}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{e.department || '—'}</td>
                  <td className="px-6 py-4 text-gray-700">{e.position || '—'}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700">{e.phone || '—'}</div>
                    <div className="text-xs text-gray-400">{e.address || ''}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusPill(e.status)}`}>
                      {e.status || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button className="p-2 rounded-lg border hover:bg-gray-50" onClick={() => onViewEmployee?.(e.id)}>
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg border hover:bg-gray-50" onClick={() => onEditEmployee?.(e.id)}>
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg border text-red-600 hover:bg-red-50" onClick={() => handleDelete(e.id)}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    Không có nhân viên nào khớp điều kiện.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeePage;
