import { useState, useCallback, useEffect } from "react";
import { fetchProducts } from "@/lib/api/products";

export interface Product {
  id: string;
  name: string;
  slug: string;
  regular_price: number;
  sale_price?: number;
  category_id?: string;
  product_images?: Array<{ url: string; is_primary?: boolean }>;
}

interface UseProductsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { autoRefresh = false, refreshInterval = 30000 } = options;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProducts({ limit: 100 });
      setProducts(data.data || []);
    } catch (err) {
      console.error("Error loading products:", err);
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  // Set up auto-refresh if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    // Load products immediately
    loadProducts();

    // Set up interval for periodic refresh
    const interval = setInterval(loadProducts, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadProducts]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    await loadProducts();
  }, [loadProducts]);

  return {
    products,
    loading,
    error,
    refresh,
    setProducts, // Allow manual updates
  };
}
