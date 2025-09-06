import React, { useState } from 'react';

const EditEmployee = ({ employee, onSave, onCancel }) => {
  const [form, setForm] = useState({
    id: employee?.id ?? null,
    name: employee?.name ?? '',
    email: employee?.email ?? '',
    phone: employee?.phone ?? '',
    address: employee?.address ?? '',
    birthDate: employee?.birthDate ?? '',
    position: employee?.position ?? '',
    department: employee?.department ?? '',
    joinDate: employee?.joinDate ?? '',
    status: employee?.status ?? 'Đang làm việc',
    avatar: employee?.avatar ?? '',
  });

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{form.id ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên'}</h3>
        <button onClick={onCancel} className="px-3 py-1 rounded-lg border hover:bg-gray-50">Đóng</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="text-sm text-gray-700">Họ tên</label>
          <input className="w-full border rounded-lg px-3 py-2" value={form.name} onChange={e=>update('name', e.target.value)} />
        </div>
        <div><label className="text-sm text-gray-700">Email</label>
          <input className="w-full border rounded-lg px-3 py-2" value={form.email} onChange={e=>update('email', e.target.value)} />
        </div>
        <div><label className="text-sm text-gray-700">SĐT</label>
          <input className="w-full border rounded-lg px-3 py-2" value={form.phone} onChange={e=>update('phone', e.target.value)} />
        </div>
        <div><label className="text-sm text-gray-700">Phòng ban</label>
          <input className="w-full border rounded-lg px-3 py-2" value={form.department} onChange={e=>update('department', e.target.value)} />
        </div>
        <div><label className="text-sm text-gray-700">Chức vụ</label>
          <input className="w-full border rounded-lg px-3 py-2" value={form.position} onChange={e=>update('position', e.target.value)} />
        </div>
        <div><label className="text-sm text-gray-700">Ngày tham gia</label>
          <input type="date" className="w-full border rounded-lg px-3 py-2" value={form.joinDate} onChange={e=>update('joinDate', e.target.value)} />
        </div>
        <div><label className="text-sm text-gray-700">Ngày sinh</label>
          <input type="date" className="w-full border rounded-lg px-3 py-2" value={form.birthDate} onChange={e=>update('birthDate', e.target.value)} />
        </div>
        <div><label className="text-sm text-gray-700">Trạng thái</label>
          <select className="w-full border rounded-lg px-3 py-2" value={form.status} onChange={e=>update('status', e.target.value)}>
            <option>Đang làm việc</option>
            <option>Tạm nghỉ</option>
          </select>
        </div>
        <div className="md:col-span-2"><label className="text-sm text-gray-700">Địa chỉ</label>
          <input className="w-full border rounded-lg px-3 py-2" value={form.address} onChange={e=>update('address', e.target.value)} />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onCancel} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Huỷ</button>
        <button onClick={()=>onSave(form)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Lưu</button>
      </div>
    </div>
  );
};

export default EditEmployee;
