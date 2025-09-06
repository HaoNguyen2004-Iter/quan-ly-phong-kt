import React, { useEffect, useMemo, useState } from 'react';
import { Save, X } from 'lucide-react';
import { useLeavesStore } from '../store/leavesStore';
import { useEmployeesStore } from '../store/employeesStore';
import {
  LEAVE_TYPE, LEAVE_STATUS, typeOptionsVI, statusOptionsVI, dayPartOptionsVI,
  toYMD
} from '../constants/leave';

export default function EditLeave({ leaveId, onBack, onSaved, isAdmin = false }) {
  const byId = useLeavesStore(s => s.byId);
  const fetchById = useLeavesStore(s => s.fetchById);
  const update = useLeavesStore(s => s.update);

  const employees = useEmployeesStore(s => s.items);
  const fetchEmployees = useEmployeesStore(s => s.fetchAll);

  const inStore = useMemo(() => byId?.(leaveId), [byId, leaveId]);
  const [rec, setRec] = useState(inStore || null);
  const [loading, setLoading] = useState(!inStore);
  const [err, setErr] = useState('');

  useEffect(() => { if (!employees?.length) fetchEmployees().catch(()=>{}); }, [employees?.length, fetchEmployees]);

  useEffect(() => {
    let cancel = false;
    const run = async () => {
      if (inStore) { setRec(inStore); setLoading(false); return; }
      setLoading(true); setErr('');
      try {
        const r = await fetchById(leaveId);
        if (!cancel) setRec(r);
      } catch (e) {
        if (!cancel) setErr(e?.response?.data || e?.message || 'Không tải được đơn');
      } finally {
        if (!cancel) setLoading(false);
      }
    };
    run();
    return () => { cancel = true; };
  }, [leaveId, inStore, fetchById]);

  const [form, setForm] = useState({
    userId: '',
    type: LEAVE_TYPE.ANNUAL,
    dayPart: 'full',
    fromDate: '',
    toDate: '',
    reason: '',
    status: LEAVE_STATUS.PENDING,
  });

  useEffect(() => {
    if (!rec) return;
    setForm({
      userId: rec.userId || '',
      type: rec.type || LEAVE_TYPE.ANNUAL,
      dayPart: rec.dayPart || 'full',
      fromDate: toYMD(rec.fromDate) || '',
      toDate: toYMD(rec.toDate) || '',
      reason: rec.reason || '',
      status: rec.status || LEAVE_STATUS.PENDING,
    });
  }, [rec]);

  const employeeOptions = useMemo(() =>
    (employees || [])
      .filter(e => String(e.role || '').toLowerCase() !== 'admin')
      .map(e => ({ value: e.id, label: e.name || e.email || `#${e.id}` })), [employees]);

  const setField = (k,v) => setForm(p => ({ ...p, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!form.fromDate || !form.toDate) { setErr('Chọn khoảng ngày hợp lệ'); return; }
    const payload = {
      userId: form.userId || null,
      type: form.type,
      dayPart: form.dayPart,
      fromDate: toYMD(form.fromDate),
      toDate: toYMD(form.toDate),
      reason: form.reason || null,
      status: form.status,
    };
    try {
      const up = await update(rec.id, payload);
      setRec(up);
      onSaved?.(up);
      onBack?.();
    } catch (e2) {
      setErr(e2?.response?.data || e2?.message || 'Cập nhật thất bại');
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Đang tải...</div>;
  if (err && !rec) return <div className="p-6 text-red-700 bg-red-50 rounded">{String(err)}</div>;
  if (!rec) return <div className="p-6 text-gray-500">Không tìm thấy đơn.</div>;

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Sửa đơn nghỉ</h2>
        <button onClick={onBack} className="px-3 py-1 border rounded-lg hover:bg-gray-50"><X className="w-4 h-4" /></button>
      </div>

      {err && <div className="mb-3 p-3 bg-red-50 text-red-700 rounded">{String(err)}</div>}

      <form onSubmit={onSubmit} className="space-y-4 bg-white border rounded-xl p-4">
        {isAdmin && (
          <div>
            <label className="block text-sm text-gray-700 mb-1">Nhân viên</label>
            <select value={form.userId} onChange={e=>setField('userId', e.target.value)} className="w-full px-3 py-2 border rounded-lg">
              <option value="">— Chọn nhân viên —</option>
              {employeeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Loại</label>
            <select value={form.type} onChange={e=>setField('type', e.target.value)} className="w-full px-3 py-2 border rounded-lg">
              {typeOptionsVI.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Ca</label>
            <select value={form.dayPart} onChange={e=>setField('dayPart', e.target.value)} className="w-full px-3 py-2 border rounded-lg">
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
          <button type="button" onClick={onBack} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Huỷ</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2">
            <Save className="w-4 h-4" /> Lưu
          </button>
        </div>
      </form>
    </div>
  );
}
