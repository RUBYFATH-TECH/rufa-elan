import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

// Validate environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL environment variable');
}

if (!supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing SUPABASE_ANON_KEY environment variable');
}

// Create Supabase clients
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('_health_check')
      .select('*')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = table not found, which is expected
      logger.error('Supabase connection test failed:', error);
      return false;
    }
    
    logger.info('Supabase connection successful');
    return true;
  } catch (error) {
    logger.error('Supabase connection error:', error);
    return false;
  }
};

// Helper functions for common operations
export const supabaseHelpers = {
  // User management
  async createUser(email: string, password: string, metadata?: any) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata
    });
    
    if (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
    
    return data.user;
  },

  async getUserById(id: string) {
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(id);
    
    if (error) {
      logger.error('Error fetching user:', error);
      throw error;
    }
    
    return data.user;
  },

  async updateUser(id: string, updates: any) {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(id, updates);
    
    if (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
    
    return data.user;
  },

  async deleteUser(id: string) {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    
    if (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
    
    return true;
  },

  // Storage helpers
  async uploadFile(bucket: string, path: string, file: Buffer | File, options?: any) {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, file, options);
    
    if (error) {
      logger.error('Error uploading file:', error);
      throw error;
    }
    
    return data;
  },

  async getFileUrl(bucket: string, path: string) {
    const { data } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  },

  async deleteFile(bucket: string, path: string) {
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([path]);
    
    if (error) {
      logger.error('Error deleting file:', error);
      throw error;
    }
    
    return true;
  },

  // Database helpers
  async insertRecord(table: string, record: any) {
    const { data, error } = await supabaseAdmin
      .from(table)
      .insert(record)
      .select()
      .single();
    
    if (error) {
      logger.error(`Error inserting record into ${table}:`, error);
      throw error;
    }
    
    return data;
  },

  async updateRecord(table: string, id: string, updates: any) {
    const { data, error } = await supabaseAdmin
      .from(table)
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      logger.error(`Error updating record in ${table}:`, error);
      throw error;
    }
    
    return data;
  },

  async getRecord(table: string, id: string) {
    const { data, error } = await supabaseAdmin
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      logger.error(`Error fetching record from ${table}:`, error);
      throw error;
    }
    
    return data;
  },

  async deleteRecord(table: string, id: string) {
    const { error } = await supabaseAdmin
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) {
      logger.error(`Error deleting record from ${table}:`, error);
      throw error;
    }
    
    return true;
  }
};

export default supabase;