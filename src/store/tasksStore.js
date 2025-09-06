import { create } from 'zustand';
import {
  getAdminTasks,
  getMyTasks,
  getTaskById,
  updateTask as apiUpdateTask,
  completeTask as apiCompleteTask,
  deleteTask as apiDeleteTask,
} from '../services/tasks';
import { TASK_STATUS } from '../constants/taskStatus';

export const useTasksStore = create((set, get) => ({
  items: [],

  // 🔧 robust: nhận cả "42" và 42
  byId: (id) => {
    const idNum = Number(id);
    return get().items.find(t => t?.id === id || t?.id === idNum);
  },

  setItems: (items) => set({ items }),
  upsert: (task) =>
    set(s => {
      const i = s.items.findIndex(x => x.id === task.id);
      if (i >= 0) {
        const copy = s.items.slice(); copy[i] = task; return { items: copy };
      }
      return { items: [task, ...s.items] };
    }),
  remove: (id) => set(s => ({ items: s.items.filter(x => x.id !== id) })),

  fetchAll: async () => {
    try {
      const list = await getAdminTasks();
      set({ items: list });
      return list;
    } catch (e) {
      if (e?.response?.status === 403) {
        const list = await getMyTasks();
        set({ items: list });
        return list;
      }
      throw e;
    }
  },

  // ✅ cần có để TaskDetail tự lấy khi chưa có trong store
  fetchById: async (id) => {
    const t = await getTaskById(id);
    get().upsert(t);
    return t;
  },

  update: async (patch) => {
    if (!patch?.id) throw new Error('Thiếu id task');
    let updated;
    if (String(patch.status).toLowerCase() === TASK_STATUS.DONE) {
      updated = await apiCompleteTask(patch.id);
    } else {
      updated = await apiUpdateTask(patch.id, patch);
    }
    get().upsert(updated);
    return updated;
  },

  delete: async (id) => {
    await apiDeleteTask(id);
    get().remove(id);
    return true;
  },
}));
