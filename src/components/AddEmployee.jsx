import React, { useState } from 'react';
import { ArrowLeft, Save, Shield } from 'lucide-react';

// Chỉ 2 vai trò như yêu cầu
const ROLES = [
  { value: 'manager', label: 'Quản lý' },
  { value: 'staff', label: 'Nhân viên' },
];

// Chức vụ cho chọn (có thể mở rộng thêm)
const POSITIONS = [
  'Kế toán viên',
  'Kế toán tổng hợp',
  'Kế toán trưởng',
  'Thủ quỹ',
  'Kiểm soát nội bộ',
];

const AddEmployee = ({ onBack, onSave }) => {
  // Form state (bỏ username, department ẩn và mặc định = "Kế toán")
  const [form, setForm] = useState({
    // Thông tin cá nhân/công việc
    name: '',
    email: '',
    phone: '',
    address: '',
    birthDate: '',
    position: POSITIONS[0], // mặc định chọn chức vụ đầu tiên
    // department bị ẩn nhưng payload sẽ gửi "Kế toán"
    joinDate: '',
    status: 'Đang làm việc',
    avatar: '',
    // Tài khoản đăng nhập (bỏ username)
    account: {
      password: '',
      role: 'staff',  // 'manager' | 'staff'
      active: true,
    },
  });

  const [errors, setErrors] = useState({});

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const updateAcc = (k, v) =>
    setForm(prev => ({ ...prev, account: { ...prev.account, [k]: v } }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Bắt buộc';
    if (!form.email.trim()) e.email = 'Bắt buộc';
    if (!form.account.password.trim()) e.password = 'Bắt buộc';
    if (form.account.password && form.account.password.length < 6) e.password = '≥ 6 ký tự';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    // department mặc định “Kế toán” và KHÔNG hiển thị trên form
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone || null,
      address: form.address || null,
      birthDate: form.birthDate || null,  // input date -> "YYYY-MM-DD"
      joinDate: form.joinDate || null,    // input date -> "YYYY-MM-DD"
      position: form.position || null,    // chọn từ POSITIONS
      department: 'Kế toán',              // cố định theo yêu cầu
      status: form.status,                // 'Đang làm việc' | 'Tạm nghỉ'
      account: {
        role: form.account.role,          // 'manager' | 'staff'
        password: form.account.password,  // bắt buộc
        active: !!form.account.active,
      },
    };
    onSave && onSave(payload);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-3 py-1 rounded-lg border hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 inline mr-1" />
            Quay lại
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Thêm nhân viên</h1>
        </div>
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 hover:bg-blue-700"
        >
          <Save className="w-4 h-4" /> Lưu
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Thông tin cá nhân */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin cá nhân</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Họ và tên *</label>
              <input
                value={form.name}
                onChange={e => update('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.name ? 'border-red-400 focus:ring-red-300' : 'focus:ring-blue-500'}`}
                placeholder="VD: Nguyễn Văn A"
              />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.email ? 'border-red-400 focus:ring-red-300' : 'focus:ring-blue-500'}`}
                placeholder="name@company.com"
              />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Số điện thoại</label>
              <input
                value={form.phone}
                onChange={e => update('phone', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0123 456 789"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Ngày sinh</label>
              <input
                type="date"
                value={form.birthDate}
                onChange={e => update('birthDate', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700 mb-1">Địa chỉ</label>
              <input
                value={form.address}
                onChange={e => update('address', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Số nhà, đường, quận/huyện, tỉnh/thành"
              />
            </div>
          </div>
        </div>

        {/* Thông tin công việc */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin công việc</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phòng ban: ẩn, mặc định “Kế toán” */}
            {/* <input type="hidden" value="Kế toán" /> */}

            <div>
              <label className="block text-sm text-gray-700 mb-1">Chức vụ</label>
              <select
                value={form.position}
                onChange={e => update('position', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Ngày tham gia</label>
              <input
                type="date"
                value={form.joinDate}
                onChange={e => update('joinDate', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Trạng thái</label>
              <select
                value={form.status}
                onChange={e => update('status', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Đang làm việc</option>
                <option>Tạm nghỉ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tài khoản đăng nhập (bỏ username, chỉ còn password + role) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-800">Tài khoản đăng nhập</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm text-gray-700 mb-1">Mật khẩu *</label>
              <input
                type="password"
                value={form.account.password}
                onChange={e => updateAcc('password', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.password ? 'border-red-400 focus:ring-red-300' : 'focus:ring-blue-500'}`}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm text-gray-700 mb-1">Vai trò</label>
              <select
                value={form.account.role}
                onChange={e => updateAcc('role', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            <div className="md:col-span-1 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Kích hoạt tài khoản</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.account.active}
                  onChange={e => updateAcc('active', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600
                  after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                  after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5
                  after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex justify-end gap-2 mt-6">
        <button onClick={onBack} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Huỷ</button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Lưu
        </button>
      </div>
    </div>
  );
};

export default AddEmployee;
