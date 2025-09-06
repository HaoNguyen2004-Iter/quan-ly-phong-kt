import React, { useEffect, useState } from "react";
import { getMySettings, updateMySettings } from "../../services/settings";

export default function StaffSettings() {
  const [loading, setLoading] = useState(true);
  const [s, setS] = useState(null);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const data = await getMySettings();
      setS(data);
    } catch {
      setErr("Không tải được cài đặt");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setS({ ...s, [name]: type === "checkbox" ? checked : value });
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      await updateMySettings(s);
      alert("Đã lưu cài đặt");
    } catch {
      alert("Lưu thất bại");
    }
  };

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!s) return null;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Cài đặt</h1>

      <form onSubmit={save} className="bg-white border rounded-xl p-4 grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Giao diện</label>
            <select name="appearanceTheme" value={s.appearanceTheme || "system"} onChange={onChange} className="border rounded px-3 py-2 w-full">
              <option value="system">Theo hệ thống</option>
              <option value="light">Sáng</option>
              <option value="dark">Tối</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Mật độ</label>
            <select name="appearanceDensity" value={s.appearanceDensity || "comfortable"} onChange={onChange} className="border rounded px-3 py-2 w-full">
              <option value="comfortable">Thoải mái</option>
              <option value="compact">Gọn</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Ngôn ngữ</label>
            <select name="language" value={s.language || "vi"} onChange={onChange} className="border rounded px-3 py-2 w-full">
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="notifyTaskAssigned" checked={!!s.notifyTaskAssigned} onChange={onChange} />
            <span>Nhận thông báo khi được giao việc</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="notifyTaskStatusChange" checked={!!s.notifyTaskStatusChange} onChange={onChange} />
            <span>Trạng thái thay đổi</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="notifyOverdueAlerts" checked={!!s.notifyOverdueAlerts} onChange={onChange} />
            <span>Cảnh báo quá hạn</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="notifyEmailReminders" checked={!!s.notifyEmailReminders} onChange={onChange} />
            <span>Gửi nhắc email</span>
          </label>
        </div>

        <div>
          <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Lưu</button>
        </div>
      </form>
    </div>
  );
}
