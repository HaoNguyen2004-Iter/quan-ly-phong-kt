import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const defaultSettings = {
  appearance: { theme: 'system', density: 'comfortable', language: 'vi' }, // 'system'|'light'|'dark'
  notifications: {
    taskAssigned: true,
    taskStatusChange: true,
    overdueAlerts: true,
    emailReminders: false,
  },
  dashboard: { defaultTab: 'emp-dashboard' }, // 'emp-dashboard' | 'emp-tasks'
};

export const useStaffSettingsStore = create(
  persist(
    (set, get) => ({
      byUser: {},

      getFor: (key) => {
        const state = get();
        return state.byUser[key] || defaultSettings;
      },

      setFor: (key, partial) =>
        set((state) => ({
          byUser: {
            ...state.byUser,
            [key]: {
              ...defaultSettings,
              ...(state.byUser[key] || {}),
              ...(partial || {}),
            },
          },
        })),

      resetFor: (key) =>
        set((state) => ({
          byUser: { ...state.byUser, [key]: defaultSettings },
        })),
    }),
    {
      name: 'staff-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
