import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Eye, Edit, Trash2, Calendar } from 'lucide-react';
import { getAdminTasks, getMyTasks, deleteTask } from '../services/tasks';
import { useEmployeesStore } from '../store/employeesStore'; // ✅ dùng để map AssigneeID -> tên

const labelFromStatus = (s) => {
  const v = String(s ?? '').toLowerCase();
  if (['moi', 'new'].includes(v)) return 'Mới';
  if (['dang_lam', 'in_progress', 'đang làm', 'dang lam', 'đang thực hiện', 'dang thuc hien'].includes(v)) return 'Đang thực hiện';
  if (['hoan_thanh', 'done', 'hoàn thành'].includes(v)) return 'Hoàn thành';
  if (['qua_han', 'overdue', 'quá hạn'].includes(v)) return 'Quá hạn';
  if (['mới', 'đang thực hiện', 'quá hạn', 'hoàn thành'].includes(s)) return s;
  return 'Mới';
};

const labelFromPriority = (p) => {
  if (typeof p === 'number') {
    if (p >= 2) return 'Cao';
    if (p === 1) return 'Trung bình';
    return 'Thấp';
  }
  const v = String(p ?? '').toLowerCase();
  if (['3', 'high', 'cao'].includes(v)) return 'Cao';
  if (['2', 'medium', 'trung bình', 'trung binh'].includes(v)) return 'Trung bình';
  if (['1', '0', 'low', 'thấp', 'thap'].includes(v)) return 'Thấp';
  return 'Trung bình';
};

const getStatusColor = (statusVi) => {
  switch (statusVi) {
    case 'Hoàn thành': return 'bg-green-100 text-green-800';
    case 'Đang thực hiện': return 'bg-blue-100 text-blue-800';
    case 'Quá hạn': return 'bg-red-100 text-red-800';
    case 'Mới':
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priorityVi) => {
  switch (priorityVi) {
    case 'Cao': return 'bg-red-100 text-red-800';
    case 'Trung bình': return 'bg-yellow-100 text-yellow-800';
    case 'Thấp':
    default: return 'bg-green-100 text-green-800';
  }
};

const fmtDate = (ymd) => {
  if (!ymd) return '—';
  const [y, m, d] = ymd.split('-');
  if (!y || !m || !d) return ymd;
  return `${Number(d)}/${Number(m)}/${y}`;
};

const TaskList = ({ onViewTask, onAddTask, onEditTask }) => {
  // filter UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả trạng thái');
  const [assigneeFilter, setAssigneeFilter] = useState('Tất cả người thực hiện');
  const [priorityFilter, setPriorityFilter] = useState('Tất cả độ ưu tiên');
  const [dateFilter, setDateFilter] = useState('');

  // task data state
  const [rawTasks, setRawTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // employees store (để map ID -> tên)
  const employees = useEmployeesStore(s => s.items);
  const fetchEmployees = useEmployeesStore(s => s.fetchAll);

  // Tạo map { userId -> "Tên (Email)" }
  const assigneeMap = useMemo(() => {
    const map = new Map();
    for (const e of employees) {
      const label = e?.name || e?.email || `#${e?.id}`;
      map.set(e?.id, label);
    }
    return map;
  }, [employees]);

  // tải tasks + cố gắng tải danh sách nhân viên (nếu có quyền admin)
  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      // 1) tasks
      let data = [];
      try {
        data = await getAdminTasks(); // admin
      } catch (e) {
        if (e?.response?.status === 403) {
          data = await getMyTasks(); // staff
        } else {
          throw e;
        }
      }

      // 2) employees (để map tên) – có thể 403 với staff, nên bọc try/catch riêng
      try {
        await fetchEmployees(); // AdminOnly /api/Users
      } catch (_) {
        // ignore nếu không có quyền
      }

      const mapped = (Array.isArray(data) ? data : []).map(t => {
        const statusVi = labelFromStatus(t.status);
        const priorityVi = labelFromPriority(t.priority);

        // Ưu tiên dùng name/email từ API; nếu không có, tra map theo assigneeId
        const nameFromMap = assigneeMap.get?.(t.assigneeId);
        const displayAssignee = t.assignee || t.assigneeName || t.assigneeEmail || nameFromMap || '—';

        return {
          ...t,
          _statusVi: statusVi,
          _priorityVi: priorityVi,
          _dueYMD: t.dueDate ?? null,
          _dueDisplay: fmtDate(t.dueDate),
          _assigneeDisplay: displayAssignee,
          _avatar: (displayAssignee || 'N').trim().charAt(0).toUpperCase(),
        };
      });
      setRawTasks(mapped);
    } catch (e) {
      setErr(e?.response?.data || e?.message || 'Lỗi tải danh sách công việc');
    } finally {
      setLoading(false);
    }
  };

  // lần đầu load
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);
  // nếu danh sách nhân viên về sau (fetchEmployees async), remap lại tên hiển thị
  useEffect(() => {
    if (!rawTasks.length) return;
    setRawTasks(prev => prev.map(t => {
      const displayAssignee = t.assignee || t.assigneeName || t.assigneeEmail || assigneeMap.get(t.assigneeId) || '—';
      return { ...t, _assigneeDisplay: displayAssignee, _avatar: (displayAssignee || 'N').trim().charAt(0).toUpperCase() };
    }));
  }, [assigneeMap]); // remap khi employees đổi

  // options Assignee từ dữ liệu thật
  const assignees = useMemo(() => {
    const set = new Set(rawTasks.map(t => t._assigneeDisplay).filter(Boolean));
    return ['Tất cả người thực hiện', ...Array.from(set)];
  }, [rawTasks]);

  const filteredTasks = useMemo(() => {
    return rawTasks.filter(task => {
      const matchesSearch =
        (task.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task._assigneeDisplay || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'Tất cả trạng thái' || task._statusVi === statusFilter;

      const matchesAssignee =
        assigneeFilter === 'Tất cả người thực hiện' || task._assigneeDisplay === assigneeFilter;

      const matchesPriority =
        priorityFilter === 'Tất cả độ ưu tiên' || task._priorityVi === priorityFilter;

      const matchesDate =
        !dateFilter || !task._dueYMD || task._dueYMD >= dateFilter;

      return matchesSearch && matchesStatus && matchesAssignee && matchesPriority && matchesDate;
    });
  }, [rawTasks, searchTerm, statusFilter, assigneeFilter, priorityFilter, dateFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('Tất cả trạng thái');
    setAssigneeFilter('Tất cả người thực hiện');
    setPriorityFilter('Tất cả độ ưu tiên');
    setDateFilter('');
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa công việc này?')) return;
    try {
      await deleteTask(taskId);
      await load();
      alert('Công việc đã được xóa thành công!');
    } catch (e) {
      alert(e?.response?.data || e?.message || 'Xóa công việc thất bại');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bộ lọc công việc</h1>
          <p className="text-gray-600 mt-1">Quản lý và theo dõi tiến độ công việc</p>
        </div>
        <button
          onClick={onAddTask}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tạo công việc mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Nhập tên công việc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Tất cả trạng thái</option>
            <option>Mới</option>
            <option>Đang thực hiện</option>
            <option>Hoàn thành</option>
            <option>Quá hạn</option>
          </select>

          {/* Assignee Filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {assignees.map(a => <option key={a}>{a}</option>)}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Tất cả độ ưu tiên</option>
            <option>Cao</option>
            <option>Trung bình</option>
            <option>Thấp</option>
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={dateFilter || ''}
            onChange={(e) => setDateFilter(e.target.value || '')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={clearFilters} className="text-blue-600 hover:text-blue-800 text-sm">
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {err && <div className="p-4 text-red-700 bg-red-50">{String(err)}</div>}
        {loading ? (
          <div className="p-6 text-gray-500">Đang tải...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên công việc
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người thực hiện
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Độ ưu tiên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời hạn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{task.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                          {task._avatar}
                        </div>
                        <div className="text-sm text-gray-900">{task._assigneeDisplay}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task._priorityVi)}`}>
                        {task._priorityVi}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {task._dueDisplay}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task._statusVi)}`}>
                        {task._statusVi}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onViewTask?.(task.id)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditTask?.(task.id)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {(!loading && filteredTasks.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Không có công việc nào khớp điều kiện.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="mt-4 text-sm text-gray-600">
        Hiển thị {filteredTasks.length} trong tổng số {rawTasks.length} công việc
      </div>
    </div>
  );
};

export default TaskList;
