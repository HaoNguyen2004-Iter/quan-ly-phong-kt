// src/App.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TaskCard from './components/TaskCard';
import NotificationCard from './components/NotificationCard';

// ❌ Bỏ import leave services khỏi dashboard admin
// import { countLeaves, adminSearchLeaves, approveLeave, rejectLeave } from './services/leaves';

import EmployeePage from './components/EmployeePage';
import EmployeeDetail from './components/EmployeeDetail';
import AddEmployee from './components/AddEmployee';
import EditEmployee from './components/EditEmployee';

import TaskList from './components/TaskList';
import AddTask from './components/AddTask';
import TaskDetail from './components/TaskDetail';
import EditTask from './components/EditTask';

import ReportPage from './components/ReportPage';
import LeaveManagementPage from './components/LeaveManagementPage';
import SettingsPage from './components/SettingsPage';
import LoginPage from './components/LoginPage';
import EmployeeDashboard from './components/EmployeeDashboard';

// stores
import { useTasksStore } from './store/tasksStore';
import { useEmployeesStore } from './store/employeesStore';

// RBAC helpers
import { canAccess, firstItemForRole, visibleItemsFor, toRole } from './auth/roles';

// Staff pages
import MyTasks from './components/staff/MyTasks';
import MyLeave from './components/staff/MyLeave';
import MyProfile from './components/staff/MyProfile';
import Announcements from './components/staff/Announcements';
import StaffSettings from './components/staff/StaffSettings';

import { getUser, logout as doLogout } from './services/auth';

import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [activeItem, setActiveItem] = useState('dashboard');

  // Employees (UI state)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showEditEmployee, setShowEditEmployee] = useState(false);

  // Employees (store)
  const getEmp = useEmployeesStore(s => s.byId);
  const addEmp = useEmployeesStore(s => s.add);
  const updateEmp = useEmployeesStore(s => s.update);

  // Tasks (UI state)
  const [showAddTask, setShowAddTask] = useState(false);
  const [showEditTask, setShowEditTask] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // Tasks (store)
  const getTask = useTasksStore(s => s.byId);
  const addTask = useTasksStore(s => s.add);
  const updateTask = useTasksStore(s => s.update);

  // ===== Dashboard: dữ liệu từ store =====
  const allTasks = useTasksStore(s => s.items || []);
  const todoTasks = allTasks.filter(t => t.status === 'todo');
  const inProgressTasks = allTasks.filter(t => t.status === 'in-progress');
  const overdueTasks = allTasks.filter(t => t.status === 'overdue');
  const notifications = [{ id: 1, message: 'Chào mừng!' }];

  // === ROLE hiện tại (lowercase) ===
  const role = toRole(user?.account?.role || user?.role);

  // === Điều hướng menu: chặn item không có quyền ===
  const handleItemClick = (itemId) => {
    if (!canAccess(role, itemId)) return;
    setActiveItem(itemId);
    // reset UI state
    setSelectedEmployeeId(null);
    setShowAddEmployee(false);
    setShowEditEmployee(false);
    setShowAddTask(false);
    setShowEditTask(false);
    setSelectedTaskId(null);
  };

  // === Auth ===
  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    setActiveItem(firstItemForRole(userData?.account?.role || userData?.role));
  };

  useEffect(() => {
    const u = getUser();
    if (u) {
      setIsAuthenticated(true);
      setUser(u);
      setActiveItem(firstItemForRole(u.role));
    }
  }, []);

  const handleLogout = () => {
    doLogout();
    setIsAuthenticated(false);
    setUser(null);
    setActiveItem('dashboard');
  };

  // === Đánh dấu hoàn thành công việc (Admin xem TaskDetail) ===
  const handleCompleteTask = (id) => {
    updateTask({ id, status: 'done', completedAt: new Date().toISOString() });
  };

  // === Admin Dashboard: CHỈ công việc & thông báo (đã bỏ phần đơn nghỉ) ===
  const renderAdminDashboard = () => (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          <TaskCard type="todo" title="Công việc cần làm" autoFetch />
          <TaskCard type="in-progress" title="Đang thực hiện" autoFetch />
          <TaskCard type="overdue" title="Quá hạn" autoFetch />
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    // Nếu activeItem không hợp lệ với role, rơi về trang mặc định
    if (!canAccess(role, activeItem)) {
      return role === 'admin' ? renderAdminDashboard() : <EmployeeDashboard user={user} />;
    }

    if (role === 'admin') {
      switch (activeItem) {
        case 'dashboard':
          return renderAdminDashboard();

        case 'employees': {
          if (showAddEmployee) return (
            <AddEmployee
              onBack={() => { setShowAddEmployee(false); setSelectedEmployeeId(null); }}
              onSave={emp => { addEmp(emp); setShowAddEmployee(false); }}
            />
          );
          if (showEditEmployee) {
            const current = getEmp(selectedEmployeeId);
            return (
              <EditEmployee
                employee={current}
                onSave={(data) => { updateEmp(data); setShowEditEmployee(false); }}
                onCancel={() => setShowEditEmployee(false)}
              />
            );
          }
          if (selectedEmployeeId) {
            return (
              <EmployeeDetail
                employeeId={selectedEmployeeId}
                onBack={() => { setSelectedEmployeeId(null); setShowAddEmployee(false); setShowEditEmployee(false); }}
                onEdit={(id) => { setSelectedEmployeeId(id); setShowAddEmployee(false); setShowEditEmployee(true); }}
              />
            );
          }
          return (
            <EmployeePage
              onViewEmployee={(id) => { setSelectedEmployeeId(id); setShowAddEmployee(false); setShowEditEmployee(false); }}
              onAddEmployee={() => { setShowAddEmployee(true); setSelectedEmployeeId(null); setShowEditEmployee(false); }}
              onEditEmployee={(id) => { setSelectedEmployeeId(id); setShowAddEmployee(false); setShowEditEmployee(true); }}
            />
          );
        }

        case 'tasks': {
          if (showAddTask) return (
            <AddTask
              onBack={() => { setShowAddTask(false); setSelectedTaskId(null); }}
              onSave={(t) => { addTask(t); setShowAddTask(false); }}
            />
          );
          if (showEditTask) {
            const current = getTask(selectedTaskId);
            return (
              <EditTask
                task={current}
                onSave={(t) => { updateTask(t); setShowEditTask(false); }}
                onCancel={() => setShowEditTask(false)}
              />
            );
          }
          if (selectedTaskId) {
            return (
              <TaskDetail
                taskId={selectedTaskId}
                onBack={() => { setShowAddTask(false); setShowEditTask(false); setSelectedTaskId(null); }}
                onEdit={(id) => { setSelectedTaskId(id); setShowAddTask(false); setShowEditTask(true); }}
                onComplete={handleCompleteTask}
              />
            );
          }
          return (
            <TaskList
              onViewTask={(id) => { setSelectedTaskId(id); setShowAddTask(false); setShowEditTask(false); }}
              onAddTask={() => { setShowAddTask(true); setShowEditTask(false); setSelectedTaskId(null); }}
              onEditTask={(id) => { setSelectedTaskId(id); setShowAddTask(false); setShowEditTask(true); }}
            />
          );
        }

        case 'reports':
          return <ReportPage />;

        case 'leave':
          // Trang quản lý ngày nghỉ riêng, không trộn vào dashboard
          return <LeaveManagementPage />;

        case 'settings':
          return <SettingsPage />;

        default:
          return renderAdminDashboard();
      }
    }

    if (role === 'staff') {
      switch (activeItem) {
        case 'emp-dashboard':
          return <EmployeeDashboard user={user} />;
        case 'emp-tasks':
          return <MyTasks user={user} />;
        case 'emp-leave':
          return <MyLeave user={user} />;
        case 'emp-profile':
          return <MyProfile user={user} />;
        case 'emp-news':
          return <Announcements />;
        case 'emp-settings':
          return <StaffSettings user={user} />;
        default:
          return <EmployeeDashboard user={user} />;
      }
    }

    // Chưa login hoặc role lạ
    return <LoginPage onLogin={handleLogin} />;
  };

  // Menu theo quyền
  const visibleMenu = visibleItemsFor(role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {!isAuthenticated ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <div className="flex">
          <Sidebar
            activeItem={activeItem}
            onItemClick={handleItemClick}
            onLogout={handleLogout}
            items={visibleMenu}
          />
          <div className="flex-1 flex flex-col">
            <Header user={user} onLogout={handleLogout} />
            <div className="flex-1">{renderContent()}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
