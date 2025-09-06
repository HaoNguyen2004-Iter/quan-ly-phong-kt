import React, { useState } from 'react';
import { Bell, LogOut } from 'lucide-react';


const Header = ({ user, onLogout, notifications = [] }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  return (
    <div className="bg-white p-6 border-b border-gray-200">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <div className="text-2xl font-bold text-gray-800">Dashboard Tổng Quan</div>
          <div className="text-gray-600">Chào mừng bạn quay trở lại! Đây là tổng quan về hoạt động của phòng ban.</div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notification */}
          <div className="relative">
            <button
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setShowNotifications((v) => !v)}
              aria-label="Thông báo"
              title="Thông báo"
            >
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-red-500 text-white">
                {notifications?.length ?? 0}
              </span>
            </button>

            {/* Dropdown panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-lg z-20">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <div className="font-semibold text-gray-900">Thông báo</div>
                  <button
                    className="text-sm text-blue-600 hover:underline"
                    onClick={() => setShowNotifications(false)}
                  >
                    Đóng
                  </button>
                </div>
                <div className="max-h-80 overflow-auto divide-y divide-gray-100">
                  {(notifications?.length ? notifications : [
                    { id: 1, type: 'info', text: 'Hệ thống sẽ bảo trì 22:00–23:00 tối nay', time: '5 phút trước' },
                    { id: 2, type: 'success', text: 'Task #1234 đã được duyệt', time: '1 giờ trước' },
                    { id: 3, type: 'warning', text: 'Nhân viên A còn 2 task quá hạn', time: 'Hôm qua' },
                  ]).map((n) => (
                    <div key={n.id} className="p-3 hover:bg-gray-50">
                      <div className="text-sm text-gray-900">{n.text}</div>
                      <div className="text-xs text-gray-500 mt-1">{n.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-semibold text-gray-800">{user?.name || 'Admin User'}</div>
              <div className="text-xs text-gray-600">{user?.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}</div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors ml-2"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;

