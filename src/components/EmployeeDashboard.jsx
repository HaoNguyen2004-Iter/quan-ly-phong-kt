import React, { useEffect, useState } from 'react';
import { Calendar, FileText, CheckCircle, Info } from 'lucide-react';
import { getMyTasks, completeTask } from '../services/tasks';
import { TASK_STATUS_LABEL, badgeClassForTask } from '../constants/status';

const EmployeeDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [notifications] = useState([
    { id: 1, message: 'Bạn có công việc mới được giao', date: '2024-01-10' },
  ]);
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const list = await getMyTasks();
      setTasks(list);
    } catch (e) {
      setErr('Không tải được công việc');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleComplete = async (taskID) => {
    try {
      await completeTask(taskID);
      await load();
    } catch (e) {
      alert('Xác nhận hoàn thành thất bại');
    }
  };

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-600" /> Thông báo
        </h2>
        <ul className="space-y-2">
          {notifications.map(n => (
            <li key={n.id} className="text-sm text-gray-700">{n.date} — {n.message}</li>
          ))}
        </ul>
      </div>

      {/* Tasks */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-600" /> Công việc của tôi
        </h2>

        {tasks.length === 0 ? (
          <div className="text-gray-500">Chưa có công việc nào.</div>
        ) : (
          <div className="space-y-3">
            {tasks.map(t => {
              const id = t.taskID ?? t.taskId ?? t.id;
              const status = (t.status || "").toLowerCase();
              const due = t.dueDate ? new Date(t.dueDate).toLocaleDateString() : null;

              return (
                <div key={id} className="border rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t.title || t.name}</div>
                    <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded ${badgeClassForTask(status)}`}>
                        {TASK_STATUS_LABEL[status] || t.status}
                      </span>
                      {due && <span>· Hạn: {due}</span>}
                    </div>
                  </div>

                  {status !== 'done' ? (
                    <button
                      onClick={() => handleComplete(id)}
                      className="px-3 py-1 rounded bg-green-600 text-white text-sm hover:bg-green-700 flex items-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" /> Xác nhận hoàn thành
                    </button>
                  ) : (
                    <span className="text-green-700 text-sm flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Đã hoàn thành
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-600" /> Lịch công việc
        </h2>
        <div className="h-64 bg-gray-50 rounded-lg grid place-items-center text-gray-500">
          Lịch công việc của bạn sẽ hiển thị ở đây
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
