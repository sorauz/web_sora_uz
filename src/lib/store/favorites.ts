import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesStore {
  favoriteIds: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  getCount: () => number;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      toggleFavorite: (id) => {
        set((state) => {
          const exists = state.favoriteIds.includes(id);
          return {
            favoriteIds: exists
              ? state.favoriteIds.filter((item) => item !== id)
              : [...state.favoriteIds, id],
          };
        });
      },
      isFavorite: (id) => get().favoriteIds.includes(id),
      getCount: () => get().favoriteIds.length,
    }),
    {
      name: "sora-favorites-storage",
    }
  )
);
