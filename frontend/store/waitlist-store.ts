import { create } from "zustand";

export type WaitlistItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  slug: string;
};

type WaitlistState = {
  items: WaitlistItem[];
  addItem: (item: WaitlistItem) => void;
  removeItem: (id: string) => void;
  toggleItem: (item: WaitlistItem) => void;
  hasItem: (id: string) => boolean;
  hydrate: () => void;
};

const STORAGE_KEY = "rufa-waitlist";

export const useWaitlistStore = create<WaitlistState>((set, get) => ({
  items: [],
  addItem: (item) => {
    const existing = get().items.some((waitlistItem) => waitlistItem.id === item.id);
    const items = existing ? get().items : [...get().items, item];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    set({ items });
  },
  removeItem: (id) => {
    const items = get().items.filter((waitlistItem) => waitlistItem.id !== id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    set({ items });
  },
  toggleItem: (item) => {
    const existing = get().items.find((waitlistItem) => waitlistItem.id === item.id);
    let items;
    if (existing) {
      items = get().items.filter((waitlistItem) => waitlistItem.id !== item.id);
    } else {
      items = [...get().items, item];
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    set({ items });
  },
  hasItem: (id) => get().items.some((waitlistItem) => waitlistItem.id === id),
  hydrate: () => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored) as WaitlistItem[];
        set({ items });
      }
    } catch {
      // ignore parse errors
    }
  }
}));
