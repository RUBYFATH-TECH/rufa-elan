import { create } from "zustand";

export type WishlistItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  slug: string;
};

type WishlistState = {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  hasItem: (id: string) => boolean;
  hydrate: () => void;
};

const STORAGE_KEY = "rufa-wishlist";

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  addItem: (item) => {
    const existing = get().items.some((wishlistItem) => wishlistItem.id === item.id);
    const items = existing ? get().items : [...get().items, item];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    set({ items });
  },
  removeItem: (id) => {
    const items = get().items.filter((wishlistItem) => wishlistItem.id !== id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    set({ items });
  },
  hasItem: (id) => get().items.some((wishlistItem) => wishlistItem.id === id),
  hydrate: () => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored) as WishlistItem[];
        set({ items });
      }
    } catch {
      // ignore parse errors
    }
  }
}));
