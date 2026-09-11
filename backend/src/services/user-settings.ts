/**
 * User Settings Service
 * Handles user profile, settings, and account management
 */

import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';
import {
  UserSettingsUpdate,
  ProfileUpdate,
  PasswordChangeRequest,
  UserPreference,
  UserActivityFilter,
} from '../validation/user-settings';

export interface UserSettings {
  id: string;
  user_id: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  newsletter_subscribed: boolean;
  two_factor_enabled: boolean;
  two_factor_method?: string;
  login_notifications: boolean;
  suspicious_activity_alerts: boolean;
  language: string;
  timezone: string;
  currency: string;
  theme: string;
  items_per_page: number;
  show_profile_public: boolean;
  allow_marketing_emails: boolean;
  allow_personalization: boolean;
  additional_settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfileWithStats extends UserProfile {
  total_orders: number;
  total_spent: number;
  review_count: number;
  wishlist_count: number;
  last_login?: string;
  last_activity?: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  description?: string;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  created_at: string;
}

export class UserSettingsService {
  /**
   * Get user settings
   */
  static async getUserSettings(userId: string): Promise<UserSettings> {
    try {
      logger.info(`Getting settings for user ${userId}`);

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found, create default ones
          return await this.createDefaultSettings(userId);
        }
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Error getting user settings', { error, userId });
      throw error;
    }
  }

  /**
   * Create default settings for a new user
   */
  static async createDefaultSettings(userId: string): Promise<UserSettings> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .insert({
          user_id: userId,
          email_notifications: true,
          sms_notifications: false,
          push_notifications: false,
          newsletter_subscribed: true,
          two_factor_enabled: false,
          login_notifications: true,
          suspicious_activity_alerts: true,
          language: 'en',
          timezone: 'UTC',
          currency: 'GHS',
          theme: 'light',
          items_per_page: 20,
          show_profile_public: false,
          allow_marketing_emails: true,
          allow_personalization: true,
          additional_settings: {},
        })
        .select()
        .single();

      if (error) throw error;

      logger.info(`Default settings created for user ${userId}`);
      return data;
    } catch (error) {
      logger.error('Error creating default settings', { error, userId });
      throw error;
    }
  }

  /**
   * Update user settings
   */
  static async updateSettings(userId: string, update: UserSettingsUpdate): Promise<UserSettings> {
    try {
      logger.info(`Updating settings for user ${userId}`, { update });

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      Object.entries(update).forEach(([key, value]) => {
        if (value !== undefined) {
          updateData[key] = value;
        }
      });

      const { data, error } = await supabase
        .from('user_settings')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      logger.info(`Settings updated for user ${userId}`);
      await this.logActivity(userId, 'settings_update', 'User updated settings');

      return data;
    } catch (error) {
      logger.error('Error updating settings', { error, userId });
      throw error;
    }
  }

  /**
   * Get user profile
   */
  static async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Get email from auth.users
      const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);

      if (userError && userError.code !== 'ERR_NOT_FOUND') {
        logger.warn('Could not fetch user email', { error: userError, userId });
      }

      return {
        id: profile.id,
        email: user?.user?.email || '',
        full_name: profile.full_name,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      };
    } catch (error) {
      logger.error('Error getting user profile', { error, userId });
      throw error;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, update: ProfileUpdate): Promise<UserProfile> {
    try {
      logger.info(`Updating profile for user ${userId}`, { update });

      const updateData: any = {};

      if (update.full_name !== undefined) updateData.full_name = update.full_name;

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      logger.info(`Profile updated for user ${userId}`);
      await this.logActivity(userId, 'profile_update', 'User updated profile');

      return await this.getUserProfile(userId);
    } catch (error) {
      logger.error('Error updating profile', { error, userId });
      throw error;
    }
  }

  /**
   * Change user password
   */
  static async changePassword(
    userId: string,
    passwordChange: PasswordChangeRequest,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      logger.info(`Password change requested for user ${userId}`);

      // Update password using Supabase Auth
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        password: passwordChange.new_password,
      });

      if (error) {
        logger.error('Error changing password', { error, userId });
        await this.logActivity(userId, 'password_change', 'Password change failed', ipAddress, userAgent, false);
        throw error;
      }

      logger.info(`Password changed for user ${userId}`);
      await this.logActivity(userId, 'password_change', 'User changed password', ipAddress, userAgent, true);

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      logger.error('Error in changePassword', { error, userId });
      throw error;
    }
  }

  /**
   * Log user activity
   */
  static async logActivity(
    userId: string,
    action: string,
    description?: string,
    ipAddress?: string,
    userAgent?: string,
    success: boolean = true
  ): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('user_activity_log')
        .insert({
          user_id: userId,
          action,
          description,
          ip_address: ipAddress,
          user_agent: userAgent,
          success,
        })
        .select()
        .single();

      if (error) {
        logger.error('Error logging activity', { error });
        return '';
      }

      return data.id;
    } catch (error) {
      logger.error('Error in logActivity', { error });
      return '';
    }
  }

  /**
   * Get user activity log
   */
  static async getActivityLog(
    userId: string,
    filters?: UserActivityFilter
  ): Promise<{
    data: UserActivity[];
    total: number;
  }> {
    try {
      logger.info(`Getting activity log for user ${userId}`, { filters });

      let query = supabase
        .from('user_activity_log')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      if (filters?.action) {
        query = query.eq('action', filters.action);
      }

      if (filters?.start_date) {
        query = query.gte('created_at', filters.start_date);
      }

      if (filters?.end_date) {
        query = query.lte('created_at', filters.end_date);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(filters?.offset || 0, (filters?.offset || 0) + (filters?.limit || 50) - 1);

      if (error) throw error;

      return {
        data,
        total: count || 0,
      };
    } catch (error) {
      logger.error('Error getting activity log', { error, userId });
      throw error;
    }
  }

  /**
   * Set user preference
   */
  static async setPreference(userId: string, key: string, value: Record<string, any>): Promise<UserPreference> {
    try {
      logger.info(`Setting preference for user ${userId}`, { key });

      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          preference_key: key,
          preference_value: value,
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      logger.error('Error setting preference', { error, userId });
      throw error;
    }
  }

  /**
   * Get user preference
   */
  static async getPreference(userId: string, key: string): Promise<UserPreference | null> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .eq('preference_key', key)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data || null;
    } catch (error) {
      logger.error('Error getting preference', { error, userId });
      throw error;
    }
  }

  /**
   * Get all user preferences
   */
  static async getAllPreferences(userId: string): Promise<UserPreference[]> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data;
    } catch (error) {
      logger.error('Error getting all preferences', { error, userId });
      throw error;
    }
  }

  /**
   * Delete user preference
   */
  static async deletePreference(userId: string, key: string): Promise<void> {
    try {
      logger.info(`Deleting preference for user ${userId}`, { key });

      const { error } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', userId)
        .eq('preference_key', key);

      if (error) throw error;

      logger.info(`Preference deleted for user ${userId}`);
    } catch (error) {
      logger.error('Error deleting preference', { error, userId });
      throw error;
    }
  }

  /**
   * Enable two-factor authentication
   */
  static async enableTwoFactor(userId: string, method: 'email' | 'sms' | 'authenticator'): Promise<UserSettings> {
    try {
      logger.info(`Enabling 2FA for user ${userId}`, { method });

      const { data, error } = await supabase
        .from('user_settings')
        .update({
          two_factor_enabled: true,
          two_factor_method: method,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      await this.logActivity(userId, 'two_factor_enable', `Two-factor authentication enabled via ${method}`);

      return data;
    } catch (error) {
      logger.error('Error enabling 2FA', { error, userId });
      throw error;
    }
  }

  /**
   * Disable two-factor authentication
   */
  static async disableTwoFactor(userId: string): Promise<UserSettings> {
    try {
      logger.info(`Disabling 2FA for user ${userId}`);

      const { data, error } = await supabase
        .from('user_settings')
        .update({
          two_factor_enabled: false,
          two_factor_method: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      await this.logActivity(userId, 'two_factor_disable', 'Two-factor authentication disabled');

      return data;
    } catch (error) {
      logger.error('Error disabling 2FA', { error, userId });
      throw error;
    }
  }
}

export default UserSettingsService;
