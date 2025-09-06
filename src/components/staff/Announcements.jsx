import React from 'react';

const Announcements = () => {
  const data = [
    { id: 1, title: 'Cập nhật quy định nghỉ phép', time: 'Hôm nay 09:00' },
    { id: 2, title: 'Lịch họp tuần tới', time: 'Hôm nay 08:30' },
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Thông báo</h2>
      <div className="space-y-3">
        {data.map(n => (
          <div key={n.id} className="p-4 bg-white border rounded-xl shadow-sm">
            <div className="font-medium">{n.title}</div>
            <div className="text-xs text-gray-500">{n.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;
