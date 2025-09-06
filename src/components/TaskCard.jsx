import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useTasksStore } from '../store/tasksStore';

/**
 * Cách dùng:
 * 1) Giống cũ (parent tự truyền tasks, count):
 *    <TaskCard type="todo" title="Công việc cần làm" tasks={todoTasks} count={todoTasks.length} />
 *
 * 2) Tự fetch từ store/BE:
 *    <TaskCard type="todo" title="Công việc cần làm" autoFetch />
 *
 *    - Sẽ gọi useTasksStore().fetchAll() nếu có.
 *    - Lọc theo type và tự map dữ liệu cho UI.
 */

const TaskCard = ({ type, title, tasks: tasksProp, count: countProp, autoFetch = false }) => {
  const allTasks = useTasksStore(s => s.items || []);
  const fetchAll = useTasksStore(s => s.fetchAll); // nếu store chưa có cũng không sao
  const [loading, setLoading] = useState(false);

  // ===== Helpers =====
  const parseDate = (d) => {
    // hỗ trợ cả 'YYYY-MM-DD', ISO, Date object
    try {
      if (!d) return null;
      if (d instanceof Date) return d;
      // Một số BE trả "2025-09-10T00:00:00", hoặc "2025-09-10"
      const dt = new Date(d);
      return isNaN(dt.getTime()) ? null : dt;
    } catch {
      return null;
    }
  };

  const fmtVN = (d) => {
    const dt = parseDate(d);
    if (!dt) return '—';
    // dd/MM/yyyy
    const dd = String(dt.getDate()).padStart(2, '0');
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const yyyy = dt.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const daysBetween = (a, b) => {
    const ms = Math.abs(a.getTime() - b.getTime());
    return Math.floor(ms / (24 * 60 * 60 * 1000));
  };

  // ===== Tự fetch nếu autoFetch =====
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!autoFetch) return;
      if (typeof fetchAll !== 'function') return; // store chưa có fetchAll -> bỏ qua
      try {
        setLoading(true);
        await fetchAll(); // Gọi API lấy tasks (service/tasks.js -> /api/Tasks ...)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[TaskCard] fetchAll failed:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [autoFetch, fetchAll]);

  // ===== Chọn nguồn dữ liệu =====
  const source = useMemo(() => {
    // Ưu tiên props nếu có
    if (Array.isArray(tasksProp)) return tasksProp;
    // Nếu không có props: khi autoFetch -> dùng allTasks từ store
    // (hoặc parent đã nạp allTasks từ nơi khác)
    return allTasks;
  }, [tasksProp, allTasks]);

  // ===== Lọc và map theo type =====
  const filteredTasks = useMemo(() => {
    const targetStatus =
      type === 'todo' ? 'todo' :
      type === 'in-progress' ? 'in-progress' :
      type === 'overdue' ? 'overdue' : null;

    // Chuẩn hoá record từ BE → UI
    const normalized = (t) => {
      const title = t.title || t.name || t.Title || t.Name || 'Chưa đặt tên';
      const due = t.dueDate || t.deadline || t.DueDate || t.Deadline || null;
      const assignee =
        t.assignee?.name ||
        t.assigneeName ||
        t.AssigneeName ||
        t.assignee ||
        t.Assignee ||
        '—';

      // status có thể ở kiểu khác nhau
      const status = (t.status || t.Status || '').toString();

      // Tính overdueDays
      let overdueDays = 0;
      if (due) {
        const d = parseDate(due);
        const today = new Date();
        if (d && d < today) {
          overdueDays = daysBetween(today, d);
        }
      }

      return {
        ...t,
        name: title,
        deadline: fmtVN(due),
        assignee,
        status,
        overdueDays
      };
    };

    const list = (source || []).map(normalized);

    if (!targetStatus) return list;

    return list.filter(t => {
      // status trong DB là 'todo'|'in-progress'|'overdue'|'done'
      // Trường hợp phía BE dùng khác, ở đây ta so sánh lowercase
      const s = (t.status || '').toLowerCase();
      return s === targetStatus;
    });
  }, [source, type]);

  // ===== Đếm =====
  const cardCount = useMemo(() => {
    if (typeof countProp === 'number') return countProp;
    return filteredTasks.length;
  }, [countProp, filteredTasks.length]);

  // ===== Styles =====
  const getCardStyles = () => {
    switch (type) {
      case 'todo':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: <CheckCircle className="w-5 h-5 text-blue-600" />,
          titleColor: 'text-blue-800'
        };
      case 'in-progress':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: <Clock className="w-5 h-5 text-yellow-600" />,
          titleColor: 'text-yellow-800'
        };
      case 'overdue':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
          titleColor: 'text-red-800'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: <CheckCircle className="w-5 h-5 text-gray-600" />,
          titleColor: 'text-gray-800'
        };
    }
  };

  const styles = getCardStyles();

  return (
    <div className={`${styles.bg} ${styles.border} border rounded-xl p-6 flex flex-col gap-4`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className={`text-lg font-semibold ${styles.titleColor}`}>{title}</div>
        <div className="p-2 bg-white rounded-lg shadow-sm">
          {styles.icon}
        </div>
      </div>

      {/* Task List */}
      <div className="flex flex-col gap-3">
        {loading && (
          <div className="text-sm text-gray-500">Đang tải dữ liệu…</div>
        )}

        {!loading && filteredTasks.map((task, index) => (
          <div key={task.id || task.taskId || index} className="bg-white rounded-lg p-4 shadow-sm">
            {type === 'todo' && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{task.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Hạn:</span> {task.deadline}
                  </div>
                </div>
              </div>
            )}

            {type === 'in-progress' && (
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="font-medium text-gray-800">{task.name}</div>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Người thực hiện:</span> {task.assignee}
                </div>
                {/* thanh progress giả định theo thời gian (nếu cần) */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-yellow-500"
                    style={{ width: '50%' }}
                    aria-label="progress"
                  />
                </div>
              </div>
            )}

            {type === 'overdue' && (
              <div className="space-y-2">
                <div className="font-medium text-gray-800">{task.name}</div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-red-600 font-medium">Quá hạn</span>
                  <span className="text-red-600">{task.overdueDays}</span>
                  <span className="text-red-600">ngày</span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Hạn:</span> {task.deadline}
                </div>
              </div>
            )}
          </div>
        ))}

        {!loading && filteredTasks.length === 0 && (
          <div className="text-sm text-gray-500">Không có công việc</div>
        )}
      </div>

      {/* Count */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
        <span className="font-medium">Tổng:</span>
        <span className="font-semibold text-gray-800">{cardCount}</span>
        <span>công việc</span>
      </div>
    </div>
  );
};

export default TaskCard;
