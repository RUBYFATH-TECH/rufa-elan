/**
 * Validation schemas for user settings and profile updates
 */

export interface UserSettingsUpdate {
  email_notifications?: boolean;
  sms_notifications?: boolean;
  push_notifications?: boolean;
  newsletter_subscribed?: boolean;
  two_factor_enabled?: boolean;
  two_factor_method?: 'email' | 'sms' | 'authenticator';
  language?: string;
  timezone?: string;
  currency?: string;
  theme?: 'light' | 'dark' | 'auto';
  items_per_page?: number;
  show_profile_public?: boolean;
  allow_marketing_emails?: boolean;
  allow_personalization?: boolean;
  additional_settings?: Record<string, any>;
}

export interface ProfileUpdate {
  full_name?: string;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface UserPreference {
  preference_key: string;
  preference_value: Record<string, any>;
}

export interface UserActivityFilter {
  action?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

// Validation functions
export function validateUserSettingsUpdate(data: any): UserSettingsUpdate {
  const update: UserSettingsUpdate = {};

  if (data.email_notifications !== undefined) {
    if (typeof data.email_notifications !== 'boolean') {
      throw new Error('email_notifications must be a boolean');
    }
    update.email_notifications = data.email_notifications;
  }

  if (data.sms_notifications !== undefined) {
    if (typeof data.sms_notifications !== 'boolean') {
      throw new Error('sms_notifications must be a boolean');
    }
    update.sms_notifications = data.sms_notifications;
  }

  if (data.push_notifications !== undefined) {
    if (typeof data.push_notifications !== 'boolean') {
      throw new Error('push_notifications must be a boolean');
    }
    update.push_notifications = data.push_notifications;
  }

  if (data.newsletter_subscribed !== undefined) {
    if (typeof data.newsletter_subscribed !== 'boolean') {
      throw new Error('newsletter_subscribed must be a boolean');
    }
    update.newsletter_subscribed = data.newsletter_subscribed;
  }

  if (data.two_factor_enabled !== undefined) {
    if (typeof data.two_factor_enabled !== 'boolean') {
      throw new Error('two_factor_enabled must be a boolean');
    }
    update.two_factor_enabled = data.two_factor_enabled;
  }

  if (data.two_factor_method !== undefined) {
    if (!['email', 'sms', 'authenticator'].includes(data.two_factor_method)) {
      throw new Error('two_factor_method must be email, sms, or authenticator');
    }
    update.two_factor_method = data.two_factor_method;
  }

  if (data.language !== undefined) {
    if (typeof data.language !== 'string' || data.language.trim().length === 0) {
      throw new Error('language must be a non-empty string');
    }
    update.language = data.language.trim();
  }

  if (data.timezone !== undefined) {
    if (typeof data.timezone !== 'string' || data.timezone.trim().length === 0) {
      throw new Error('timezone must be a non-empty string');
    }
    update.timezone = data.timezone.trim();
  }

  if (data.currency !== undefined) {
    if (typeof data.currency !== 'string' || data.currency.trim().length === 0) {
      throw new Error('currency must be a non-empty string');
    }
    update.currency = data.currency.trim();
  }

  if (data.theme !== undefined) {
    if (!['light', 'dark', 'auto'].includes(data.theme)) {
      throw new Error('theme must be light, dark, or auto');
    }
    update.theme = data.theme;
  }

  if (data.items_per_page !== undefined) {
    const itemsPerPage = parseInt(data.items_per_page);
    if (isNaN(itemsPerPage) || itemsPerPage < 10 || itemsPerPage > 100) {
      throw new Error('items_per_page must be between 10 and 100');
    }
    update.items_per_page = itemsPerPage;
  }

  if (data.show_profile_public !== undefined) {
    if (typeof data.show_profile_public !== 'boolean') {
      throw new Error('show_profile_public must be a boolean');
    }
    update.show_profile_public = data.show_profile_public;
  }

  if (data.allow_marketing_emails !== undefined) {
    if (typeof data.allow_marketing_emails !== 'boolean') {
      throw new Error('allow_marketing_emails must be a boolean');
    }
    update.allow_marketing_emails = data.allow_marketing_emails;
  }

  if (data.allow_personalization !== undefined) {
    if (typeof data.allow_personalization !== 'boolean') {
      throw new Error('allow_personalization must be a boolean');
    }
    update.allow_personalization = data.allow_personalization;
  }

  if (data.additional_settings !== undefined) {
    if (typeof data.additional_settings !== 'object' || Array.isArray(data.additional_settings)) {
      throw new Error('additional_settings must be an object');
    }
    update.additional_settings = data.additional_settings;
  }

  return update;
}

export function validateProfileUpdate(data: any): ProfileUpdate {
  const update: ProfileUpdate = {};

  if (data.full_name !== undefined) {
    if (typeof data.full_name !== 'string') {
      throw new Error('full_name must be a string');
    }
    if (data.full_name.trim().length > 0) {
      update.full_name = data.full_name.trim();
    }
  }

  return update;
}

export function validatePasswordChange(data: any): PasswordChangeRequest {
  if (!data.current_password || typeof data.current_password !== 'string') {
    throw new Error('current_password is required and must be a string');
  }

  if (!data.new_password || typeof data.new_password !== 'string') {
    throw new Error('new_password is required and must be a string');
  }

  if (data.new_password.length < 8) {
    throw new Error('new_password must be at least 8 characters long');
  }

  if (!data.confirm_password || typeof data.confirm_password !== 'string') {
    throw new Error('confirm_password is required and must be a string');
  }

  if (data.new_password !== data.confirm_password) {
    throw new Error('new_password and confirm_password do not match');
  }

  if (data.current_password === data.new_password) {
    throw new Error('new_password must be different from current_password');
  }

  return {
    current_password: data.current_password,
    new_password: data.new_password,
    confirm_password: data.confirm_password,
  };
}

export function validateUserPreference(data: any): UserPreference {
  if (!data.preference_key || typeof data.preference_key !== 'string') {
    throw new Error('preference_key is required and must be a string');
  }

  if (!data.preference_value || typeof data.preference_value !== 'object' || Array.isArray(data.preference_value)) {
    throw new Error('preference_value is required and must be an object');
  }

  return {
    preference_key: data.preference_key.trim(),
    preference_value: data.preference_value,
  };
}

export function validateUserActivityFilter(data: any): UserActivityFilter {
  const filter: UserActivityFilter = {};

  if (data.action !== undefined) {
    if (typeof data.action !== 'string' || data.action.trim().length === 0) {
      throw new Error('action must be a non-empty string');
    }
    filter.action = data.action.trim();
  }

  if (data.start_date !== undefined) {
    const date = new Date(data.start_date);
    if (isNaN(date.getTime())) {
      throw new Error('start_date must be a valid date');
    }
    filter.start_date = data.start_date;
  }

  if (data.end_date !== undefined) {
    const date = new Date(data.end_date);
    if (isNaN(date.getTime())) {
      throw new Error('end_date must be a valid date');
    }
    filter.end_date = data.end_date;
  }

  if (data.limit !== undefined) {
    const limit = parseInt(data.limit);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      throw new Error('limit must be between 1 and 100');
    }
    filter.limit = limit;
  }

  if (data.offset !== undefined) {
    const offset = parseInt(data.offset);
    if (isNaN(offset) || offset < 0) {
      throw new Error('offset must be a non-negative integer');
    }
    filter.offset = offset;
  }

  return filter;
}

// Constants
export const TIMEZONE_OPTIONS = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Africa/Lagos',
  'Africa/Johannesburg',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
];

export const LANGUAGE_OPTIONS = [
  'en',
  'es',
  'fr',
  'de',
  'it',
  'pt',
  'ja',
  'zh',
  'ar',
  'hi',
];

export const CURRENCY_OPTIONS = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'CNY',
  'INR',
  'GHS',
  'NGN',
  'ZAR',
];

export const ACTIVITY_ACTIONS = [
  'login',
  'logout',
  'password_change',
  'email_change',
  'settings_update',
  'profile_update',
  'two_factor_enable',
  'two_factor_disable',
  'suspicious_activity',
];
