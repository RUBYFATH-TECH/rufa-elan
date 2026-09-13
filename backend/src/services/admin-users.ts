/**
 * Admin User Management Service
 * Handles admin operations for viewing and managing user profiles
 */

import { supabase } from '../utils/supabase';
import { logger } from '../utils/logger';

export interface UserProfileForAdmin {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  total_orders: number;
  total_spent: number;
  review_count: number;
  wishlist_count: number;
  last_login?: string;
  last_activity?: string;
}

export interface UserListFilter {
  search?: string;
  sort_by?: 'created_at' | 'total_spent' | 'total_orders' | 'last_login';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface UserActivityForAdmin {
  id: string;
  user_id: string;
  email: string;
  action: string;
  description?: string;
  ip_address?: string;
  success: boolean;
  created_at: string;
}

export class AdminUsersService {
  /**
   * Get all users with their profile and stats
   */
  static async getAllUsers(filters?: UserListFilter): Promise<{
    data: UserProfileForAdmin[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const offset = (page - 1) * limit;

      logger.info('Admin: Getting all users', { filters });

      // Get users with stats using the database view
      let query = supabase
        .from('user_profiles_for_admin')
        .select('*', { count: 'exact' });

      // Search by email or full name
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        query = query.or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
      }

      // Sort
      const sortBy = filters?.sort_by || 'created_at';
      const sortOrder = filters?.sort_order || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error, count } = await query.range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        data,
        total: count || 0,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Error getting all users', { error });
      throw error;
    }
  }

  /**
   * Get single user profile with all details
   */
  static async getUserProfile(userId: string): Promise<UserProfileForAdmin> {
    try {
      logger.info(`Admin: Getting user profile ${userId}`);

      const { data, error } = await supabase
        .rpc('get_user_profile_with_stats', { user_id_param: userId })
        .single();

      if (error) throw error;
      if (!data) throw new Error('User not found');

      return data as any;
    } catch (error) {
      logger.error('Error getting user profile', { error, userId });
      throw error;
    }
  }

  /**
   * Get user's recent activity for admin review
   */
  static async getUserActivity(
    userId: string,
    limit: number = 50
  ): Promise<UserActivityForAdmin[]> {
    try {
      logger.info(`Admin: Getting user activity ${userId}`);

      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      const { data: auData, error: auError } = await supabase.auth.admin.getUserById(userId);
      if (auError && auError.code !== 'ERR_NOT_FOUND') {
        logger.warn('Could not get user email from auth', { error: auError });
      }

      const email = auData?.user?.email || 'unknown';

      const { data, error } = await supabase
        .from('user_activity_log')
        .select('id, action, description, ip_address, success, created_at, user_id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map((activity) => ({
        ...activity,
        email,
      }));
    } catch (error) {
      logger.error('Error getting user activity', { error, userId });
      throw error;
    }
  }

  /**
   * Get user settings (for admin viewing)
   */
  static async getUserSettings(userId: string): Promise<any> {
    try {
      logger.info(`Admin: Getting user settings for ${userId}`);

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data || null;
    } catch (error) {
      logger.error('Error getting user settings', { error, userId });
      throw error;
    }
  }

  /**
   * Get user's recent orders
   */
  static async getUserOrders(
    userId: string,
    limit: number = 10
  ): Promise<any[]> {
    try {
      logger.info(`Admin: Getting user orders for ${userId}`);

      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, status, total_amount, created_at, payment_status')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data;
    } catch (error) {
      logger.error('Error getting user orders', { error, userId });
      throw error;
    }
  }

  /**
   * Search users
   */
  static async searchUsers(searchTerm: string, limit: number = 20): Promise<any[]> {
    try {
      logger.info('Admin: Searching users', { searchTerm });

      if (!searchTerm || searchTerm.trim().length === 0) {
        throw new Error('Search term is required');
      }

      const term = `%${searchTerm.toLowerCase()}%`;

      const { data, error } = await supabase
        .from('user_profiles_for_admin')
        .select('id, email, full_name, phone, created_at')
        .or(`email.ilike.${term},full_name.ilike.${term}`)
        .limit(limit);

      if (error) throw error;

      return data;
    } catch (error) {
      logger.error('Error searching users', { error, searchTerm });
      throw error;
    }
  }

  /**
   * Get users by signup date range
   */
  static async getUsersByDateRange(
    startDate: string,
    endDate: string,
    limit: number = 100
  ): Promise<any[]> {
    try {
      logger.info('Admin: Getting users by date range', { startDate, endDate });

      const { data, error } = await supabase
        .from('user_profiles_for_admin')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data;
    } catch (error) {
      logger.error('Error getting users by date range', { error });
      throw error;
    }
  }

  /**
   * Get top spending users
   */
  static async getTopSpenders(limit: number = 10): Promise<any[]> {
    try {
      logger.info('Admin: Getting top spenders');

      const { data, error } = await supabase
        .from('user_profiles_for_admin')
        .select('*')
        .order('total_spent', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data;
    } catch (error) {
      logger.error('Error getting top spenders', { error });
      throw error;
    }
  }

  /**
   * Get most active users
   */
  static async getMostActiveUsers(limit: number = 10): Promise<any[]> {
    try {
      logger.info('Admin: Getting most active users');

      const { data, error } = await supabase
        .from('user_profiles_for_admin')
        .select('*')
        .order('total_orders', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data;
    } catch (error) {
      logger.error('Error getting most active users', { error });
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStatistics(): Promise<{
    total_users: number;
    new_users_today: number;
    new_users_this_month: number;
    avg_order_value: number;
    total_revenue: number;
  }> {
    try {
      logger.info('Admin: Getting user statistics');

      // Total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // New users today
      const today = new Date().toISOString().split('T')[0];
      const { count: newToday } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${today}T00:00:00`);

      // New users this month
      const monthStart = new Date();
      monthStart.setDate(1);
      const monthStartStr = monthStart.toISOString().split('T')[0];
      const { count: newThisMonth } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${monthStartStr}T00:00:00`);

      // Revenue stats
      const { data: revenueData, error: revenueError } = await supabase
        .from('orders')
        .select('total_amount');

      if (revenueError) {
        logger.warn('Could not get revenue data', { error: revenueError });
      }

      const orders = revenueData || [];
      const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0);
      const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

      return {
        total_users: totalUsers || 0,
        new_users_today: newToday || 0,
        new_users_this_month: newThisMonth || 0,
        avg_order_value: parseFloat(avgOrderValue.toFixed(2)),
        total_revenue: parseFloat(totalRevenue.toFixed(2)),
      };
    } catch (error) {
      logger.error('Error getting user statistics', { error });
      throw error;
    }
  }

  /**
   * Export user data (for privacy/GDPR)
   */
  static async exportUserData(userId: string): Promise<any> {
    try {
      logger.info(`Admin: Exporting user data for ${userId}`);

      const profile = await this.getUserProfile(userId);
      const settings = await this.getUserSettings(userId);
      const activity = await this.getUserActivity(userId, 100);
      const orders = await this.getUserOrders(userId, 50);

      return {
        profile,
        settings,
        activity,
        orders,
        export_date: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Error exporting user data', { error, userId });
      throw error;
    }
  }

  /**
   * Get suspicious activity alerts
   */
  static async getSuspiciousActivity(limit: number = 50): Promise<UserActivityForAdmin[]> {
    try {
      logger.info('Admin: Getting suspicious activities');

      // Get failed login attempts and other suspicious actions
      const { data, error } = await supabase
        .from('user_activity_log')
        .select('id, user_id, action, description, ip_address, success, created_at')
        .or('success.eq.false,action.eq.suspicious_activity')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Get emails for users
      const userIds = [...new Set(data.map((d) => d.user_id))];
      const activities: UserActivityForAdmin[] = [];

      for (const activity of data) {
        try {
          const { data: auData } = await supabase.auth.admin.getUserById(activity.user_id);
          activities.push({
            ...activity,
            email: auData?.user?.email || 'unknown',
          });
        } catch (e) {
          activities.push({
            ...activity,
            email: 'unknown',
          });
        }
      }

      return activities;
    } catch (error) {
      logger.error('Error getting suspicious activity', { error });
      throw error;
    }
  }
}

export default AdminUsersService;
