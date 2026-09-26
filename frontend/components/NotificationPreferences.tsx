'use client';

import React, { useState, useEffect } from 'react';

interface NotificationChannel {
  email: boolean;
  sms: boolean;
  push: boolean;
}

interface NotificationPreference {
  enabled: boolean;
  channels: string[];
  description?: string;
}

interface NotificationPreferences {
  notifications: {
    order_updates: {
      order_confirmations: NotificationPreference;
      shipping_updates: NotificationPreference;
      delivery_confirmations: NotificationPreference;
    };
    reviews: {
      review_reminders: NotificationPreference;
    };
    marketing: {
      new_arrivals: NotificationPreference;
      sales_promotions: NotificationPreference;
      fast_deals: NotificationPreference;
    };
    account: {
      security_alerts: NotificationPreference;
    };
  };
}

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notification-preferences`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      
      if (data.success) {
        setPreferences(data.data);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      showMessage('error', 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notification-preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ preferences }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        showMessage('success', 'Preferences saved successfully');
      } else {
        showMessage('error', 'Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      showMessage('error', 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    if (!confirm('Are you sure you want to reset all preferences to defaults?')) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notification-preferences/reset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPreferences(data.data);
        showMessage('success', 'Preferences reset to defaults');
      } else {
        showMessage('error', 'Failed to reset preferences');
      }
    } catch (error) {
      console.error('Error resetting preferences:', error);
      showMessage('error', 'Failed to reset preferences');
    } finally {
      setSaving(false);
    }
  };

  const togglePreference = (category: string, preference: string) => {
    if (!preferences) return;

    const categoryPrefs = preferences.notifications[category as keyof typeof preferences.notifications];
    const preferenceItem = (categoryPrefs as any)[preference] as NotificationPreference;
    
    setPreferences({
      ...preferences,
      notifications: {
        ...preferences.notifications,
        [category]: {
          ...categoryPrefs,
          [preference]: {
            ...preferenceItem,
            enabled: !preferenceItem.enabled,
          },
        },
      },
    });
  };

  const toggleChannel = (category: string, preference: string, channel: string) => {
    if (!preferences) return;

    const categoryPrefs = preferences.notifications[category as keyof typeof preferences.notifications];
    const preferenceItem = (categoryPrefs as any)[preference] as NotificationPreference;
    const currentChannels = preferenceItem.channels;

    const newChannels = currentChannels.includes(channel)
      ? currentChannels.filter((c) => c !== channel)
      : [...currentChannels, channel];

    setPreferences({
      ...preferences,
      notifications: {
        ...preferences.notifications,
        [category]: {
          ...categoryPrefs,
          [preference]: {
            ...preferenceItem,
            channels: newChannels,
          },
        },
      },
    });
  };

  const renderPreferenceSection = (
    title: string,
    icon: string,
    category: string,
    items: Array<{ key: string; label: string; description: string }>
  ) => {
    if (!preferences) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">{icon}</span>
          <h2 className="text-xl font-bold">{title}</h2>
        </div>

        <div className="space-y-6">
          {items.map((item) => {
            const categoryPrefs = preferences.notifications[category as keyof typeof preferences.notifications];
            const pref = (categoryPrefs as any)[item.key] as NotificationPreference;

            return (
              <div key={item.key} className="border-b pb-6 last:border-b-0 last:pb-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-1">{item.label}</h3>
                    <p className="text-sm text-gray-600">{item.description || pref.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 ml-6">
                  {/* Email */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pref.enabled && pref.channels.includes('email')}
                      onChange={() => toggleChannel(category, item.key, 'email')}
                      disabled={!pref.enabled}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm flex items-center gap-1">
                      📧 Email
                    </span>
                  </label>

                  {/* SMS */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pref.enabled && pref.channels.includes('sms')}
                      onChange={() => toggleChannel(category, item.key, 'sms')}
                      disabled={!pref.enabled}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm flex items-center gap-1">
                      📱 SMS
                    </span>
                  </label>

                  {/* Push */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pref.enabled && pref.channels.includes('push')}
                      onChange={() => toggleChannel(category, item.key, 'push')}
                      disabled={!pref.enabled}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm flex items-center gap-1">
                      🔔 Push
                    </span>
                  </label>

                  {/* Enable/Disable Toggle */}
                  <button
                    onClick={() => togglePreference(category, item.key)}
                    className={`ml-auto px-4 py-1 rounded-lg text-sm font-medium transition ${
                      pref.enabled
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {pref.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading preferences...</p>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Failed to load preferences</p>
        <button
          onClick={fetchPreferences}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Notification Preferences</h1>
        <p className="text-gray-600">
          Choose how you'd like to receive notifications about your orders and account
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Order Updates */}
      {renderPreferenceSection('Order Updates', '📦', 'order_updates', [
        {
          key: 'order_confirmations',
          label: 'Order confirmations',
          description: 'Get notified when your order is confirmed and being processed',
        },
        {
          key: 'shipping_updates',
          label: 'Shipping updates',
          description: 'Track your package with real-time shipping notifications',
        },
        {
          key: 'delivery_confirmations',
          label: 'Delivery confirmations',
          description: 'Know when your order has been delivered',
        },
      ])}

      {/* Reviews */}
      {renderPreferenceSection('Reviews', '⭐', 'reviews', [
        {
          key: 'review_reminders',
          label: 'Review reminders',
          description: 'Reminders to leave reviews for your purchases',
        },
      ])}

      {/* Marketing */}
      {renderPreferenceSection('Marketing', '🎯', 'marketing', [
        {
          key: 'new_arrivals',
          label: 'New arrivals',
          description: 'Be the first to know about new products and collections',
        },
        {
          key: 'sales_promotions',
          label: 'Sales & promotions',
          description: 'Get exclusive access to sales, discounts, and special offers',
        },
        {
          key: 'fast_deals',
          label: 'Fast deals',
          description: 'Limited-time flash deals and exclusive discounts',
        },
      ])}

      {/* Account */}
      {renderPreferenceSection('Account', '🔒', 'account', [
        {
          key: 'security_alerts',
          label: 'Security alerts',
          description: 'Important security updates and login notifications',
        },
      ])}

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={savePreferences}
          disabled={saving}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>

        <button
          onClick={resetToDefaults}
          disabled={saving}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Reset to Defaults
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center mt-4">
        Changes will take effect immediately after saving
      </p>
    </div>
  );
}
