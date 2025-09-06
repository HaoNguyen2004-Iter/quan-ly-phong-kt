// src/store/employeesStore.js
// Giữ API bạn đang dùng, nhưng:
// - byId so sánh theo string để an toàn
// - update hỗ trợ cả update(id, patch) và update({id,...})
// - có thêm loading/error (nếu cần)

import { create } from 'zustand';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../services/employees';

export const useEmployeesStore = create((set, get) => ({
  items: [],
  loading: false,
  error: null,

  byId: (id) => {
    const needle = String(id);
    return (get().items || []).find((e) => String(e.id) === needle);
  },

  setItems: (items) => set({ items }),
  upsert: (emp) =>
    set((state) => {
      const idx = (state.items || []).findIndex((x) => String(x.id) === String(emp.id));
      if (idx >= 0) {
        const next = state.items.slice();
        next[idx] = { ...next[idx], ...emp };
        return { items: next };
      }
      return { items: [emp, ...(state.items || [])] };
    }),
  remove: (id) =>
    set((state) => ({
      items: (state.items || []).filter((x) => String(x.id) !== String(id)),
    })),

  // ==== async actions ====
  fetchAll: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const list = await getEmployees(params);
      set({ items: list, loading: false });
      return list;
    } catch (e) {
      set({ loading: false, error: e?.message || 'Fetch employees failed' });
      throw e;
    }
  },

  fetchById: async (id) => {
    const emp = await getEmployeeById(id);
    get().upsert(emp);
    return emp;
    // (có thể set error/loading nếu bạn muốn nhất quán)
  },

  add: async (payload) => {
    const emp = await createEmployee(payload);
    get().upsert(emp);
    return emp;
  },

  // Hỗ trợ: update(id, payload) và update({ id, ...patch })
  update: async (idOrPatch, payload) => {
    let updated;
    if (typeof idOrPatch === 'object' && idOrPatch !== null) {
      updated = await updateEmployee(idOrPatch);
    } else {
      updated = await updateEmployee(idOrPatch, payload);
    }
    get().upsert(updated);
    return updated;
  },

  removeRemote: async (id) => {
    await deleteEmployee(id);
    get().remove(id);
    return true;
  },
}));
