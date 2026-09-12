"use client";

import { useState, useEffect } from "react";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import { fetchStoreSettings, updateStoreSettings, StoreSettings } from "@/lib/api/store-settings";
import {
  Save,
  AlertCircle,
  CheckCircle,
  Settings,
  Package,
  Mail,
  Phone,
  MapPin,
  Globe,
  Loader2,
} from "lucide-react";

export default function AdminSettingsPage() {
  const supabase = createClientComponentSupabaseClient();
  
  const [settings, setSettings] = useState<StoreSettings>({
    store_name: "RUFA ELAN",
    store_email: "hello@rufaelan.com",
    store_phone: "+233 24 123 4567",
    store_address: "123 Fashion Avenue",
    store_city: "Accra",
    store_country: "Ghana",
    currency_code: "GHS",
    tax_rate: 5,
    default_shipping_cost: 25,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await fetchStoreSettings();
      setSettings(data);
      setIsDirty(false);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to load settings'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof StoreSettings, value: string | number) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;

      if (!authToken) {
        throw new Error('Authentication required. Please log in again.');
      }

      await updateStoreSettings(settings, authToken);
      
      setMessage({
        type: 'success',
        text: 'Store settings saved successfully!'
      });
      setIsDirty(false);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save settings'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
            <p className="text-sm text-slate-600 mt-1">Manage your store configuration and preferences.</p>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm mb-8">
            <Loader2 className="w-12 h-12 text-orange-600 mx-auto mb-4 animate-spin" />
            <p className="text-slate-600 font-medium">Loading store settings...</p>
          </div>
        )}

        {!loading && (
          <>
            {/* Message Display */}
            {message && (
              <div className={`mb-8 rounded-xl border p-4 flex items-start gap-3 ${
                message.type === 'success'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`text-sm font-medium ${
                    message.type === 'success' ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {message.text}
                  </p>
                </div>
              </div>
            )}

            {/* Store Information */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
              <div className="border-b border-slate-200 p-6 flex items-center gap-3">
                <Package className="w-5 h-5 text-slate-600" />
                <h2 className="text-lg font-semibold text-slate-900">Store Information</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Store Name
                    </label>
                    <input
                      type="text"
                      value={settings.store_name}
                      onChange={(e) => handleChange('store_name', e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Currency
                    </label>
                    <select
                      value={settings.currency_code}
                      onChange={(e) => handleChange('currency_code', e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="GHS">GHS (Ghana Cedis)</option>
                      <option value="USD">USD (US Dollars)</option>
                      <option value="EUR">EUR (Euros)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
              <div className="border-b border-slate-200 p-6 flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-600" />
                <h2 className="text-lg font-semibold text-slate-900">Contact Information</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={settings.store_email}
                      onChange={(e) => handleChange('store_email', e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={settings.store_phone}
                      onChange={(e) => handleChange('store_phone', e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
              <div className="border-b border-slate-200 p-6 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-slate-600" />
                <h2 className="text-lg font-semibold text-slate-900">Address</h2>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={settings.store_address}
                    onChange={(e) => handleChange('store_address', e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={settings.store_city}
                      onChange={(e) => handleChange('store_city', e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={settings.store_country}
                      onChange={(e) => handleChange('store_country', e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tax & Shipping */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
              <div className="border-b border-slate-200 p-6 flex items-center gap-3">
                <Globe className="w-5 h-5 text-slate-600" />
                <h2 className="text-lg font-semibold text-slate-900">Tax & Shipping</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={settings.tax_rate}
                      onChange={(e) => handleChange('tax_rate', parseFloat(e.target.value))}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Default Shipping Cost ({settings.currency_code})
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={settings.default_shipping_cost}
                      onChange={(e) => handleChange('default_shipping_cost', parseFloat(e.target.value))}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3 pb-8">
              <button
                onClick={loadSettings}
                disabled={saving}
                className="inline-flex items-center px-6 py-2.5 bg-slate-200 text-slate-800 rounded-lg text-sm font-medium hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !isDirty}
                className="inline-flex items-center px-6 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
