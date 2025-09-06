import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { useTasksStore } from '../store/tasksStore';
import { TASK_STATUS, statusOptionsVI } from '../constants/taskStatus';
import StatusBadge from './common/StatusBadge';
import { useEmployeesStore } from '../store/employeesStore'; // 🔧 dùng để resolve AssigneeID → tên/email

const TaskDetail = ({ taskId, onBack, onEdit, onComplete }) => {
  const byId = useTasksStore(s => s.byId);
  const fetchById = useTasksStore(s => s.fetchById);
  const updateTask = useTasksStore(s => s.update);

  // lấy từ store trước, nếu chưa có sẽ tự fetch
  const taskFromStore = useMemo(() => byId?.(taskId), [byId, taskId]);
  const [loading, setLoading] = useState(!taskFromStore);
  const [err, setErr] = useState('');
  const [taskLocal, setTaskLocal] = useState(taskFromStore || null);

  useEffect(() => {
    let cancelled = false;
    const ensure = async () => {
      if (taskFromStore) {
        setTaskLocal(taskFromStore);
        setLoading(false);
        return;
      }
      setLoading(true);
      setErr('');
      try {
        const t = await fetchById(taskId);
        if (!cancelled) setTaskLocal(t);
      } catch (e) {
        if (!cancelled) setErr(e?.response?.data || e?.message || 'Không tải được công việc');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    ensure();
    return () => { cancelled = true; };
  }, [taskId, taskFromStore, fetchById]);

  const task = taskLocal;

  // ====== Map người thực hiện từ employeesStore (Admin) hoặc dùng field có sẵn ======
  const employees = useEmployeesStore(s => s.items);
  const fetchEmployees = useEmployeesStore(s => s.fetchAll);
  useEffect(() => {
    // Cố gắng tải danh sách nhân viên để map ID -> tên/email; nếu staff (403) thì bỏ qua
    if (!employees?.length) {
      fetchEmployees().catch(() => {});
    }
  }, [employees?.length, fetchEmployees]);

  const empById = useMemo(() => {
    const m = new Map();
    for (const e of employees || []) m.set(e.id, e);
    return m;
  }, [employees]);

  const assigneeName = useMemo(() => {
    if (!task) return '';
    return (
      task.assignee ||
      task.assigneeName ||
      empById.get(task.assigneeId)?.name ||
      empById.get(task.assigneeID)?.name || // phòng hờ viết hoa
      ''
    );
  }, [task, empById]);

  const assigneeEmail = useMemo(() => {
    if (!task) return '';
    return (
      task.assigneeEmail ||
      empById.get(task.assigneeId)?.email ||
      empById.get(task.assigneeID)?.email ||
      ''
    );
  }, [task, empById]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }
  if (err) {
    return (
      <div className="p-6">
        <div className="text-red-700 bg-red-50 p-3 rounded mb-3">{String(err)}</div>
        <button onClick={onBack} className="px-3 py-2 rounded-lg border">Quay lại</button>
      </div>
    );
  }
  if (!task) {
    return (
      <div className="p-6">
        <div className="text-gray-500 text-sm mb-3">Không tìm thấy công việc.</div>
        <button onClick={onBack} className="px-3 py-2 rounded-lg border">Quay lại</button>
      </div>
    );
  }

  const isDone = String(task.status).toLowerCase() === TASK_STATUS.DONE;

  const setStatus = async (newStatus) => {
    const patch = { id: task.id, status: newStatus };
    try {
      const updated = await updateTask(patch); // DONE sẽ gọi complete API qua store
      setTaskLocal(updated);
    } catch (e) {
      alert(e?.response?.data || e?.message || 'Cập nhật trạng thái thất bại');
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{task.name}</h2>
        <div className="flex items-center gap-2">
          {!isDone && (
            <button
              onClick={() => (onComplete ? onComplete(task.id) : setStatus(TASK_STATUS.DONE))}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              title="Xác nhận đã hoàn thành"
            >
              <CheckCircle className="w-4 h-4" />
              Hoàn thành
            </button>
          )}
          <button onClick={() => onEdit?.(task.id)} className="px-3 py-2 rounded-lg border">Sửa</button>
          <button onClick={onBack} className="px-3 py-2 rounded-lg border">Quay lại</button>
        </div>
      </div>

      <div className="text-sm text-gray-600 flex items-center gap-2 flex-wrap">
        Trạng thái: <StatusBadge status={task.status} />
        <select
          className="ml-2 border rounded-lg p-1.5 text-xs"
          value={task.status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {statusOptionsVI.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {task.completedAt && (
          <span className="ml-2">• Hoàn thành lúc: {new Date(task.completedAt).toLocaleString()}</span>
        )}
      </div>

      {task.description && (
        <div className="bg-white border rounded-xl shadow-sm p-4">
          <div className="text-gray-700 whitespace-pre-line">{task.description}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {task.dueDate && (
          <div className="bg-white border rounded-xl shadow-sm p-4">
            <div className="text-xs text-gray-500">Hạn</div>
            <div className="font-medium">{task.dueDate}</div>
          </div>
        )}
        {(assigneeName || assigneeEmail) && (
          <div className="bg-white border rounded-xl shadow-sm p-4">
            <div className="text-xs text-gray-500">Phụ trách</div>
            <div className="font-medium">{assigneeName || '—'}</div>
          </div>
        )}
        {assigneeEmail && (
          <div className="bg-white border rounded-xl shadow-sm p-4">
            <div className="text-xs text-gray-500">Email</div>
            <div className="font-medium">{assigneeEmail}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetail;
