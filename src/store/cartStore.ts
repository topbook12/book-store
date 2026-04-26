import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Material } from '../types';

interface CartState {
  items: Material[];
  addItem: (item: Material) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => ({
          items: state.items.find((i) => i.id === item.id)
            ? state.items
            : [...state.items, item],
        })),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
    }
  )
);
