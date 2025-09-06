import React, { useEffect, useMemo, useState } from 'react';
import { Save, X } from 'lucide-react';
import { useEmployeesStore } from '../store/employeesStore'; // ✅ lấy danh sách nhân viên để lọc theo phòng ban

const emptyTask = {
  id: null,
  name: '',
  description: '',
  assignee: '',          // tên hiển thị (giữ nguyên theo code của bạn)
  assigneeId: null,      // id nhân viên (mới thêm – tùy BE dùng)
  department: '',        // phòng ban của người thực hiện (mới thêm – để lọc)
  priority: 'Trung bình', // Thấp | Trung bình | Cao
  status: 'Mới',         // Mới | Đang thực hiện | Hoàn thành | Tạm dừng | Quá hạn
  startDate: '',
  dueDate: '',
  tags: [],
};

export default function EditTask({ task = null, onSave, onCancel }) {
  // ===== Nhân viên & phòng ban =====
  const employees = useEmployeesStore(s => s.items);
  const fetchEmployees = useEmployeesStore(s => s.fetchAll);

  // cố gắng nạp danh sách nhân viên (admin mới lấy full được; staff có thể 403 -> cứ ignore)
  useEffect(() => {
    if (!employees?.length) {
      fetchEmployees().catch(() => {});
    }
  }, [employees?.length, fetchEmployees]);

  // Tập phòng ban (unique), ưu tiên có dữ liệu
  const departments = useMemo(() => {
    const set = new Set(
      (employees || [])
        .map(e => e?.department)
        .filter(Boolean)
    );
    return ['', ...Array.from(set)]; // '' = placeholder
  }, [employees]);

  const [form, setForm] = useState(emptyTask);
  const [tagInput, setTagInput] = useState('');

  // Khi có task hoặc employees đổi, set lại form (để tự suy ra phòng ban từ assigneeId nếu có)
  useEffect(() => {
    const base = {
      ...emptyTask,
      ...(task || {}),
      tags: Array.isArray(task?.tags) ? task.tags : [],
    };

    // Nếu task có assigneeId -> tìm thông tin nhân viên để auto-fill department + assignee name
    if (task?.assigneeId && employees?.length) {
      const emp = employees.find(e => e.id === task.assigneeId);
      if (emp) {
        base.department = emp.department || base.department || '';
        base.assignee = base.assignee || emp.name || emp.email || '';
      }
    }

    // Nếu chưa có department mà trước đó đã có assignee (text) → cố gắng đoán theo tên/email
    if (!base.department && base.assignee && employees?.length) {
      const emp = employees.find(e => (e.name === base.assignee) || (e.email === base.assignee));
      if (emp) base.department = emp.department || '';
    }

    setForm(base);
  }, [task, employees]);

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const addTag = () => {
    const v = tagInput.trim();
    if (!v) return;
    if (!form.tags.includes(v)) update('tags', [...form.tags, v]);
    setTagInput('');
  };
  const removeTag = (t) => update('tags', form.tags.filter(x => x !== t));

  // ===== Lọc nhân viên theo phòng ban, loại admin =====
  const employeeOptions = useMemo(() => {
    const dept = form.department || '';
    return (employees || [])
      .filter(e => String(e.role || '').toLowerCase() !== 'admin')
      .filter(e => !dept || e.department === dept)
      .map(e => ({
        value: e.id,
        label: e.name || e.email || `#${e.id}`,
        email: e.email,
        department: e.department,
      }));
  }, [employees, form.department]);

  // Khi đổi phòng ban → reset người thực hiện
  const onChangeDepartment = (v) => {
    setForm(prev => ({
      ...prev,
      department: v,
      assigneeId: null,
      assignee: '',
    }));
  };

  // Khi chọn người thực hiện → set cả assigneeId & assignee (text hiển thị)
  const onChangeAssignee = (idStr) => {
    const id = idStr ? Number(idStr) : null;
    const emp = employeeOptions.find(o => o.value === id);
    setForm(prev => ({
      ...prev,
      assigneeId: id,
      assignee: emp ? emp.label : '',
      department: emp?.department || prev.department || '',
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('Tên công việc là bắt buộc');
      return;
    }

    // Chuẩn hoá ngày về YYYY-MM-DD
    const toYMD = (v) => {
      if (!v) return '';
      if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
      const d = new Date(v);
      return isNaN(d) ? '' : d.toISOString().slice(0, 10);
    };

    const payload = {
      ...form,
      startDate: toYMD(form.startDate) || '',
      dueDate: toYMD(form.dueDate) || '',
      // giữ nguyên các field khác; BE có thể dùng assigneeId, FE vẫn có assignee (text) để hiển thị
    };

    if (onSave) onSave(payload);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {form.id ? 'Chỉnh sửa công việc' : 'Thêm công việc'}
          </h2>
          <button onClick={onCancel} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border hover:bg-gray-50">
            <X className="w-4 h-4" /> Đóng
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên công việc *</label>
            <input
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="VD: Lập báo cáo tài chính Q4"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mô tả chi tiết công việc..."
            />
          </div>

          {/* 🔽 Phòng ban (lọc người thực hiện) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
            <select
              value={form.department}
              onChange={(e) => onChangeDepartment(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Chọn phòng ban —</option>
              {departments.filter(Boolean).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* 🔽 Người thực hiện (chỉ nhân viên trong phòng ban) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Người thực hiện</label>
            <select
              value={form.assigneeId ?? ''}
              onChange={(e) => onChangeAssignee(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!form.department}
            >
              {!form.department && <option value="">— Chọn phòng ban trước —</option>}
              {form.department && <option value="">— Chọn người thực hiện —</option>}
              {form.department && employeeOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {/* giữ text assignee để tương thích nơi khác (nếu cần) */}
            {form.assignee && (
              <div className="text-xs text-gray-500 mt-1">Đã chọn: {form.assignee}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ưu tiên</label>
            <select
              value={form.priority}
              onChange={(e) => update('priority', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Thấp</option>
              <option>Trung bình</option>
              <option>Cao</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Mới</option>
              <option>Đang thực hiện</option>
              <option>Hoàn thành</option>
              <option>Tạm dừng</option>
              <option>Quá hạn</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
            <input
              type="date"
              value={form.startDate || ''}
              onChange={(e) => update('startDate', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hạn chót</label>
            <input
              type="date"
              value={form.dueDate || ''}
              onChange={(e) => update('dueDate', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Thẻ (tags)</label>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập thẻ và Enter"
                onKeyDown={(e) => e.key === 'Enter' ? (e.preventDefault(), addTag()) : null}
              />
              <button type="button" onClick={addTag} className="px-3 py-2 border rounded-lg hover:bg-gray-50">Thêm</button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {form.tags.map(t => (
                <span key={t} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 border rounded-full">
                  {t}
                  <button type="button" onClick={() => removeTag(t)} className="text-gray-500 hover:text-gray-800">×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 flex justify-end gap-2 mt-2">
            <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Huỷ</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2">
              <Save className="w-4 h-4" /> Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
