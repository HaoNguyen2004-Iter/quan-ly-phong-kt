// src/store/leavesStore.js
import { create } from 'zustand';
import { adminSearchLeaves, approveLeave, rejectLeave } from '../services/leaves';

export const useLeavesStore = create((set, get) => ({
  items: [],
  loading: false,
  error: null,
  async fetchAll(opts = {}) {
    set({ loading: true, error: null });
    try {
      const items = await adminSearchLeaves(opts); // nhận opts (onlyStaff ...)
      set({ items, loading: false });
    } catch (e) {
      set({ error: e?.message || 'Load lỗi', loading: false });
    }
  },
  async approve(id) { await approveLeave(id); await get().fetchAll({ onlyStaff: true }); },
  async reject(id, note) { await rejectLeave(id, note); await get().fetchAll({ onlyStaff: true }); },
}));
