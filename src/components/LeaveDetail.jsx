import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, XCircle, Edit3, X } from 'lucide-react';
import { useLeavesStore } from '../store/leavesStore';
import { LEAVE_STATUS, LEAVE_STATUS_LABEL_VI, LEAVE_TYPE_LABEL_VI, DAY_PART_LABEL_VI, fmtDate } from '../constants/leave';

export default function LeaveDetail({ leaveId, onBack, onEdit }) {
  const byId = useLeavesStore(s => s.byId);
  const fetchById = useLeavesStore(s => s.fetchById);
  const approve = useLeavesStore(s => s.approve);
  const reject = useLeavesStore(s => s.reject);

  const leaveFromStore = useMemo(() => byId?.(leaveId), [byId, leaveId]);
  const [rec, setRec] = useState(leaveFromStore || null);
  const [loading, setLoading] = useState(!leaveFromStore);
  const [err, setErr] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    let cancel = false;
    const run = async () => {
      if (leaveFromStore) { setRec(leaveFromStore); setLoading(false); return; }
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
  }, [leaveId, leaveFromStore, fetchById]);

  const statusLabel = rec ? (LEAVE_STATUS_LABEL_VI[rec.status] || rec.status) : '';

  const onApprove = async () => {
    try {
      const up = await approve(rec.id, note);
      setRec(up);
      setNote('');
    } catch (e) {
      alert(e?.response?.data || e?.message || 'Duyệt thất bại');
    }
  };
  const onReject = async () => {
    try {
      const up = await reject(rec.id, note);
      setRec(up);
      setNote('');
    } catch (e) {
      alert(e?.response?.data || e?.message || 'Từ chối thất bại');
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Đang tải...</div>;
  if (err) return <div className="p-6 text-red-700 bg-red-50 rounded">{String(err)}</div>;
  if (!rec) return <div className="p-6 text-gray-500">Không tìm thấy đơn.</div>;

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Chi tiết đơn nghỉ</h2>
        <button onClick={onBack} className="px-3 py-1 border rounded-lg hover:bg-gray-50"><X className="w-4 h-4" /></button>
      </div>

      <div className="bg-white border rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-gray-500">Nhân viên</div>
            <div className="font-medium">{rec.employeeName || '—'}</div>
            {rec.employeeEmail && <div className="text-xs text-gray-500">{rec.employeeEmail}</div>}
          </div>
          <div>
            <div className="text-xs text-gray-500">Loại nghỉ</div>
            <div className="font-medium">{LEAVE_TYPE_LABEL_VI[rec.type] || rec.type}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Từ ngày</div>
            <div className="font-medium">{fmtDate(rec.fromDate)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Đến ngày</div>
            <div className="font-medium">{fmtDate(rec.toDate)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Ca</div>
            <div className="font-medium">{DAY_PART_LABEL_VI[rec.dayPart] || rec.dayPart}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Trạng thái</div>
            <div className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100">{statusLabel}</div>
          </div>
        </div>

        {rec.reason && (
          <div>
            <div className="text-xs text-gray-500 mb-1">Lý do</div>
            <div className="text-gray-800 whitespace-pre-line">{rec.reason}</div>
          </div>
        )}

        {/* Action cho admin */}
        {rec.status === LEAVE_STATUS.PENDING && (
          <div className="border-t pt-3">
            <div className="text-sm text-gray-600 mb-2">Ghi chú phê duyệt (không bắt buộc)</div>
            <textarea value={note} onChange={e=>setNote(e.target.value)} rows={2} className="w-full px-3 py-2 border rounded-lg" />
            <div className="mt-3 flex items-center gap-2">
              <button onClick={onApprove} className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 inline-flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Duyệt
              </button>
              <button onClick={onReject} className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 inline-flex items-center gap-2">
                <XCircle className="w-4 h-4" /> Từ chối
              </button>
              <button onClick={() => onEdit?.(rec.id)} className="px-3 py-2 rounded-lg border inline-flex items-center gap-2">
                <Edit3 className="w-4 h-4" /> Sửa
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
