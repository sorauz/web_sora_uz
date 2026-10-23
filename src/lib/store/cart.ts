import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  sku: string;
  name: string;
  name_uz?: string;
  name_ru?: string;
  slug?: string;
  slug_uz?: string;
  slug_ru?: string;
  price: number;
  picture: string;
  unit: string;
  unit_uz?: string;
  unit_ru?: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  hasItem: (id: string) => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? {
                      ...i,
                      quantity: i.quantity + quantity,
                      name_uz: item.name_uz || i.name_uz,
                      name_ru: item.name_ru || i.name_ru,
                      slug_uz: item.slug_uz || i.slug_uz,
                      slug_ru: item.slug_ru || i.slug_ru,
                      slug: item.slug || i.slug,
                      unit_uz: item.unit_uz || i.unit_uz,
                      unit_ru: item.unit_ru || i.unit_ru,
                    }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
        });
      },
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () => {
        return get().items.reduce((total, i) => total + i.quantity, 0);
      },
      getTotalPrice: () => {
        return get().items.reduce((total, i) => total + i.price * i.quantity, 0);
      },
      hasItem: (id) => {
        return get().items.some((i) => i.id === id);
      },
    }),
    {
      name: "sora-cart-storage",
    }
  )
);
