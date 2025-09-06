// src/components/LeaveManagementPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Search, Filter, Eye, Edit, Trash2, Check, X, Clock, FileText } from 'lucide-react';
import { useLeavesStore } from '../store/leavesStore';

const LeaveManagementPage = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { items, loading, error, fetchAll, approve, reject } = useLeavesStore();

  useEffect(() => {
    fetchAll().catch(() => {});
  }, [fetchAll]);

  const statusOptions = [
    { value: 'all', label: 'Tất cả' },
    { value: 'Chờ duyệt', label: 'Chờ duyệt' },
    { value: 'Đã duyệt', label: 'Đã duyệt' },
    { value: 'Từ chối', label: 'Từ chối' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Đã duyệt': return 'bg-green-100 text-green-800';
      case 'Chờ duyệt': return 'bg-yellow-100 text-yellow-800';
      case 'Từ chối':   return 'bg-red-100 text-red-800';
      default:          return 'bg-gray-100 text-gray-800';
    }
  };

  const getLeaveTypeColor = (type) => {
    switch (type) {
      case 'Nghỉ phép năm':  return 'bg-blue-100 text-blue-800';
      case 'Nghỉ ốm':        return 'bg-red-100 text-red-800';
      case 'Nghỉ việc riêng':return 'bg-purple-100 text-purple-800';
      case 'Nghỉ thai sản':  return 'bg-pink-100 text-pink-800';
      default:               return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return items.filter((r) => {
      const matchesSearch =
        !term ||
        r.employeeName?.toLowerCase().includes(term) ||
        String(r.employeeId || '').toLowerCase().includes(term);
      const matchesStatus = selectedStatus === 'all' || r.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [items, searchTerm, selectedStatus]);

  const counts = useMemo(() => ({
    total: items.length,
    pending: items.filter((r) => r.status === 'Chờ duyệt').length,
    approved: items.filter((r) => r.status === 'Đã duyệt').length,
    rejected: items.filter((r) => r.status === 'Từ chối').length,
  }), [items]);

  const handleApprove = async (id) => { try { await approve(id); } catch (e) { alert(e?.message || 'Duyệt thất bại'); } };
  const handleReject  = async (id) => { const note = prompt('Lý do từ chối (tuỳ chọn):') || ''; try { await reject(id, note); } catch (e) { alert(e?.message || 'Từ chối thất bại'); } };

  const handleView   = (id) => console.log('Viewing leave request:', id);
  const handleEdit   = (id) => console.log('Editing leave request:', id);
  const handleDelete = (id) => { console.log('Deleting leave request:', id); alert('Tính năng xoá: tuỳ BE'); };

  const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => (
    <div className={`p-6 rounded-xl border bg-${color}-50 border-${color}-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý ngày nghỉ</h1>
          <p className="text-gray-600 mt-1">Quản lý đơn xin nghỉ và lịch nghỉ của nhân viên</p>
        </div>
        {/* Không có nút Tạo đơn nghỉ mới theo yêu cầu */}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard title="Tổng đơn nghỉ" value={counts.total} icon={FileText} color="blue" />
        <StatCard title="Chờ duyệt" value={counts.pending} icon={Clock} color="yellow" />
        <StatCard title="Đã duyệt" value={counts.approved} icon={Check} color="green" />
        <StatCard title="Từ chối" value={counts.rejected} icon={X} color="red" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc mã nhân viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="sm:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[
                { value: 'all', label: 'Tất cả' },
                { value: 'Chờ duyệt', label: 'Chờ duyệt' },
                { value: 'Đã duyệt', label: 'Đã duyệt' },
                { value: 'Từ chối', label: 'Từ chối' },
              ].map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200">
            <Filter className="w-4 h-4" /> Bộ lọc
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Danh sách đơn xin nghỉ</h3>
        </div>

        {loading && <div className="text-center py-12 text-gray-500">Đang tải dữ liệu...</div>}
        {error && !loading && <div className="text-center py-12 text-red-600">{error}</div>}

        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhân viên</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại nghỉ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số ngày</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người duyệt</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                            {r.avatar}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{r.employeeName}</div>
                            <div className="text-sm text-gray-500">{r.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLeaveTypeColor(r.leaveType)}`}>
                          {r.leaveType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{r.startDate}</div>
                        <div className="text-gray-500">đến {r.endDate}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.days} ngày</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(r.status)}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.approver || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleView(r.id)} className="text-blue-600 hover:text-blue-900" title="Xem chi tiết">
                            <Eye className="w-4 h-4" />
                          </button>
                          {r.status === 'Chờ duyệt' && (
                            <>
                              <button onClick={() => handleApprove(r.id)} className="text-green-600 hover:text-green-900" title="Duyệt">
                                <Check className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleReject(r.id)} className="text-red-600 hover:text-red-900" title="Từ chối">
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button onClick={() => handleEdit(r.id)} className="text-yellow-600 hover:text-yellow-900" title="Chỉnh sửa">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:text-red-900" title="Xóa">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredRequests.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Không tìm thấy đơn xin nghỉ nào</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Calendar (placeholder) */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Lịch nghỉ tháng này</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Lịch nghỉ sẽ được hiển thị ở đây</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveManagementPage;
