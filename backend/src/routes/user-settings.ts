/**
 * User Settings API Routes
 * Handles user profile, settings, and account management
 */

import { Router, Request, Response } from 'express';
import UserSettingsService from '../services/user-settings';
import {
  validateUserSettingsUpdate,
  validateProfileUpdate,
  validatePasswordChange,
  validateUserPreference,
  validateUserActivityFilter,
} from '../validation/user-settings';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /user-settings/profile
 * Get current user's profile
 */
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const profile = await UserSettingsService.getUserProfile(userId);

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    logger.error('Error getting profile', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get profile',
    });
  }
});

/**
 * PUT /user-settings/profile
 * Update user profile
 */
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const update = validateProfileUpdate(req.body);
    const profile = await UserSettingsService.updateProfile(userId, update);

    res.json({
      success: true,
      data: profile,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    logger.error('Error updating profile', { error });
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'Failed to update profile',
    });
  }
});

/**
 * GET /user-settings/settings
 * Get current user's settings
 */
router.get('/settings', async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const settings = await UserSettingsService.getUserSettings(userId);

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    logger.error('Error getting settings', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get settings',
    });
  }
});

/**
 * PUT /user-settings/settings
 * Update user settings
 */
router.put('/settings', async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const update = validateUserSettingsUpdate(req.body);
    const settings = await UserSettingsService.updateSettings(userId, update);

    res.json({
      success: true,
      data: settings,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    logger.error('Error updating settings', { error });
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'Failed to update settings',
    });
  }
});

/**
 * POST /user-settings/change-password
 * Change user password
 */
router.post('/change-password', async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const passwordChange = validatePasswordChange(req.body);

    // Get IP and user agent
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    const result = await UserSettingsService.changePassword(userId, passwordChange, ipAddress, userAgent);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error changing password', { error });
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'Failed to change password',
    });
  }
});

/**
 * GET /user-settings/activity
 * Get user activity log
 */
router.get('/activity', async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const filters = validateUserActivityFilter({
      action: req.query.action,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      limit: req.query.limit,
      offset: req.query.offset,
    });

    const result = await UserSettingsService.getActivityLog(userId, filters);

    res.json({
      success: true,
      data: result.data,
      total: result.total,
    });
  } catch (error) {
    logger.error('Error getting activity log', { error });
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'Failed to get activity log',
    });
  }
});

/**
 * GET /user-settings/preferences
 * Get all user preferences
 */
router.get('/preferences', async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const preferences = await UserSettingsService.getAllPreferences(userId);

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    logger.error('Error getting preferences', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get preferences',
    });
  }
});

/**
 * GET /user-settings/preferences/:key
 * Get specific user preference
 */
router.get('/preferences/:key', async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { key } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    if (!key) {
      return res.status(400).json({
        success: false,
        error: 'Preference key is required',
      });
    }

    const preference = await UserSettingsService.getPreference(userId, key);

    if (!preference) {
      return res.status(404).json({
        success: false,
        error: 'Preference not found',
      });
    }

    res.json({
      success: true,
      data: preference,
    });
  } catch (error) {
    logger.error('Error getting preference', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get preference',
    });
  }
});

/**
 * POST /user-settings/preferences
 * Set user preference
 */
router.post('/preferences', async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const preference = validateUserPreference(req.body);
    const result = await UserSettingsService.setPreference(userId, preference.preference_key, preference.preference_value);

    res.status(201).json({
      success: true,
      data: result,
      message: 'Preference saved successfully',
    });
  } catch (error) {
    logger.error('Error setting preference', { error });
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'Failed to set preference',
    });
  }
});

/**
 * DELETE /user-settings/preferences/:key
 * Delete user preference
 */
router.delete('/preferences/:key', async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { key } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    if (!key) {
      return res.status(400).json({
        success: false,
        error: 'Preference key is required',
      });
    }

    await UserSettingsService.deletePreference(userId, key);

    res.json({
      success: true,
      message: 'Preference deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting preference', { error });
    res.status(400).json({
      success: false,
      error: 'Failed to delete preference',
    });
  }
});

/**
 * POST /user-settings/two-factor/enable
 * Enable two-factor authentication
 */
router.post('/two-factor/enable', async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { method } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    if (!['email', 'sms', 'authenticator'].includes(method)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid method. Must be email, sms, or authenticator',
      });
    }

    const settings = await UserSettingsService.enableTwoFactor(userId, method);

    res.json({
      success: true,
      data: settings,
      message: 'Two-factor authentication enabled',
    });
  } catch (error) {
    logger.error('Error enabling 2FA', { error });
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'Failed to enable two-factor authentication',
    });
  }
});

/**
 * POST /user-settings/two-factor/disable
 * Disable two-factor authentication
 */
router.post('/two-factor/disable', async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const settings = await UserSettingsService.disableTwoFactor(userId);

    res.json({
      success: true,
      data: settings,
      message: 'Two-factor authentication disabled',
    });
  } catch (error) {
    logger.error('Error disabling 2FA', { error });
    res.status(400).json({
      success: false,
      error: (error as Error).message || 'Failed to disable two-factor authentication',
    });
  }
});

export default router;
