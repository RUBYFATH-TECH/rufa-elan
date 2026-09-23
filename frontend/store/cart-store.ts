import { create } from "zustand";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string;
  sku?: string;
  stock_quantity?: number;
};

type CartState = {
  items: CartItem[];
  hasHydrated: boolean;
  addItem: (item: CartItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  hydrate: () => void;
  error: string | null;
  setError: (error: string | null) => void;
};

const STORAGE_KEY = "rufa-cart";

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  hasHydrated: false,
  error: null,
  setError: (error) => set({ error }),
  addItem: (item) => {
    const existing = get().items.find((cartItem) => cartItem.id === item.id);
    const newQuantity = existing ? existing.quantity + item.quantity : item.quantity;
    
    // Check stock availability
    if (item.stock_quantity !== undefined && newQuantity > item.stock_quantity) {
      set({ 
        error: `Cannot add more than ${item.stock_quantity} items. Only ${item.stock_quantity} in stock.` 
      });
      return;
    }
    
    const items = existing
      ? get().items.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: newQuantity, stock_quantity: item.stock_quantity }
            : cartItem
        )
      : [...get().items, item];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    set({ items, error: null });
  },
  updateQuantity: (id, quantity) => {
    const cartItem = get().items.find((item) => item.id === id);
    
    // Check stock availability for quantity updates
    if (cartItem?.stock_quantity !== undefined && quantity > cartItem.stock_quantity) {
      set({ 
        error: `Cannot exceed stock limit. Only ${cartItem.stock_quantity} available.` 
      });
      return;
    }
    
    const items = get()
      .items.map((cartItem) =>
        cartItem.id === id ? { ...cartItem, quantity } : cartItem
      )
      .filter((item) => item.quantity > 0);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    set({ items, error: null });
  },
  removeItem: (id) => {
    const items = get().items.filter((item) => item.id !== id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    set({ items });
  },
  clearCart: () => {
    window.localStorage.removeItem(STORAGE_KEY);
    set({ items: [] });
  },
  hydrate: () => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored) as CartItem[];
        set({ items: Array.isArray(items) ? items : [], hasHydrated: true });
        return;
      }
    } catch {
      // ignore parse errors
    }
    set({ hasHydrated: true });
  }
}));
