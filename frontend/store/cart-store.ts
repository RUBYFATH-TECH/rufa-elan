import { create } from "zustand";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string;
  sku?: string;
};

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  hydrate: () => void;
};

const STORAGE_KEY = "rufa-cart";

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) => {
    const existing = get().items.find((cartItem) => cartItem.id === item.id);
    const items = existing
      ? get().items.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        )
      : [...get().items, item];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    set({ items });
  },
  updateQuantity: (id, quantity) => {
    const items = get()
      .items.map((cartItem) =>
        cartItem.id === id ? { ...cartItem, quantity } : cartItem
      )
      .filter((item) => item.quantity > 0);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    set({ items });
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
        set({ items });
      }
    } catch {
      // ignore parse errors
    }
  }
}));
