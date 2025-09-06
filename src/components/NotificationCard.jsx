import React from 'react';
import { Bell, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const NotificationCard = ({ notifications }) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-600" />;
      case 'error':
        return <X className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="text-lg font-semibold text-gray-800">Thông báo gần đây</div>
        <div className="p-2 bg-gray-50 rounded-lg">
          <Bell className="w-5 h-5 text-gray-600" />
        </div>
      </div>

      {/* Notification List */}
      <div className="flex flex-col gap-3">
        {notifications.map((notification, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="p-1 bg-white rounded-full shadow-sm">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-800 font-medium">{notification.text}</div>
              <div className="text-xs text-gray-500 mt-1">{notification.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationCard;

