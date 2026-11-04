import { create } from "zustand";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  sku?: string;
  stock_quantity?: number;
  variant?: string;
  selected_image_url?: string; // The image URL selected by user for this cart item
};

type CartState = {
  items: CartItem[];
  hasHydrated: boolean;
  shippingRegion: string;
  shippingFee: number;
  deliveryOption: "delivery" | "pickup";
  addItem: (item: CartItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => Promise<void>;
  hydrate: () => void;
  error: string | null;
  setError: (error: string | null) => void;
  setShippingInfo: (region: string, fee: number, option: "delivery" | "pickup") => void;
};

const STORAGE_KEY = "rufa-cart";
const SHIPPING_STORAGE_KEY = "rufa-cart-shipping";

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  hasHydrated: false,
  error: null,
  shippingRegion: '',
  shippingFee: 0,
  deliveryOption: 'delivery',
  setError: (error) => set({ error }),
  setShippingInfo: (region, fee, option) => {
    const shippingData = { region, fee, option };
    window.localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(shippingData));
    set({ shippingRegion: region, shippingFee: fee, deliveryOption: option });
  },
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
            ? { 
                ...cartItem, 
                quantity: newQuantity, 
                stock_quantity: item.stock_quantity,
                // Update selected_image_url if a new one is provided
                selected_image_url: item.selected_image_url || cartItem.selected_image_url,
                // Update image to match selected_image_url for consistency
                image: item.selected_image_url || cartItem.selected_image_url || item.image
              }
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
  clearCart: async () => {
    // Clear localStorage immediately
    window.localStorage.removeItem(STORAGE_KEY);
    set({ items: [] });
    
    // Also clear backend cart if user is authenticated
    try {
      const supabase = createClientComponentSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        await fetch(`${backendUrl}/api/cart`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          }
        });
      }
    } catch (err) {
      console.error('Failed to clear backend cart:', err);
      // Don't fail the local clear if backend fails
    }
  },
  hydrate: () => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const shippingStored = window.localStorage.getItem(SHIPPING_STORAGE_KEY);
      
      let items: CartItem[] = [];
      let shippingData = { region: '', fee: 0, option: 'delivery' as "delivery" | "pickup" };
      
      if (stored) {
        items = JSON.parse(stored) as CartItem[];
      }
      
      if (shippingStored) {
        shippingData = JSON.parse(shippingStored);
      }
      
      set({ 
        items: Array.isArray(items) ? items : [], 
        hasHydrated: true,
        shippingRegion: shippingData.region,
        shippingFee: shippingData.fee,
        deliveryOption: shippingData.option
      });
      return;
    } catch {
      // ignore parse errors
    }
    set({ hasHydrated: true });
  }
}));
