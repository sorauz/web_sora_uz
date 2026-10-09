import { create } from "zustand";
import { persist } from "zustand/middleware";

export const MAX_COMPARE_ITEMS = 4;

interface CompareStore {
  compareIds: string[];
  toggleCompare: (id: string) => { added: boolean; limitReached: boolean };
  addToCompare: (id: string) => { success: boolean; limitReached: boolean };
  removeFromCompare: (id: string) => void;
  isInCompare: (id: string) => boolean;
  getCount: () => number;
  clearCompare: () => void;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      compareIds: [],
      toggleCompare: (id) => {
        const state = get();
        const exists = state.compareIds.includes(id);
        if (exists) {
          set({ compareIds: state.compareIds.filter((item) => item !== id) });
          return { added: false, limitReached: false };
        }
        if (state.compareIds.length >= MAX_COMPARE_ITEMS) {
          return { added: false, limitReached: true };
        }
        set({ compareIds: [...state.compareIds, id] });
        return { added: true, limitReached: false };
      },
      addToCompare: (id) => {
        const state = get();
        if (state.compareIds.includes(id)) {
          return { success: true, limitReached: false };
        }
        if (state.compareIds.length >= MAX_COMPARE_ITEMS) {
          return { success: false, limitReached: true };
        }
        set({ compareIds: [...state.compareIds, id] });
        return { success: true, limitReached: false };
      },
      removeFromCompare: (id) => {
        set((state) => ({
          compareIds: state.compareIds.filter((item) => item !== id),
        }));
      },
      isInCompare: (id) => get().compareIds.includes(id),
      getCount: () => get().compareIds.length,
      clearCompare: () => set({ compareIds: [] }),
    }),
    {
      name: "sora-compare-storage",
    }
  )
);
