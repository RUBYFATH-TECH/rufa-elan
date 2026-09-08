"use client";

import { useEffect, useState } from "react";
import { 
  Mail,
  Smartphone,
  CheckCircle,
  Package,
  Truck,
  Star,
  Bell
} from "lucide-react";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import AccountLayout from "@/components/account-layout";

type UserProfile = {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
};

type NotificationPreference = {
  id: string;
  category: string;
  title: string;
  description: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
};

export default function NotificationsPage() {
  const supabase = createClientComponentSupabaseClient();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const sessionUser = data.session?.user;
        
        if (sessionUser) {
          // Set user profile
          const profile: UserProfile = {
            id: sessionUser.id,
            email: sessionUser.email || '',
            full_name: sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || '',
            phone: sessionUser.user_metadata?.phone || '',
            avatar_url: sessionUser.user_metadata?.avatar_url || null,
            created_at: sessionUser.created_at || new Date().toISOString()
          };

          setUserProfile(profile);

          // Load notification preferences
          const mockPreferences: NotificationPreference[] = [
            {
              id: '1',
              category: 'Order Updates',
              title: 'Order confirmations',
              description: 'Get notified when your order is confirmed and being processed',
              email_enabled: true,
              sms_enabled: true,
              push_enabled: true
            },
            {
              id: '2',
              category: 'Order Updates',
              title: 'Shipping updates',
              description: 'Track your package with real-time shipping notifications',
              email_enabled: true,
              sms_enabled: true,
              push_enabled: false
            },
            {
              id: '3',
              category: 'Order Updates',
              title: 'Delivery confirmations',
              description: 'Know when your order has been delivered',
              email_enabled: true,
              sms_enabled: false,
              push_enabled: true
            },
            {
              id: '4',
              category: 'Marketing',
              title: 'New arrivals',
              description: 'Be the first to know about new products and collections',
              email_enabled: true,
              sms_enabled: false,
              push_enabled: false
            },
            {
              id: '5',
              category: 'Marketing',
              title: 'Sales & promotions',
              description: 'Get exclusive access to sales, discounts, and special offers',
              email_enabled: true,
              sms_enabled: false,
              push_enabled: true
            },
            {
              id: '6',
              category: 'Account',
              title: 'Security alerts',
              description: 'Important security updates and login notifications',
              email_enabled: true,
              sms_enabled: true,
              push_enabled: true
            },
            {
              id: '7',
              category: 'Reviews',
              title: 'Review reminders',
              description: 'Reminders to leave reviews for your purchases',
              email_enabled: false,
              sms_enabled: false,
              push_enabled: true
            }
          ];

          setPreferences(mockPreferences);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, [supabase]);

  const togglePreference = (preferenceId: string, channel: 'email' | 'sms' | 'push') => {
    setPreferences(prev => 
      prev.map(pref => 
        pref.id === preferenceId 
          ? { ...pref, [`${channel}_enabled`]: !pref[`${channel}_enabled`] }
          : pref
      )
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Order Updates':
        return Package;
      case 'Marketing':
        return Star;
      case 'Account':
        return CheckCircle;
      case 'Reviews':
        return Star;
      default:
        return Bell;
    }
  };

  const groupedPreferences = preferences.reduce((acc, pref) => {
    if (!acc[pref.category]) {
      acc[pref.category] = [];
    }
    acc[pref.category].push(pref);
    return acc;
  }, {} as Record<string, NotificationPreference[]>);

  return (
    <AccountLayout>
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notification Preferences</h1>
        <p className="text-gray-600 mt-1">
          Choose how you'd like to receive notifications about your orders and account
        </p>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <Mail className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">Email</p>
              <p className="text-sm text-gray-600">{userProfile?.email}</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <Smartphone className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-900">Phone</p>
              <p className="text-sm text-gray-600">
                {userProfile?.phone || 'Not provided'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Categories */}
      <div className="space-y-6">
        {Object.entries(groupedPreferences).map(([category, prefs]) => {
          const CategoryIcon = getCategoryIcon(category);
          return (
            <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <CategoryIcon className="h-5 w-5 text-gray-400 mr-3" />
                <h2 className="text-lg font-semibold text-gray-900">{category}</h2>
              </div>
              
              <div className="space-y-4">
                {prefs.map((pref) => (
                  <div key={pref.id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{pref.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{pref.description}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center space-x-6">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={pref.email_enabled}
                          onChange={() => togglePreference(pref.id, 'email')}
                          className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <Mail className="h-4 w-4 text-gray-400 ml-2 mr-1" />
                        <span className="text-sm text-gray-700">Email</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={pref.sms_enabled}
                          onChange={() => togglePreference(pref.id, 'sms')}
                          className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                          disabled={!userProfile?.phone}
                        />
                        <Smartphone className="h-4 w-4 text-gray-400 ml-2 mr-1" />
                        <span className="text-sm text-gray-700">SMS</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={pref.push_enabled}
                          onChange={() => togglePreference(pref.id, 'push')}
                          className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <Bell className="h-4 w-4 text-gray-400 ml-2 mr-1" />
                        <span className="text-sm text-gray-700">Push</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="mt-8">
        <button className="w-full md:w-auto px-6 py-3 bg-orange-600 text-white font-medium rounded-md hover:bg-orange-700 transition-colors">
          Save Preferences
        </button>
      </div>
    </AccountLayout>
  );
}
