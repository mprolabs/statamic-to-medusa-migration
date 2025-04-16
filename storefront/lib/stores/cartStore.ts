import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '../graphql/types';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  variantId?: string;
}

interface CartStore {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  
  // Actions
  addItem: (product: Product, quantity?: number, variantId?: string) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      
      addItem: (product: Product, quantity = 1, variantId?: string) => {
        const items = [...get().items];
        const productId = variantId || product.id;
        const existingItem = items.find(item => 
          (variantId && item.variantId === variantId) || 
          (!variantId && !item.variantId && item.product.id === product.id)
        );
        
        if (existingItem) {
          // Update existing item quantity
          existingItem.quantity += quantity;
        } else {
          // Add new item
          items.push({
            id: productId,
            product,
            quantity,
            variantId
          });
        }
        
        // Calculate totals
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = items.reduce((sum, item) => {
          const price = variantId && item.product.variants
            ? item.product.variants.find(v => v.id === variantId)?.pricing?.price?.gross.amount || 
              item.product.pricing?.priceRange?.start?.gross.amount || 0
            : item.product.pricing?.priceRange?.start?.gross.amount || 0;
          return sum + (price * item.quantity);
        }, 0);
        
        set({ items, totalItems, totalPrice });
      },
      
      removeItem: (itemId: string) => {
        const items = get().items.filter(item => item.id !== itemId);
        
        // Calculate totals
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = items.reduce((sum, item) => {
          const price = item.variantId && item.product.variants
            ? item.product.variants.find(v => v.id === item.variantId)?.pricing?.price?.gross.amount ||
              item.product.pricing?.priceRange?.start?.gross.amount || 0
            : item.product.pricing?.priceRange?.start?.gross.amount || 0;
          return sum + (price * item.quantity);
        }, 0);
        
        set({ items, totalItems, totalPrice });
      },
      
      updateItemQuantity: (itemId: string, quantity: number) => {
        const items = [...get().items];
        const itemToUpdate = items.find(item => item.id === itemId);
        
        if (itemToUpdate) {
          if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            return get().removeItem(itemId);
          }
          
          itemToUpdate.quantity = quantity;
          
          // Calculate totals
          const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
          const totalPrice = items.reduce((sum, item) => {
            const price = item.variantId && item.product.variants
              ? item.product.variants.find(v => v.id === item.variantId)?.pricing?.price?.gross.amount ||
                item.product.pricing?.priceRange?.start?.gross.amount || 0
              : item.product.pricing?.priceRange?.start?.gross.amount || 0;
            return sum + (price * item.quantity);
          }, 0);
          
          set({ items, totalItems, totalPrice });
        }
      },
      
      clearCart: () => {
        set({ items: [], totalItems: 0, totalPrice: 0 });
      }
    }),
    {
      name: 'saleor-cart', // Local storage key
    }
  )
); 