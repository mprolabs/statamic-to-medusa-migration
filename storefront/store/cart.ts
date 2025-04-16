import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  variantId?: string;
  variantName?: string;
  price: number;
  currency: string;
  imageSrc?: string;
  quantity: number;
  attributes?: Record<string, string>;
}

interface CartStore {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string, variantId?: string) => void;
  updateQuantity: (id: string, variantId: string | undefined, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      isOpen: false,

      addItem: (item: CartItem) => {
        const { items } = get();
        const existingItemIndex = items.findIndex(
          (i) => i.id === item.id && i.variantId === item.variantId
        );

        let newItems;
        if (existingItemIndex !== -1) {
          newItems = [...items];
          newItems[existingItemIndex] = {
            ...items[existingItemIndex],
            quantity: items[existingItemIndex].quantity + item.quantity,
          };
        } else {
          newItems = [...items, item];
        }

        const newTotalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
        const newTotalPrice = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        set({
          items: newItems,
          totalItems: newTotalItems,
          totalPrice: newTotalPrice,
          isOpen: true, // Open cart when adding an item
        });
      },

      removeItem: (id: string, variantId?: string) => {
        const { items } = get();
        const newItems = items.filter(
          (item) => !(item.id === id && item.variantId === variantId)
        );

        const newTotalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
        const newTotalPrice = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        set({
          items: newItems,
          totalItems: newTotalItems,
          totalPrice: newTotalPrice,
        });
      },

      updateQuantity: (id: string, variantId: string | undefined, quantity: number) => {
        const { items } = get();

        if (quantity <= 0) {
          return get().removeItem(id, variantId);
        }

        const newItems = items.map((item) => {
          if (item.id === id && item.variantId === variantId) {
            return { ...item, quantity };
          }
          return item;
        });

        const newTotalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
        const newTotalPrice = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        set({
          items: newItems,
          totalItems: newTotalItems,
          totalPrice: newTotalPrice,
        });
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0,
        });
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'shopping-cart',
    }
  )
);
