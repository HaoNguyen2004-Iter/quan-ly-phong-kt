import React from 'react';
import { Home, Users, Briefcase, FileText, Calendar, Settings, LogOut, Settings as SettingsIcon } from 'lucide-react';
import logo from '../assets/image/Logo.png';


const iconMap = {
  dashboard: Home,
  employees: Users,
  tasks: Briefcase,
  reports: FileText,
  leave: Calendar,
  settings: Settings,
  'emp-dashboard': Home,
  'emp-tasks': Briefcase,
  'emp-leave': Calendar,
  'emp-profile': Users,
  'emp-news': FileText,
  'emp-settings': SettingsIcon,
};

// ➜ THÊM logoSrc vào props (nếu App truyền xuống). Nếu không truyền, sẽ fallback về `logo`.
const Sidebar = ({ activeItem, onItemClick, onLogout, items, logoSrc }) => {
  const fallback = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'employees', label: 'Nhân viên' },
    { id: 'tasks', label: 'Công việc' },
    { id: 'reports', label: 'Báo cáo' },
    { id: 'leave', label: 'Quản lý ngày nghỉ' },
    { id: 'settings', label: 'Cài đặt' },
  ];

  const menuItems = (items && items.length ? items : fallback).map(m => ({
    ...m,
    icon: iconMap[m.id] || Home
  }));

  return (
    <div className="bg-gradient-to-b from-slate-700 to-slate-600 w-72 min-h-screen p-6 flex flex-col gap-6 text-gray-100">
      <div className="flex items-center gap-3">
        <img
          src={logoSrc ?? logo}  /* ưu tiên logoSrc nếu App truyền xuống, không thì dùng import */
          alt="Logo"
          className="w-10 h-10 object-contain rounded-lg bg-white/10"
        />
        <div>
          <div className="font-semibold">Kế Toán</div>
          <div className="text-xs text-gray-300">Quản trị nội bộ</div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                activeItem === item.id ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => onItemClick(item.id)}
            >
              <Icon className="w-5 h-5" />
              <div className="text-sm font-medium">{item.label}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto">
        <div
          className="flex items-center justify-center p-3 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
          onClick={onLogout}
          title="Đăng xuất"
        >
          <LogOut className="w-5 h-5 text-gray-300" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
