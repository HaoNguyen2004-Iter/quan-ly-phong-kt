// src/components/staff/MyProfile.jsx
import React, { useEffect, useState } from "react";
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  Upload,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
} from "lucide-react";
import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
  uploadMyAvatar,
} from "../../services/profile";

export default function MyProfile() {
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState("");

  const [profile, setProfile] = useState(null);

  // form info
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [position, setPosition] = useState("");

  const [saving, setSaving] = useState(false);
  const [infoMsg, setInfoMsg] = useState("");

  // password
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState("");
  const [currPwd, setCurrPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // avatar
  const [upLoading, setUpLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    setLoadErr("");
    try {
      const p = await getMyProfile();
      setProfile(p);
      // seed form
      setFullName(p.fullName || "");
      setPhone(p.phone || "");
      setAddress(p.address || "");
      setBirthDate(p.birthDate || "");
      setPosition(p.position || "");
    } catch (e) {
      setLoadErr(e?.message || "Không tải được hồ sơ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const saveInfo = async (ev) => {
    ev.preventDefault();
    setSaving(true);
    setInfoMsg("");
    try {
      const updated = await updateMyProfile({
        fullName,
        phone,
        address,
        birthDate,
        position,
      });
      setProfile(updated);
      setInfoMsg("Đã lưu thông tin hồ sơ.");
    } catch (e) {
      setInfoMsg(e?.response?.data ?? e?.message ?? "Lưu thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const submitChangePassword = async (ev) => {
    ev.preventDefault();
    setPwdMsg("");
    if (!currPwd || !newPwd) {
      setPwdMsg("Vui lòng nhập mật khẩu hiện tại và mật khẩu mới.");
      return;
    }
    if (newPwd.length < 6) {
      setPwdMsg("Mật khẩu mới tối thiểu 6 ký tự.");
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdMsg("Xác nhận mật khẩu không khớp.");
      return;
    }
    setPwdSaving(true);
    try {
      await changeMyPassword(currPwd, newPwd);
      setPwdMsg("Đổi mật khẩu thành công.");
      setCurrPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch (e) {
      setPwdMsg(e?.response?.data ?? e?.message ?? "Đổi mật khẩu thất bại.");
    } finally {
      setPwdSaving(false);
    }
  };

  const onPickAvatar = async (ev) => {
    const f = ev.target.files?.[0];
    if (!f) return;
    setUpLoading(true);
    try {
      const updated = await uploadMyAvatar(f);
      setProfile(updated);
      setInfoMsg("Cập nhật ảnh đại diện thành công.");
    } catch (e) {
      setInfoMsg(e?.response?.data ?? e?.message ?? "Tải ảnh thất bại.");
    } finally {
      setUpLoading(false);
      ev.target.value = "";
    }
  };

  const Avatar = () => {
    const url = profile?.avatarUrl;
    const name = profile?.fullName || profile?.email || "U";
    const initial = (name || "U").trim().charAt(0).toUpperCase();
    return (
      <div className="flex flex-col items-center gap-3">
        {url ? (
          <img
            src={url}
            alt="avatar"
            className="w-24 h-24 rounded-full object-cover border"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold">
            {initial}
          </div>
        )}
        <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-50 cursor-pointer">
          <Upload className="w-4 h-4" />
          <span>{upLoading ? "Đang tải..." : "Đổi ảnh"}</span>
          <input
            type="file"
            accept="image/*"
            onChange={onPickAvatar}
            disabled={upLoading}
            className="hidden"
          />
        </label>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 text-gray-600">Đang tải hồ sơ của bạn...</div>
    );
  }
  if (loadErr) {
    return (
      <div className="p-6 text-red-600">{loadErr}</div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Hồ sơ cá nhân</h1>
          <p className="text-gray-600">Xem và cập nhật thông tin của bạn.</p>
        </div>
      </div>

      {/* Thông tin cơ bản */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-6">
          {/* Avatar */}
          <Avatar />

          {/* Form info */}
          <form onSubmit={saveInfo} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Họ tên */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Họ và tên
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: Nguyễn Văn A"
                  />
                </div>
              </div>

              {/* Email (readonly) */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={profile?.email || ""}
                    disabled
                    className="w-full pl-9 pr-3 py-2 border rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              </div>

              {/* Điện thoại */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Điện thoại
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0123 456 789"
                  />
                </div>
              </div>

              {/* Địa chỉ */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Địa chỉ
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Số nhà, đường, quận/huyện, tỉnh/thành"
                  />
                </div>
              </div>

              {/* Ngày sinh */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Ngày sinh
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={birthDate || ""}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Chức vụ */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Chức vụ
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhân viên kế toán"
                  />
                </div>
              </div>

              {/* Phòng ban (readonly: mặc định Kế toán) */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Phòng ban
                </label>
                <input
                  value={profile?.department || "Kế toán"}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              {/* Ngày vào (readonly nếu không cho sửa) */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Ngày tham gia
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={profile?.joinDate || ""}
                    disabled
                    className="w-full pl-9 pr-3 py-2 border rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              </div>

              {/* Vai trò (readonly) */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Vai trò
                </label>
                <div className="relative">
                  <Shield className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={
                      (profile?.role || "").toLowerCase() === "admin"
                        ? "Quản lý"
                        : "Nhân viên"
                    }
                    disabled
                    className="w-full pl-9 pr-3 py-2 border rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={refresh}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                disabled={saving}
              >
                Tải lại
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2 disabled:opacity-50"
                disabled={saving}
              >
                <Save className="w-4 h-4" />
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>

            {!!infoMsg && (
              <div className="text-sm text-gray-700">{infoMsg}</div>
            )}
          </form>
        </div>
      </div>

      {/* Bảo mật: đổi mật khẩu */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-800">
            Đổi mật khẩu
          </h3>
        </div>

        <form onSubmit={submitChangePassword} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Mật khẩu hiện tại
            </label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={currPwd}
                onChange={(e) => setCurrPwd(e.target.value)}
                className="w-full pr-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500"
                title={showPwd ? "Ẩn" : "Hiện"}
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showNewPwd ? "text" : "password"}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                className="w-full pr-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="≥ 6 ký tự"
              />
              <button
                type="button"
                onClick={() => setShowNewPwd((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500"
                title={showNewPwd ? "Ẩn" : "Hiện"}
              >
                {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <input
                type={showConfirmPwd ? "text" : "password"}
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                className="w-full pr-10 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPwd((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500"
                title={showConfirmPwd ? "Ẩn" : "Hiện"}
              >
                {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="md:col-span-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setCurrPwd(""); setNewPwd(""); setConfirmPwd("");
                setPwdMsg("");
              }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              disabled={pwdSaving}
            >
              Xoá
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={pwdSaving}
            >
              {pwdSaving ? "Đang đổi..." : "Đổi mật khẩu"}
            </button>
          </div>

          {!!pwdMsg && (
            <div className="md:col-span-3 text-sm text-gray-700">{pwdMsg}</div>
          )}
        </form>
      </div>
    </div>
  );
}
