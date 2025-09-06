import React, { useState, useMemo } from 'react';
import { ArrowLeft, Edit, Trash2, Phone, Mail, MapPin, Calendar, User, Briefcase } from 'lucide-react';
import { useEmployeesStore } from '../store/employeesStore';

const EmployeeDetail = ({ employeeId, onBack, onEdit }) => {
  const employee = useEmployeesStore(s => s.byId(employeeId));
  const remove = useEmployeesStore(s => s.remove);

  const [activeTab, setActiveTab] = useState('general');

  if (!employee) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <button onClick={onBack} className="mb-4 px-3 py-1 rounded-lg border hover:bg-gray-50">Quay lại</button>
        <p className="text-gray-600">Không tìm thấy nhân viên (id: {employeeId}).</p>
      </div>
    );
  }

  const formatDate = (d) => {
    if (!d) return '-';
    if (d.includes('-')) { // yyyy-mm-dd -> dd/mm/yyyy
      const [y,m,dd] = d.split('-');
      return `${dd}/${m}/${y}`;
    }
    return d;
  };

  const avatarText = employee.avatar || (employee.name ? employee.name.charAt(0).toUpperCase() : '?');

  const statusPill = (s) => {
    if (s === 'Đang làm việc') return 'bg-green-100 text-green-800';
    if (s === 'Tạm nghỉ') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const handleDelete = () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) return;
    remove(employee.id);
    onBack && onBack();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Chi tiết nhân viên</h1>
            <p className="text-gray-600">Thông tin chi tiết của nhân viên trong hệ thống</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onEdit && onEdit(employee.id)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Sửa thông tin
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Xóa nhân viên
          </button>
        </div>
      </div>

      {/* Employee Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 bg-blue-500 rounded-xl flex items-center justify-center text-white text-3xl font-bold">
            {avatarText}
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-800">{employee.name || '-'}</h2>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusPill(employee.status)}`}>
                {employee.status || '—'}
              </span>
            </div>
            <p className="text-lg text-blue-600 font-medium mb-1">{employee.position || '-'}</p>
            <p className="text-gray-600 mb-4">{employee.department || '-'}</p>

            {/* Quick Info */}
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span>ID: {employee.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Tham gia từ: {formatDate(employee.joinDate)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('general')}
              className={`border-b-2 py-2 px-1 text-sm font-medium ${
                activeTab === 'general'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Thông tin chung
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`border-b-2 py-2 px-1 text-sm font-medium ${
                activeTab === 'tasks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Công việc
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`border-b-2 py-2 px-1 text-sm font-medium ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Lịch sử
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin cá nhân</h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Họ và tên</p>
                  <p className="font-medium text-gray-800">{employee.name || '-'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-800">{employee.email || '-'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Số điện thoại</p>
                  <p className="font-medium text-gray-800">{employee.phone || '-'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Địa chỉ</p>
                  <p className="font-medium text-gray-800">{employee.address || '-'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Ngày sinh</p>
                  <p className="font-medium text-gray-800">{formatDate(employee.birthDate)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Work Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin công việc</h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Vị trí</p>
                  <p className="font-medium text-gray-800">{employee.position || '-'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Phòng ban</p>
                  <p className="font-medium text-gray-800">{employee.department || '-'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Ngày tham gia</p>
                  <p className="font-medium text-gray-800">{formatDate(employee.joinDate)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center">
                  <div className={`w-3 h-3 rounded-full ${
                    employee.status === 'Đang làm việc' ? 'bg-green-500' :
                    employee.status === 'Tạm nghỉ' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trạng thái</p>
                  <p className="font-medium text-gray-800">{employee.status || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600">Danh sách công việc của nhân viên sẽ hiển thị ở đây (TODO).</p>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600">Lịch sử thay đổi / hoạt động liên quan nhân viên (TODO).</p>
        </div>
      )}

      {/* Performance Chart Section */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Biểu đồ hiệu suất 6 tháng gần nhất</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">Biểu đồ hiệu suất sẽ được hiển thị ở đây</p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;
