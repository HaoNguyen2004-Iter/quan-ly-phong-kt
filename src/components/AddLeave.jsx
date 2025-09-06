import React, { useMemo, useState, useEffect } from 'react';
import { Save, X, Calendar } from 'lucide-react';
import { useLeavesStore } from '../store/leavesStore';
import { useEmployeesStore } from '../store/employeesStore';
import {
  typeOptionsVI, dayPartOptionsVI, statusOptionsVI,
  LEAVE_STATUS, LEAVE_STATUS_LABEL_VI, LEAVE_TYPE, DAY_PART,
  toYMD
} from '../constants/leave';

export default function AddLeave({ onClose, onCreated, isAdmin = false }) {
  const add = useLeavesStore(s => s.add);
  const employees = useEmployeesStore(s => s.items);
  const fetchEmployees = useEmployeesStore(s => s.fetchAll);

  useEffect(() => { if (!employees?.length) fetchEmployees().catch(()=>{}); }, [employees?.length, fetchEmployees]);

  const employeeOptions = useMemo(() =>
    (employees || [])
      .filter(e => String(e.role || '').toLowerCase() !== 'admin')
      .map(e => ({ value: e.id, label: e.name || e.email || `#${e.id}`, department: e.department }))
  , [employees]);

  const [form, setForm] = useState({
    userId: '',
    type: LEAVE_TYPE.ANNUAL,
    dayPart: DAY_PART.FULL,
    fromDate: '',
    toDate: '',
    reason: '',
    status: LEAVE_STATUS.PENDING,
  });
  const [err, setErr] = useState('');
  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    if (isAdmin && !form.userId) return 'Chọn nhân viên';
    if (!form.fromDate) return 'Chọn Từ ngày';
    if (!form.toDate) return 'Chọn Đến ngày';
    return '';
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const m = validate();
    if (m) { setErr(m); return; }
    setErr('');
    const payload = {
      userId: form.userId || null,
      type: form.type,
      dayPart: form.dayPart,
      fromDate: toYMD(form.fromDate),
      toDate: toYMD(form.toDate),
      reason: form.reason || null,
      status: form.status, // admin có thể tạo với trạng thái nào cũng được; user mặc định pending
    };
    try {
      const rec = await add(payload);
      onCreated?.(rec);
      onClose?.();
    } catch (e2) {
      setErr(e2?.response?.data || e2?.message || 'Tạo đơn thất bại');
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Tạo đơn nghỉ</h2>
        <button onClick={onClose} className="px-3 py-1 border rounded-lg hover:bg-gray-50"><X className="w-4 h-4" /></button>
      </div>

      {err && <div className="mb-3 p-3 bg-red-50 text-red-700 rounded">{String(err)}</div>}

      <form onSubmit={onSubmit} className="space-y-4 bg-white border rounded-xl p-4">
        {isAdmin && (
          <div>
            <label className="block text-sm text-gray-700 mb-1">Nhân viên</label>
            <select
              value={form.userId}
              onChange={e => setField('userId', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Chọn nhân viên —</option>
              {employeeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Loại</label>
            <select value={form.type} onChange={e => setField('type', e.target.value)} className="w-full px-3 py-2 border rounded-lg">
              {typeOptionsVI.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Ca</label>
            <select value={form.dayPart} onChange={e => setField('dayPart', e.target.value)} className="w-full px-3 py-2 border rounded-lg">
              {dayPartOptionsVI.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Từ ngày</label>
            <input type="date" value={form.fromDate} onChange={e=>setField('fromDate', e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Đến ngày</label>
            <input type="date" value={form.toDate} onChange={e=>setField('toDate', e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Lý do</label>
          <textarea value={form.reason} onChange={e=>setField('reason', e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg" />
        </div>

        {isAdmin && (
          <div>
            <label className="block text-sm text-gray-700 mb-1">Trạng thái</label>
            <select value={form.status} onChange={e=>setField('status', e.target.value)} className="w-full px-3 py-2 border rounded-lg">
              {statusOptionsVI.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Huỷ</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2">
            <Save className="w-4 h-4" /> Lưu
          </button>
        </div>
      </form>
    </div>
  );
}
