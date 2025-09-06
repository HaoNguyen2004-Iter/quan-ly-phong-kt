// src/components/staff/MyLeave.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Plus, Calendar, Save, X, Check } from "lucide-react";
import {
  getMyLeaveRequests,
  createLeaveRequest,
  cancelLeaveRequest,
} from "../../services/leaves";

// màu badge trạng thái (VI)
const badgeForStatus = (status) => {
  switch (status) {
    case "Đã duyệt":
      return "bg-green-100 text-green-800";
    case "Chờ duyệt":
      return "bg-yellow-100 text-yellow-800";
    case "Từ chối":
      return "bg-red-100 text-red-800";
    case "Đã huỷ":
      return "bg-gray-200 text-gray-700";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const calcDays = (start, end) => {
  if (!start || !end) return 1;
  const A = new Date(start);
  const B = new Date(end);
  if (isNaN(+A) || isNaN(+B)) return 1;
  return Math.max(1, Math.round((B - A) / 86400000) + 1);
};

export default function MyLeave() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // modal tạo đơn
  const [openAdd, setOpenAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ startDate: "", endDate: "", reason: "" });
  const [formErr, setFormErr] = useState({});

  const refresh = async () => {
    setLoading(true);
    setErr("");
    try {
      const data = await getMyLeaveRequests();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Không tải được đơn nghỉ của bạn.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const counts = useMemo(() => {
    const total = items.length;
    const pending = items.filter((r) => r.status === "Chờ duyệt").length;
    const approved = items.filter((r) => r.status === "Đã duyệt").length;
    const rejected = items.filter((r) => r.status === "Từ chối").length;
    const cancelled = items.filter((r) => r.status === "Đã huỷ").length;
    return { total, pending, approved, rejected, cancelled };
  }, [items]);

  const openAddModal = () => {
    setForm({ startDate: "", endDate: "", reason: "" });
    setFormErr({});
    setOpenAdd(true);
  };
  const closeAddModal = () => setOpenAdd(false);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.startDate) e.startDate = "Bắt buộc";
    if (!form.endDate) e.endDate = "Bắt buộc";
    if (form.startDate && form.endDate && form.endDate < form.startDate)
      e.endDate = "Hạn phải >= ngày bắt đầu";
    setFormErr(e);
    return Object.keys(e).length === 0;
  };

  const submitAdd = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await createLeaveRequest({
        startDate: form.startDate, // yyyy-MM-dd từ input date
        endDate: form.endDate,
        reason: form.reason || "",
      });
      closeAddModal();
      await refresh();
    } catch (e) {
      alert(e?.message || "Tạo đơn nghỉ thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const cancelMyRequest = async (id) => {
    if (!window.confirm("Huỷ đơn này?")) return;
    try {
      await cancelLeaveRequest(id);
      await refresh();
    } catch (e) {
      alert(e?.message || "Huỷ đơn thất bại.");
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Nghỉ phép của tôi</h1>
          <p className="text-gray-600 mt-1">
            Tạo và theo dõi các đơn xin nghỉ của bạn.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Tạo đơn nghỉ
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Stat title="Tổng đơn" value={counts.total} color="blue" />
        <Stat title="Chờ duyệt" value={counts.pending} color="yellow" />
        <Stat title="Đã duyệt" value={counts.approved} color="green" />
        <Stat title="Từ chối" value={counts.rejected} color="red" />
        <Stat title="Đã huỷ" value={counts.cancelled} color="gray" />
      </div>

      {/* Table list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Danh sách đơn của bạn
          </h3>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">
            Đang tải dữ liệu...
          </div>
        ) : err ? (
          <div className="text-center py-12 text-red-600">{err}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            Chưa có đơn nghỉ nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <Th>Thời gian</Th>
                  <Th>Số ngày</Th>
                  <Th>Lý do</Th>
                  <Th>Trạng thái</Th>
                  <Th className="text-right">Thao tác</Th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <Td>
                      <div className="text-sm text-gray-900">
                        {r.startDate} → {r.endDate}
                      </div>
                      <div className="text-xs text-gray-500">
                        Nộp:{" "}
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleString()
                          : "—"}
                      </div>
                    </Td>
                    <Td>{calcDays(r.startDate, r.endDate)} ngày</Td>
                    <Td>{r.reason || "—"}</Td>
                    <Td>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badgeForStatus(
                          r.status
                        )}`}
                      >
                        {r.status}
                      </span>
                    </Td>
                    <Td className="text-right">
                      {r.status === "Chờ duyệt" ? (
                        <button
                          onClick={() => cancelMyRequest(r.id)}
                          className="px-3 py-1.5 border rounded-lg text-gray-700 hover:bg-gray-50"
                          title="Huỷ đơn"
                        >
                          Huỷ
                        </button>
                      ) : r.status === "Đã duyệt" ? (
                        <span className="inline-flex items-center text-green-700">
                          <Check className="w-4 h-4 mr-1" /> Đã duyệt
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal tạo đơn nghỉ */}
      {openAdd && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={saving ? undefined : closeAddModal}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-white rounded-xl shadow-lg border">
              <div className="px-5 py-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold">Tạo đơn nghỉ</h3>
                <button
                  onClick={closeAddModal}
                  disabled={saving}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={submitAdd} className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Ngày bắt đầu *
                    </label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => update("startDate", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        formErr.startDate
                          ? "border-red-400 focus:ring-red-300"
                          : "focus:ring-blue-500"
                      }`}
                    />
                    {formErr.startDate && (
                      <p className="text-xs text-red-600 mt-1">
                        {formErr.startDate}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Ngày kết thúc *
                    </label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => update("endDate", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        formErr.endDate
                          ? "border-red-400 focus:ring-red-300"
                          : "focus:ring-blue-500"
                      }`}
                    />
                    {formErr.endDate && (
                      <p className="text-xs text-red-600 mt-1">
                        {formErr.endDate}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Lý do (tuỳ chọn)
                  </label>
                  <textarea
                    rows={3}
                    value={form.reason}
                    onChange={(e) => update("reason", e.target.value)}
                    placeholder="Ví dụ: Nghỉ phép năm / việc gia đình..."
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeAddModal}
                    disabled={saving}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Đang lưu..." : "Lưu đơn"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== nhỏ gọn: các cell/heading và thẻ thống kê ===== */
function Th({ children, className = "" }) {
  return (
    <th
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}
    >
      {children}
    </th>
  );
}
function Td({ children, className = "" }) {
  return <td className={`px-6 py-4 whitespace-nowrap ${className}`}>{children}</td>;
}

function Stat({ title, value, color = "blue" }) {
  return (
    <div className={`p-4 rounded-xl border bg-${color}-50 border-${color}-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Calendar className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );
}
