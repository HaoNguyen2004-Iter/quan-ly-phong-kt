import React, { useState } from 'react';
import { Settings, User, Bell, Shield, Database, Palette, Globe, Save, RefreshCw, Eye, EyeOff } from 'lucide-react';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [showPassword, setShowPassword] = useState(false);

  // State cho các cài đặt
  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'Công ty Kế toán ABC',
    companyAddress: '123 Đường ABC, Quận 1, TP.HCM',
    companyPhone: '0123456789',
    companyEmail: 'contact@company.com',
    timezone: 'Asia/Ho_Chi_Minh',
    language: 'vi',
    dateFormat: 'dd/mm/yyyy'
  });

  const [userSettings, setUserSettings] = useState({
    fullName: 'Nguyễn Văn Admin',
    email: 'admin@company.com',
    phone: '0987654321',
    position: 'Quản trị viên',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    taskReminders: true,
    leaveRequests: true,
    systemUpdates: false,
    weeklyReports: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 5
  });

  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: 365,
    maintenanceMode: false
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    sidebarCollapsed: false,
    compactMode: false
  });

  const tabs = [
    { id: 'general', name: 'Tổng quan', icon: Settings },
    { id: 'user', name: 'Tài khoản', icon: User },
    { id: 'notifications', name: 'Thông báo', icon: Bell },
    { id: 'security', name: 'Bảo mật', icon: Shield },
    { id: 'system', name: 'Hệ thống', icon: Database },
    { id: 'appearance', name: 'Giao diện', icon: Palette }
  ];

  const handleSave = (section) => {
    console.log(`Saving ${section} settings`);
    alert(`Cài đặt ${section} đã được lưu thành công!`);
  };

  const handleReset = (section) => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục cài đặt mặc định?')) {
      console.log(`Resetting ${section} settings`);
      alert(`Cài đặt ${section} đã được khôi phục về mặc định!`);
    }
  };

  const SettingCard = ({ title, children, onSave, onReset }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="flex gap-2">
          {onReset && (
            <button
              onClick={onReset}
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-200 transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Khôi phục
            </button>
          )}
          {onSave && (
            <button
              onClick={onSave}
              className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <Save className="w-3 h-3" />
              Lưu
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  );

  const InputField = ({ label, type = 'text', value, onChange, placeholder, required = false }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  const SelectField = ({ label, value, onChange, options, required = false }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  const ToggleField = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>
  );

  const renderGeneralSettings = () => (
    <SettingCard
      title="Cài đặt tổng quan"
      onSave={() => handleSave('general')}
      onReset={() => handleReset('general')}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Tên công ty"
          value={generalSettings.companyName}
          onChange={(e) => setGeneralSettings({ ...generalSettings, companyName: e.target.value })}
          required
        />
        <InputField
          label="Số điện thoại"
          value={generalSettings.companyPhone}
          onChange={(e) => setGeneralSettings({ ...generalSettings, companyPhone: e.target.value })}
        />
        <div className="md:col-span-2">
          <InputField
            label="Địa chỉ công ty"
            value={generalSettings.companyAddress}
            onChange={(e) => setGeneralSettings({ ...generalSettings, companyAddress: e.target.value })}
          />
        </div>
        <InputField
          label="Email công ty"
          type="email"
          value={generalSettings.companyEmail}
          onChange={(e) => setGeneralSettings({ ...generalSettings, companyEmail: e.target.value })}
        />
        <SelectField
          label="Múi giờ"
          value={generalSettings.timezone}
          onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
          options={[
            { value: 'Asia/Ho_Chi_Minh', label: 'Việt Nam (UTC+7)' },
            { value: 'Asia/Bangkok', label: 'Bangkok (UTC+7)' },
            { value: 'Asia/Singapore', label: 'Singapore (UTC+8)' }
          ]}
        />
        <SelectField
          label="Ngôn ngữ"
          value={generalSettings.language}
          onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
          options={[
            { value: 'vi', label: 'Tiếng Việt' },
            { value: 'en', label: 'English' }
          ]}
        />
        <SelectField
          label="Định dạng ngày"
          value={generalSettings.dateFormat}
          onChange={(e) => setGeneralSettings({ ...generalSettings, dateFormat: e.target.value })}
          options={[
            { value: 'dd/mm/yyyy', label: 'DD/MM/YYYY' },
            { value: 'mm/dd/yyyy', label: 'MM/DD/YYYY' },
            { value: 'yyyy-mm-dd', label: 'YYYY-MM-DD' }
          ]}
        />
      </div>
    </SettingCard>
  );

  const renderUserSettings = () => (
    <div className="space-y-6">
      <SettingCard
        title="Thông tin cá nhân"
        onSave={() => handleSave('user')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Họ và tên"
            value={userSettings.fullName}
            onChange={(e) => setUserSettings({ ...userSettings, fullName: e.target.value })}
            required
          />
          <InputField
            label="Email"
            type="email"
            value={userSettings.email}
            onChange={(e) => setUserSettings({ ...userSettings, email: e.target.value })}
            required
          />
          <InputField
            label="Số điện thoại"
            value={userSettings.phone}
            onChange={(e) => setUserSettings({ ...userSettings, phone: e.target.value })}
          />
          <InputField
            label="Chức vụ"
            value={userSettings.position}
            onChange={(e) => setUserSettings({ ...userSettings, position: e.target.value })}
          />
        </div>
      </SettingCard>

      <SettingCard
        title="Đổi mật khẩu"
        onSave={() => handleSave('password')}
      >
        <div className="space-y-4">
          <div className="relative">
            <InputField
              label="Mật khẩu hiện tại"
              type={showPassword ? 'text' : 'password'}
              value={userSettings.currentPassword}
              onChange={(e) => setUserSettings({ ...userSettings, currentPassword: e.target.value })}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <InputField
            label="Mật khẩu mới"
            type="password"
            value={userSettings.newPassword}
            onChange={(e) => setUserSettings({ ...userSettings, newPassword: e.target.value })}
            required
          />
          <InputField
            label="Xác nhận mật khẩu mới"
            type="password"
            value={userSettings.confirmPassword}
            onChange={(e) => setUserSettings({ ...userSettings, confirmPassword: e.target.value })}
            required
          />
        </div>
      </SettingCard>
    </div>
  );

  const renderNotificationSettings = () => (
    <SettingCard
      title="Cài đặt thông báo"
      onSave={() => handleSave('notifications')}
    >
      <div className="space-y-1">
        <ToggleField
          label="Thông báo email"
          description="Nhận thông báo qua email"
          checked={notificationSettings.emailNotifications}
          onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
        />
        <ToggleField
          label="Nhắc nhở công việc"
          description="Nhận thông báo về deadline công việc"
          checked={notificationSettings.taskReminders}
          onChange={(e) => setNotificationSettings({ ...notificationSettings, taskReminders: e.target.checked })}
        />
        <ToggleField
          label="Đơn xin nghỉ"
          description="Thông báo về đơn xin nghỉ mới"
          checked={notificationSettings.leaveRequests}
          onChange={(e) => setNotificationSettings({ ...notificationSettings, leaveRequests: e.target.checked })}
        />
        <ToggleField
          label="Cập nhật hệ thống"
          description="Thông báo về các bản cập nhật"
          checked={notificationSettings.systemUpdates}
          onChange={(e) => setNotificationSettings({ ...notificationSettings, systemUpdates: e.target.checked })}
        />
        <ToggleField
          label="Báo cáo hàng tuần"
          description="Nhận báo cáo tổng kết hàng tuần"
          checked={notificationSettings.weeklyReports}
          onChange={(e) => setNotificationSettings({ ...notificationSettings, weeklyReports: e.target.checked })}
        />
      </div>
    </SettingCard>
  );

  const renderSecuritySettings = () => (
    <SettingCard
      title="Cài đặt bảo mật"
      onSave={() => handleSave('security')}
    >
      <div className="space-y-4">
        <ToggleField
          label="Xác thực hai yếu tố"
          description="Tăng cường bảo mật với xác thực 2FA"
          checked={securitySettings.twoFactorAuth}
          onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorAuth: e.target.checked })}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <InputField
            label="Thời gian hết phiên (phút)"
            type="number"
            value={securitySettings.sessionTimeout}
            onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
          />
          <InputField
            label="Chu kỳ đổi mật khẩu (ngày)"
            type="number"
            value={securitySettings.passwordExpiry}
            onChange={(e) => setSecuritySettings({ ...securitySettings, passwordExpiry: parseInt(e.target.value) })}
          />
          <InputField
            label="Số lần đăng nhập sai tối đa"
            type="number"
            value={securitySettings.loginAttempts}
            onChange={(e) => setSecuritySettings({ ...securitySettings, loginAttempts: parseInt(e.target.value) })}
          />
        </div>
      </div>
    </SettingCard>
  );

  const renderSystemSettings = () => (
    <SettingCard
      title="Cài đặt hệ thống"
      onSave={() => handleSave('system')}
    >
      <div className="space-y-4">
        <ToggleField
          label="Sao lưu tự động"
          description="Tự động sao lưu dữ liệu hệ thống"
          checked={systemSettings.autoBackup}
          onChange={(e) => setSystemSettings({ ...systemSettings, autoBackup: e.target.checked })}
        />

        <ToggleField
          label="Chế độ bảo trì"
          description="Kích hoạt chế độ bảo trì hệ thống"
          checked={systemSettings.maintenanceMode}
          onChange={(e) => setSystemSettings({ ...systemSettings, maintenanceMode: e.target.checked })}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <SelectField
            label="Tần suất sao lưu"
            value={systemSettings.backupFrequency}
            onChange={(e) => setSystemSettings({ ...systemSettings, backupFrequency: e.target.value })}
            options={[
              { value: 'daily', label: 'Hàng ngày' },
              { value: 'weekly', label: 'Hàng tuần' },
              { value: 'monthly', label: 'Hàng tháng' }
            ]}
          />
          <InputField
            label="Thời gian lưu trữ dữ liệu (ngày)"
            type="number"
            value={systemSettings.dataRetention}
            onChange={(e) => setSystemSettings({ ...systemSettings, dataRetention: parseInt(e.target.value) })}
          />
        </div>
      </div>
    </SettingCard>
  );

  const renderAppearanceSettings = () => (
    <SettingCard
      title="Cài đặt giao diện"
      onSave={() => handleSave('appearance')}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Chủ đề"
            value={appearanceSettings.theme}
            onChange={(e) => setAppearanceSettings({ ...appearanceSettings, theme: e.target.value })}
            options={[
              { value: 'light', label: 'Sáng' },
              { value: 'dark', label: 'Tối' },
            ]}
          />
        </div>

        <div className="space-y-1 pt-4">
          <ToggleField
            label="Thu gọn sidebar"
            description="Hiển thị sidebar ở chế độ thu gọn"
            checked={appearanceSettings.sidebarCollapsed}
            onChange={(e) => setAppearanceSettings({ ...appearanceSettings, sidebarCollapsed: e.target.checked })}
          />
          <ToggleField
            label="Chế độ compact"
            description="Giảm khoảng cách giữa các phần tử"
            checked={appearanceSettings.compactMode}
            onChange={(e) => setAppearanceSettings({ ...appearanceSettings, compactMode: e.target.checked })}
          />
        </div>
      </div>
    </SettingCard>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'user':
        return renderUserSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      case 'system':
        return renderSystemSettings();
      case 'appearance':
        return renderAppearanceSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Cài đặt</h1>
        <p className="text-gray-600 mt-1">Quản lý cài đặt hệ thống và tài khoản</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

