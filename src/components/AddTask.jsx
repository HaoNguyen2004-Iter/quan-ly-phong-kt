import React, { useState } from 'react';
import { ArrowLeft, Save, X, FileText, User, Calendar, AlertCircle, Clock, Tag } from 'lucide-react';

const AddTask = ({ onBack, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    assignee: '',
    priority: 'Trung bình',
    status: 'Mới',
    dueDate: '',
    estimatedHours: '',
    category: '',
    tags: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Tên công việc là bắt buộc';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả công việc là bắt buộc';
    }
    
    if (!formData.assignee.trim()) {
      newErrors.assignee = 'Người thực hiện là bắt buộc';
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Thời hạn hoàn thành là bắt buộc';
    } else {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.dueDate = 'Thời hạn không thể là ngày trong quá khứ';
      }
    }
    
    if (formData.estimatedHours && (isNaN(formData.estimatedHours) || formData.estimatedHours <= 0)) {
      newErrors.estimatedHours = 'Số giờ ước tính phải là số dương';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Generate new task ID (in real app, this would be handled by backend)
      const newTask = {
        ...formData,
        id: Date.now(), // Simple ID generation for demo
        createdDate: new Date().toLocaleDateString('vi-VN'),
        avatar: formData.assignee.charAt(0).toUpperCase()
      };
      
      onSave(newTask);
      alert('Công việc đã được tạo thành công!');
      onBack();
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      description: '',
      assignee: '',
      priority: 'Trung bình',
      status: 'Mới',
      dueDate: '',
      estimatedHours: '',
      category: '',
      tags: ''
    });
    setErrors({});
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
            <h1 className="text-2xl font-bold text-gray-800">Tạo công việc mới</h1>
            <p className="text-gray-600">Nhập thông tin chi tiết của công việc mới</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={handleReset}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
            Đặt lại
          </button>
          <button 
            type="submit"
            form="task-form"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            Lưu công việc
          </button>
        </div>
      </div>

      {/* Form */}
      <form id="task-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin cơ bản</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Tên công việc *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập tên công việc"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Mô tả công việc *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Mô tả chi tiết về công việc cần thực hiện"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-2" />
                Danh mục công việc
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn danh mục</option>
                <option value="Báo cáo tài chính">Báo cáo tài chính</option>
                <option value="Kiểm toán">Kiểm toán</option>
                <option value="Thuế">Thuế</option>
                <option value="Sổ sách kế toán">Sổ sách kế toán</option>
                <option value="Đối soát">Đối soát</option>
                <option value="Hệ thống">Hệ thống</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>
        </div>

        {/* Assignment & Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Phân công & Thời gian</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Người thực hiện *
              </label>
              <select
                name="assignee"
                value={formData.assignee}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.assignee ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Chọn người thực hiện</option>
                <option value="Nguyễn Văn A">Nguyễn Văn A</option>
                <option value="Trần Thị B">Trần Thị B</option>
                <option value="Lê Văn C">Lê Văn C</option>
                <option value="Phạm Thị D">Phạm Thị D</option>
                <option value="Hoàng Văn E">Hoàng Văn E</option>
              </select>
              {errors.assignee && <p className="text-red-500 text-sm mt-1">{errors.assignee}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Thời hạn hoàn thành *
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.dueDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <AlertCircle className="w-4 h-4 inline mr-2" />
                Độ ưu tiên
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Thấp">Thấp</option>
                <option value="Trung bình">Trung bình</option>
                <option value="Cao">Cao</option>
                <option value="Khẩn cấp">Khẩn cấp</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Số giờ ước tính
              </label>
              <input
                type="number"
                name="estimatedHours"
                value={formData.estimatedHours}
                onChange={handleInputChange}
                min="0"
                step="0.5"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.estimatedHours ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ví dụ: 8"
              />
              {errors.estimatedHours && <p className="text-red-500 text-sm mt-1">{errors.estimatedHours}</p>}
            </div>
          </div>
        </div>

        {/* Status & Tags */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Trạng thái & Nhãn</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái ban đầu
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Mới">Mới</option>
                <option value="Đang thực hiện">Đang thực hiện</option>
                <option value="Tạm dừng">Tạm dừng</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-2" />
                Nhãn (Tags)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ví dụ: urgent, quarterly, review (phân cách bằng dấu phẩy)"
              />
              <p className="text-xs text-gray-500 mt-1">Phân cách các nhãn bằng dấu phẩy</p>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            <strong>Lưu ý:</strong> Các trường có dấu (*) là bắt buộc. Sau khi tạo công việc, bạn có thể chỉnh sửa thông tin hoặc cập nhật tiến độ bất cứ lúc nào.
          </p>
        </div>
      </form>
    </div>
  );
};

export default AddTask;

