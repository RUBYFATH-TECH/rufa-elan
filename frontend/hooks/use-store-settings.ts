"use client";

import { useEffect, useState } from 'react';
import { getStoreSettings, StoreSettings } from '@/lib/api/store-settings';

interface UseStoreSettingsResult {
  settings: StoreSettings | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage store settings
 * Includes caching to prevent unnecessary API calls
 */
export function useStoreSettings(): UseStoreSettingsResult {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStoreSettings();
      setSettings(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load store settings';
      setError(errorMessage);
      console.error('Error fetching store settings:', err);
      
      // Set fallback defaults on error
      setSettings({
        id: 'default',
        store_name: 'RUFA ELAN',
        store_email: 'hello@rufaelan.com',
        store_phone: '+233 24 123 4567',
        store_address: '123 Fashion Avenue',
        store_city: 'Accra',
        store_country: 'Ghana',
        currency_code: 'GHS',
        tax_rate: 5,
        default_shipping_cost: 25,
        store_status: 'active',
        whatsapp_number: '+905053783510',
        phone_number: '+233241234567',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
  };
}
