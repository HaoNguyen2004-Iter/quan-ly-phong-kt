// src/components/ReportPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar, Filter, RefreshCw, Download,
  Users, CheckCircle, AlertTriangle, Clock, ClipboardList
} from 'lucide-react';

import { useEmployeesStore } from '../store/employeesStore';
import { useTasksStore } from '../store/tasksStore';
import { useLeavesStore } from '../store/leavesStore';

/* ==================== Helpers ==================== */
const pad2 = (n) => (n < 10 ? `0${n}` : `${n}`);
const fmtDate = (d) => {
  if (!d) return '';
  const dd = new Date(d);
  if (isNaN(dd)) return '';
  return `${pad2(dd.getDate())}/${pad2(dd.getMonth() + 1)}/${dd.getFullYear()}`;
};

// parse "yyyy-MM-dd", ISO, hoặc "dd/MM/yyyy"
const parseDateFlexible = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    if (value.includes('/') && value.split('/').length === 3) {
      const [d, m, y] = value.split('/');
      const iso = `${y}-${pad2(+m)}-${pad2(+d)}T00:00:00`;
      const dt = new Date(iso);
      return isNaN(dt) ? null : dt;
    }
    const dt = new Date(value);
    return isNaN(dt) ? null : dt;
  }
  const dt = new Date(value);
  return isNaN(dt) ? null : dt;
};

// nếu from/to trống => coi như không giới hạn
const overlap = (start, end, from, to) => {
  const s = parseDateFlexible(start) || parseDateFlexible(end) || null;
  const e = parseDateFlexible(end) || parseDateFlexible(start) || null;
  const f = parseDateFlexible(from);
  const t = parseDateFlexible(to);

  if (!f && !t) return true; // không lọc thời gian
  if (!s && !e) return true; // không có ngày thì cho qua
  const S = s || e;
  const E = e || s;
  if (f && !t) return E >= f;
  if (!f && t) return S <= t;
  return S <= t && E >= f;
};

// Chuẩn hoá status đơn nghỉ sang VI
const viLeaveStatus = (val) => {
  if (!val) return 'Chờ duyệt';
  const s = String(val).toLowerCase().trim();
  if (['pending', 'cho duyet', 'chờ duyệt', 'cho_duyet'].includes(s)) return 'Chờ duyệt';
  if (['approved', 'da duyet', 'đã duyệt', 'da_duyet'].includes(s)) return 'Đã duyệt';
  if (['rejected', 'tu choi', 'từ chối', 'tu_choi'].includes(s)) return 'Từ chối';
  if (['cancelled', 'canceled', 'huy', 'đã hủy', 'da_huy'].includes(s)) return 'Đã hủy';
  return val; // đã là VI thì giữ nguyên
};

const statusPillClass = (vi) => {
  if (vi === 'Đã duyệt') return 'bg-green-100 text-green-800';
  if (vi === 'Từ chối') return 'bg-red-100 text-red-800';
  if (vi === 'Đã hủy') return 'bg-gray-200 text-gray-700';
  return 'bg-yellow-100 text-yellow-800'; // Chờ duyệt
};

// Chuẩn hoá status task về 4 nhóm
const normTaskStatus = (s) => {
  const k = String(s || '').toLowerCase().trim();
  if (['mới', 'new', 'todo', 'to-do'].includes(k)) return 'todo';
  if (['đang thực hiện', 'dang thuc hien', 'in-progress', 'in progress', 'doing'].includes(k)) return 'in-progress';
  if (['hoàn thành', 'hoan thanh', 'done', 'finished', 'completed'].includes(k)) return 'done';
  if (['quá hạn', 'qua han', 'overdue', 'over-due'].includes(k)) return 'overdue';
  return 'todo';
};

const viTaskStatusLabel = (norm) => {
  switch (norm) {
    case 'todo': return 'Mới';
    case 'in-progress': return 'Đang thực hiện';
    case 'overdue': return 'Quá hạn';
    case 'done': return 'Hoàn thành';
    default: return 'Mới';
  }
};

const taskPillClass = (norm) => {
  const v = normTaskStatus(norm);
  if (v === 'done') return 'bg-green-100 text-green-800';
  if (v === 'in-progress') return 'bg-yellow-100 text-yellow-800';
  if (v === 'overdue') return 'bg-red-100 text-red-800';
  return 'bg-blue-100 text-blue-800'; // todo
};

const downloadCSV = (rows, filename = 'report.csv') => {
  const toCSV = (v) => {
    if (v == null) return '';
    const s = String(v).replace(/"/g, '""');
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
  };
  const csv = rows.map(r => r.map(toCSV).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/* ==================== UI nhỏ ==================== */
const StatCard = ({ icon: Icon, title, value }) => (
  <div className="p-5 rounded-xl border bg-white">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-3xl font-bold text-gray-800">{value}</div>
      </div>
      <div className="p-3 rounded-lg bg-gray-50">
        <Icon className="w-6 h-6 text-gray-600" />
      </div>
    </div>
  </div>
);

/* ==================== Component ==================== */
const ReportPage = () => {
  // stores
  const emps = useEmployeesStore(s => s.items || []);
  const fetchEmps = useEmployeesStore(s => s.fetchAll);

  const rawTasks = useTasksStore(s => s.items || []);
  const fetchTasks = useTasksStore(s => s.fetchAll); // nếu có
  const leaves = useLeavesStore(s => s.items || []);
  const fetchLeaves = useLeavesStore(s => s.fetchAll);

  // filters
  const [tab, setTab] = useState('overview'); // overview | tasks | leaves | employees
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [leaveStatus, setLeaveStatus] = useState('all');

  // load data khi vào trang
  useEffect(() => {
    fetchEmps?.().catch(() => {});
    fetchLeaves?.().catch(() => {});
    fetchTasks?.().catch(() => {});
  }, [fetchEmps, fetchLeaves, fetchTasks]);

  // index nhân viên theo id để tra tên nhanh
  const empMap = useMemo(() => {
    const m = new Map();
    for (const e of emps) m.set(e.id, e);
    return m;
  }, [emps]);

  // ---- Tasks decorate: assignee + chuẩn hoá + tự tính overdue nếu cần
  const tasks = useMemo(() => {
    return rawTasks.map(t => {
      const assigneeId = t.assigneeId ?? t.assignee; // phòng khi assignee là id
      const nameFromId = empMap.get(assigneeId)?.name;
      const assigneeDisplay = t.assigneeName || t.assignee || nameFromId || '—';

      const due = t.dueDate ?? t.DueDate ?? t.deadline ?? null;
      const start = t.startDate ?? t.StartDate ?? t.beginDate ?? null;

      const baseNorm = normTaskStatus(t.status ?? t.Status);
      let norm = baseNorm;
      // Tự đánh dấu quá hạn nếu chưa done mà đã quá hạn
      const dueDt = parseDateFlexible(due);
      if (baseNorm !== 'done' && dueDt && dueDt.getTime() < Date.now()) {
        norm = 'overdue';
      }

      return {
        ...t,
        assigneeDisplay,
        startDate: start,
        dueDate: due,
        _normStatus: norm,
      };
    });
  }, [rawTasks, empMap]);

  // ---- Leaves decorate: tên NV + VI status + days (nếu thiếu)
  const leavesDecorated = useMemo(() => {
    return (leaves || []).map(l => {
      const empName = l.employeeName || empMap.get(l.employeeId)?.name || '';
      const _viStatus = viLeaveStatus(l.status);
      let days = l.days;
      if (days == null) {
        const s = parseDateFlexible(l.startDate);
        const e = parseDateFlexible(l.endDate);
        if (s && e) {
          // tính số ngày (bao gồm 2 đầu mút)
          const ms = Math.max(0, e.setHours(0,0,0,0) - s.setHours(0,0,0,0));
          days = Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
        }
      }
      return { ...l, employeeName: empName, _viStatus, days };
    });
  }, [leaves, empMap]);

  // ---- Lọc theo khoảng ngày
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const hasDate = t?.dueDate || t?.startDate;
      if (!hasDate) return true;
      const s = t?.startDate || t?.dueDate;
      const e = t?.dueDate || t?.startDate;
      return overlap(s, e, fromDate, toDate);
    });
  }, [tasks, fromDate, toDate]);

  const filteredLeaves = useMemo(() => {
    return leavesDecorated.filter(l => {
      const okRange = overlap(l.startDate, l.endDate, fromDate, toDate);
      if (!okRange) return false;
      if (leaveStatus === 'all') return true;
      return l._viStatus === leaveStatus;
    });
  }, [leavesDecorated, fromDate, toDate, leaveStatus]);

  // ---- Thống kê
  const taskCounts = useMemo(() => {
    const total = filteredTasks.length;
    let todo = 0, inprog = 0, overdue = 0, done = 0;
    for (const t of filteredTasks) {
      if (t._normStatus === 'todo') todo++;
      else if (t._normStatus === 'in-progress') inprog++;
      else if (t._normStatus === 'overdue') overdue++;
      else if (t._normStatus === 'done') done++;
    }
    return { total, todo, inprog, overdue, done };
  }, [filteredTasks]);

  const leaveCounts = useMemo(() => {
    const total = filteredLeaves.length;
    const pending = filteredLeaves.filter(l => l._viStatus === 'Chờ duyệt').length;
    const approved = filteredLeaves.filter(l => l._viStatus === 'Đã duyệt').length;
    const rejected = filteredLeaves.filter(l => l._viStatus === 'Từ chối').length;
    const cancelled = filteredLeaves.filter(l => l._viStatus === 'Đã hủy').length;
    return { total, pending, approved, rejected, cancelled };
  }, [filteredLeaves]);

  const staffOnly = useMemo(
    () => emps.filter(e => String(e.role || '').toLowerCase() !== 'admin'),
    [emps]
  );

  const topAssignees = useMemo(() => {
    const map = new Map(); // name -> { name, total, done }
    for (const t of filteredTasks) {
      const name = t.assigneeDisplay || '—';
      const curr = map.get(name) || { name, total: 0, done: 0 };
      curr.total += 1;
      if (t._normStatus === 'done') curr.done += 1;
      map.set(name, curr);
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total).slice(0, 8);
  }, [filteredTasks]);

  // actions
  const refresh = () => {
    fetchEmps?.().catch(() => {});
    fetchLeaves?.().catch(() => {});
    fetchTasks?.().catch(() => {});
  };

  const exportLeavesCSV = () => {
    const rows = [
      ['ID', 'Nhân viên', 'Từ ngày', 'Đến ngày', 'Số ngày', 'Trạng thái', 'Người duyệt'],
      ...filteredLeaves.map(l => [
        l.id,
        l.employeeName || l.employeeId || '',
        fmtDate(l.startDate),
        fmtDate(l.endDate),
        l.days ?? '',
        l._viStatus,
        l.approver ?? '',
      ])
    ];
    downloadCSV(rows, 'leaves.csv');
  };

  const exportTasksCSV = () => {
    const rows = [
      ['ID', 'Tên', 'Người thực hiện', 'Trạng thái', 'Bắt đầu', 'Hạn chót'],
      ...filteredTasks.map(t => [
        t.id ?? '',
        t.name ?? '',
        t.assigneeDisplay ?? '',
        viTaskStatusLabel(t._normStatus),
        fmtDate(t.startDate),
        fmtDate(t.dueDate),
      ])
    ];
    downloadCSV(rows, 'tasks.csv');
  };

  const exportEmployeesCSV = () => {
    const rows = [
      ['ID', 'Họ tên', 'Email', 'SĐT', 'Phòng ban', 'Chức vụ', 'Trạng thái', 'Role'],
      ...staffOnly.map(e => [
        e.id, e.name, e.email, e.phone, e.department, e.position, e.status, e.role,
      ])
    ];
    downloadCSV(rows, 'employees.csv');
  };

  // UI nhỏ
  const TabBtn = ({ id, icon: Icon, text }) => (
    <button
      onClick={() => setTab(id)}
      className={`px-3 py-2 rounded-lg border text-sm flex items-center gap-2 ${
        tab === id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50'
      }`}
    >
      <Icon className="w-4 h-4" />
      {text}
    </button>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo</h1>
          <p className="text-gray-600">Tổng hợp công việc, đơn nghỉ và nhân sự</p>
        </div>
        <div className="flex items-center gap-2">
          <TabBtn id="overview" icon={ClipboardList} text="Tổng quan" />
          <TabBtn id="tasks" icon={CheckCircle} text="Công việc" />
          <TabBtn id="leaves" icon={Calendar} text="Ngày nghỉ" />
          <TabBtn id="employees" icon={Users} text="Nhân sự" />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Từ ngày</label>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded-lg"
              value={fromDate || ''}
              onChange={(e) => setFromDate(e.target.value || '')}
            />
            <div className="text-xs text-gray-400 mt-1">Để trống = không giới hạn</div>
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Đến ngày</label>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded-lg"
              value={toDate || ''}
              onChange={(e) => setToDate(e.target.value || '')}
            />
            <div className="text-xs text-gray-400 mt-1">Để trống = không giới hạn</div>
          </div>

          {tab === 'leaves' && (
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Trạng thái đơn nghỉ</label>
              <select
                className="w-full px-3 py-2 border rounded-lg"
                value={leaveStatus}
                onChange={(e) => setLeaveStatus(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option>Chờ duyệt</option>
                <option>Đã duyệt</option>
                <option>Từ chối</option>
                <option>Đã hủy</option>
              </select>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={refresh} className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50">
              <RefreshCw className="w-4 h-4 inline -mt-1" /> Làm mới
            </button>
            {tab === 'leaves' && (
              <button onClick={exportLeavesCSV} className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50">
                <Download className="w-4 h-4 inline -mt-1" /> Xuất CSV
              </button>
            )}
            {tab === 'tasks' && (
              <button onClick={exportTasksCSV} className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50">
                <Download className="w-4 h-4 inline -mt-1" /> Xuất CSV
              </button>
            )}
            {tab === 'employees' && (
              <button onClick={exportEmployeesCSV} className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50">
                <Download className="w-4 h-4 inline -mt-1" /> Xuất CSV
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content by tab */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} title="Nhân viên (không gồm admin)" value={staffOnly.length} />
            <StatCard icon={CheckCircle} title="Công việc (đang hiển thị)" value={taskCounts.total} />
            <StatCard icon={Calendar} title="Đơn nghỉ (đang hiển thị)" value={leaveCounts.total} />
            <StatCard icon={Clock} title="Đơn chờ duyệt" value={leaveCounts.pending} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tasks breakdown */}
            <div className="bg-white rounded-xl border p-5">
              <div className="font-semibold text-gray-800 mb-3">Công việc</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 rounded-lg border bg-blue-50">
                  <div className="text-sm text-gray-500">Mới</div>
                  <div className="text-2xl font-bold text-blue-700">{taskCounts.todo}</div>
                </div>
                <div className="p-4 rounded-lg border bg-yellow-50">
                  <div className="text-sm text-gray-500">Đang làm</div>
                  <div className="text-2xl font-bold text-yellow-700">{taskCounts.inprog}</div>
                </div>
                <div className="p-4 rounded-lg border bg-red-50">
                  <div className="text-sm text-gray-500">Quá hạn</div>
                  <div className="text-2xl font-bold text-red-700">{taskCounts.overdue}</div>
                </div>
                <div className="p-4 rounded-lg border bg-green-50">
                  <div className="text-sm text-gray-500">Hoàn thành</div>
                  <div className="text-2xl font-bold text-green-700">{taskCounts.done}</div>
                </div>
              </div>

              {/* Top assignees */}
              <div className="mt-5">
                <div className="text-sm text-gray-600 mb-2">Top người thực hiện theo số lượng công việc</div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-2">Người thực hiện</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-2">Tổng</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-2">Hoàn thành</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {topAssignees.map(r => (
                        <tr key={r.name} className="hover:bg-gray-50">
                          <td className="px-4 py-2">{r.name}</td>
                          <td className="px-4 py-2">{r.total}</td>
                          <td className="px-4 py-2">{r.done}</td>
                        </tr>
                      ))}
                      {topAssignees.length === 0 && (
                        <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500">Không có dữ liệu</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Leaves breakdown */}
            <div className="bg-white rounded-xl border p-5">
              <div className="font-semibold text-gray-800 mb-3">Đơn nghỉ</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 rounded-lg border bg-yellow-50">
                  <div className="text-sm text-gray-500">Chờ duyệt</div>
                  <div className="text-2xl font-bold text-yellow-700">{leaveCounts.pending}</div>
                </div>
                <div className="p-4 rounded-lg border bg-green-50">
                  <div className="text-sm text-gray-500">Đã duyệt</div>
                  <div className="text-2xl font-bold text-green-700">{leaveCounts.approved}</div>
                </div>
                <div className="p-4 rounded-lg border bg-red-50">
                  <div className="text-sm text-gray-500">Từ chối</div>
                  <div className="text-2xl font-bold text-red-700">{leaveCounts.rejected}</div>
                </div>
                <div className="p-4 rounded-lg border bg-gray-50">
                  <div className="text-sm text-gray-500">Đã hủy</div>
                  <div className="text-2xl font-bold text-gray-700">{leaveCounts.cancelled}</div>
                </div>
              </div>

              {/* Recent leaves */}
              <div className="mt-5">
                <div className="text-sm text-gray-600 mb-2">Đơn gần đây (theo bộ lọc thời gian hiện tại)</div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-2">Nhân viên</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-2">Thời gian</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-2">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredLeaves.slice(0, 8).map(l => (
                        <tr key={l.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2">{l.employeeName || `ID ${l.employeeId}`}</td>
                          <td className="px-4 py-2">{fmtDate(l.startDate)} → {fmtDate(l.endDate)}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusPillClass(l._viStatus)}`}>
                              {l._viStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {filteredLeaves.length === 0 && (
                        <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500">Không có dữ liệu</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {tab === 'tasks' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard icon={ClipboardList} title="Tổng công việc" value={taskCounts.total} />
            <StatCard icon={Clock} title="Đang thực hiện" value={taskCounts.inprog} />
            <StatCard icon={AlertTriangle} title="Quá hạn" value={taskCounts.overdue} />
            <StatCard icon={CheckCircle} title="Hoàn thành" value={taskCounts.done} />
          </div>

          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-5 py-4 border-b font-semibold text-gray-800">Danh sách công việc</div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Tên</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Người thực hiện</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Trạng thái</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Bắt đầu</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Hạn chót</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredTasks.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">{t.name}</td>
                      <td className="px-5 py-3">{t.assigneeDisplay}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${taskPillClass(t._normStatus)}`}>
                          {viTaskStatusLabel(t._normStatus)}
                        </span>
                      </td>
                      <td className="px-5 py-3">{fmtDate(t.startDate)}</td>
                      <td className="px-5 py-3">{fmtDate(t.dueDate)}</td>
                    </tr>
                  ))}
                  {filteredTasks.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-500">Không có dữ liệu</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={exportTasksCSV} className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50">
              <Download className="w-4 h-4 inline -mt-1" /> Xuất CSV
            </button>
          </div>
        </div>
      )}

      {tab === 'leaves' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <StatCard icon={Calendar} title="Tổng đơn nghỉ" value={leaveCounts.total} />
            <StatCard icon={Clock} title="Chờ duyệt" value={leaveCounts.pending} />
            <StatCard icon={CheckCircle} title="Đã duyệt" value={leaveCounts.approved} />
            <StatCard icon={AlertTriangle} title="Từ chối" value={leaveCounts.rejected} />
            <StatCard icon={Users} title="Đã hủy" value={leaveCounts.cancelled} />
          </div>

          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-5 py-4 border-b font-semibold text-gray-800">Danh sách đơn nghỉ</div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Nhân viên</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Thời gian</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Số ngày</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Trạng thái</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Người duyệt</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredLeaves.map(l => (
                    <tr key={l.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <div className="font-medium text-gray-900">{l.employeeName || `ID ${l.employeeId}`}</div>
                        <div className="text-xs text-gray-500">ID: {l.employeeId}</div>
                      </td>
                      <td className="px-5 py-3">{fmtDate(l.startDate)} → {fmtDate(l.endDate)}</td>
                      <td className="px-5 py-3">{l.days ?? '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusPillClass(l._viStatus)}`}>
                          {l._viStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3">{l.approver ?? '—'}</td>
                    </tr>
                  ))}
                  {filteredLeaves.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-500">Không có dữ liệu</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={exportLeavesCSV} className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50">
              <Download className="w-4 h-4 inline -mt-1" /> Xuất CSV
            </button>
          </div>
        </div>
      )}

      {tab === 'employees' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard icon={Users} title="Nhân viên (không gồm admin)" value={staffOnly.length} />
            <StatCard icon={CheckCircle} title="Công việc (đang hiển thị)" value={filteredTasks.length} />
            <StatCard icon={Calendar} title="Đơn nghỉ (đang hiển thị)" value={filteredLeaves.length} />
            <StatCard icon={Clock} title="Đơn chờ duyệt" value={leaveCounts.pending} />
          </div>

          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-5 py-4 border-b font-semibold text-gray-800">Danh sách nhân viên</div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Nhân viên</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Phòng ban</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Chức vụ</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {staffOnly.map(e => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <div className="font-medium text-gray-900">{e.name}</div>
                        <div className="text-xs text-gray-500">{e.email}</div>
                      </td>
                      <td className="px-5 py-3">{e.department || 'Kế toán'}</td>
                      <td className="px-5 py-3">{e.position || '—'}</td>
                      <td className="px-5 py-3">{e.status || 'Đang làm việc'}</td>
                    </tr>
                  ))}
                  {staffOnly.length === 0 && (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-500">Không có dữ liệu</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={exportEmployeesCSV} className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50">
              <Download className="w-4 h-4 inline -mt-1" /> Xuất CSV
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportPage;
