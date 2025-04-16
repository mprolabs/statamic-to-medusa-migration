'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  quantity: number;
  variantId?: string;
  attributes?: Array<{
    name: string;
    value: string;
  }>;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  closeCart: () => void;
  openCart: () => void;
  itemCount: number;
  totalPrice: number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        const { items } = get();
        // Check if item already exists in cart
        const existingItemIndex = items.findIndex(
          (item) => item.id === newItem.id &&
                   ((!item.variantId && !newItem.variantId) || item.variantId === newItem.variantId)
        );

        if (existingItemIndex !== -1) {
          // Item exists, update quantity
          const updatedItems = [...items];
          updatedItems[existingItemIndex].quantity += newItem.quantity;
          set({ items: updatedItems });
        } else {
          // New item, add to cart
          set({ items: [...items, newItem] });
        }
      },

      removeItem: (id) => {
        const { items } = get();
        set({ items: items.filter(item => item.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        const { items } = get();
        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          set({ items: items.filter(item => item.id !== id) });
          return;
        }

        set({
          items: items.map(item =>
            item.id === id ? { ...item, quantity } : item
          )
        });
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set(state => ({ isOpen: !state.isOpen })),

      closeCart: () => set({ isOpen: false }),

      openCart: () => set({ isOpen: true }),

      get itemCount() {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      get totalPrice() {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      }
    }),
    {
      name: 'shopping-cart',
      // Skip persisting these computed/transient properties
      partialize: (state) => ({
        items: state.items,
        isOpen: state.isOpen
      }),
    }
  )
);
