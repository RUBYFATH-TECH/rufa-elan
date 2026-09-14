"use client";

import { useEffect, useState } from "react";
import { 
  Camera,
  Save,
  Eye,
  EyeOff,
  Shield,
  Trash2,
  AlertTriangle
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

export default function SettingsPage() {
  const supabase = createClientComponentSupabaseClient();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

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
          setFormData({
            full_name: profile.full_name || '',
            phone: profile.phone || '',
            current_password: '',
            new_password: '',
            confirm_password: ''
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();

    // Listen for auth state changes to refresh profile when avatar is updated
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'USER_UPDATED' && session?.user) {
        console.log('Auth state changed, updating profile');
        const updatedProfile: UserProfile = {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
          phone: session.user.user_metadata?.phone || '',
          avatar_url: session.user.user_metadata?.avatar_url || null,
          created_at: session.user.created_at || new Date().toISOString()
        };
        setUserProfile(updatedProfile);
        setFormData(prev => ({
          ...prev,
          full_name: updatedProfile.full_name || '',
          phone: updatedProfile.phone || ''
        }));
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (message) setMessage(null);
  };

  const handleProfileUpdate = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          phone: formData.phone
        }
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        // Update local state
        if (userProfile) {
          setUserProfile(prev => prev ? {
            ...prev,
            full_name: formData.full_name,
            phone: formData.phone
          } : null);
        }
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    }

    setIsSaving(false);
  };

  const handlePasswordChange = async () => {
    if (!formData.current_password || !formData.new_password) {
      setMessage({ type: 'error', text: 'Please fill in all password fields.' });
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (formData.new_password.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.new_password
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: 'Password updated successfully!' });
        setFormData(prev => ({
          ...prev,
          current_password: '',
          new_password: '',
          confirm_password: ''
        }));
      }
    } catch (error) {
      console.error('Password update error:', error);
      setMessage({ type: 'error', text: 'Failed to update password. Please try again.' });
    }

    setIsSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select a valid image file.' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 2MB.' });
      return;
    }

    setIsUploadingAvatar(true);
    setMessage(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64String = event.target?.result as string;

        try {
          console.log('Starting avatar upload for user:', userProfile?.id);
          
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: base64String,
              isAvatar: true,
              userId: userProfile?.id
            })
          });

          const data = await response.json();
          
          console.log('Upload response:', data);

          if (!response.ok) {
            throw new Error(data.error || data.message || 'Upload failed');
          }

          // Verify we got a valid URL
          if (!data.data?.url) {
            throw new Error('No URL returned from upload');
          }

          console.log('Avatar URL received:', data.data.url);

          // Update Supabase Auth user metadata with the avatar URL
          const { error } = await supabase.auth.updateUser({
            data: { avatar_url: data.data.url }
          });

          if (error) {
            console.error('Auth update error:', error);
            setMessage({ type: 'error', text: `Failed to save avatar: ${error.message}` });
          } else {
            console.log('Avatar saved to auth metadata');
            setMessage({ type: 'success', text: 'Avatar updated successfully!' });
            
            // Update local state immediately
            if (userProfile) {
              setUserProfile(prev => prev ? {
                ...prev,
                avatar_url: data.data.url
              } : null);
            }
          }
        } catch (error) {
          console.error('Upload error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to upload avatar.';
          setMessage({ type: 'error', text: errorMessage });
        } finally {
          setIsUploadingAvatar(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File read error:', error);
      setMessage({ type: 'error', text: 'Failed to process file.' });
      setIsUploadingAvatar(false);
    }
  };

  if (!userProfile) {
    return (
      <AccountLayout>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-4">Loading settings...</p>
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout>
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your profile information, security settings, and account preferences
        </p>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
        
        {/* Avatar Section */}
        <div className="flex items-center mb-6">
          <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden relative flex-shrink-0">
            {userProfile.avatar_url ? (
              <img 
                key={userProfile.avatar_url}
                src={userProfile.avatar_url} 
                alt="Profile" 
                className="h-full w-full object-cover" 
                onError={(e) => {
                  // Fallback if image fails to load
                  const img = e.target as HTMLImageElement;
                  img.style.display = 'none';
                  const parent = img.parentElement;
                  if (parent) {
                    const fallback = parent.querySelector('[data-fallback]');
                    if (fallback) {
                      fallback.classList.remove('hidden');
                    }
                  }
                }}
              />
            ) : null}
            <div 
              data-fallback
              className={`absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-xl ${userProfile.avatar_url ? 'hidden' : ''}`}
            >
              {userProfile.full_name?.charAt(0) || userProfile.email.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="ml-4">
            <label className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              <Camera className="h-4 w-4 mr-2" />
              {isUploadingAvatar ? 'Uploading...' : 'Change Photo'}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={isUploadingAvatar}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-1">JPG, GIF or PNG. Max size of 2MB.</p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              value={userProfile.email}
              disabled
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
              placeholder="e.g. +233 24 000 0000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Member Since</label>
            <input
              type="text"
              value={new Date(userProfile.created_at).toLocaleDateString()}
              disabled
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-500"
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleProfileUpdate}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Password</label>
            <div className="mt-1 relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.current_password}
                onChange={(e) => handleInputChange('current_password', e.target.value)}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 pr-10"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <div className="mt-1 relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={formData.new_password}
                  onChange={(e) => handleInputChange('new_password', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 pr-10"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input
                type="password"
                value={formData.confirm_password}
                onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <button
            onClick={handlePasswordChange}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium disabled:opacity-50"
          >
            <Shield className="w-4 h-4 mr-2" />
            {isSaving ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <h2 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h2>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Delete Account</h3>
              <p className="text-sm text-red-700 mt-1">
                Once you delete your account, there is no going back. This will permanently delete your account, order history, and all associated data.
              </p>
              <button className="mt-3 inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}
