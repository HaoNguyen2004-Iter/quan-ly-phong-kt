import React, { useEffect, useState } from "react";
import { getMyTasks, completeTask } from "../../services/tasks";
import { TASK_STATUS_LABEL, badgeClassForTask } from "../../constants/status";
import { CheckCircle } from "lucide-react";

export default function MyTasks() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const list = await getMyTasks();
      setTasks(list);
    } catch {
      setErr("Không tải được danh sách công việc");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleComplete = async (id) => {
    try {
      await completeTask(id);
      await load();
    } catch {
      alert("Xác nhận hoàn thành thất bại");
    }
  };

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Công việc của tôi</h1>
      {tasks.length === 0 ? (
        <div className="text-gray-500">Chưa có công việc nào.</div>
      ) : (
        tasks.map((t) => {
          const id = t.taskID ?? t.taskId ?? t.id;
          const status = (t.status || "").toLowerCase();
          const due = t.dueDate ? new Date(t.dueDate).toLocaleDateString() : null;
          return (
            <div key={id} className="border rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{t.title || t.name}</div>
                <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded ${badgeClassForTask(status)}`}>
                    {TASK_STATUS_LABEL[status] || t.status}
                  </span>
                  {due && <span>· Hạn: {due}</span>}
                </div>
              </div>

              {status !== "done" ? (
                <button
                  onClick={() => handleComplete(id)}
                  className="px-3 py-1 rounded bg-green-600 text-white text-sm hover:bg-green-700 flex items-center gap-1"
                >
                  <CheckCircle className="w-4 h-4" /> Hoàn thành
                </button>
              ) : (
                <span className="text-green-700 text-sm flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Đã hoàn thành
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
