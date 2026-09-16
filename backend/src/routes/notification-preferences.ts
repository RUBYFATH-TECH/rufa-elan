/**
 * Notification Preferences API Routes
 * Handles user notification preference settings
 */

import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/database';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /notification-preferences
 * Get current user's notification preferences
 */
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { data, error } = await req.db!
      .from('user_settings')
      .select('preferences')
      .eq('user_id', req.userId)
      .single();

    if (error) {
      // If no settings exist, return defaults
      const { data: defaults } = await req.db!
        .rpc('get_default_notification_preferences');

      return res.json({
        success: true,
        data: defaults || {},
      });
    }

    res.json({
      success: true,
      data: data?.preferences || {},
    });
  } catch (error) {
    logger.error('Error getting notification preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get notification preferences',
    });
  }
});

/**
 * PUT /notification-preferences
 * Update notification preferences
 */
router.put('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { preferences } = req.body;

    if (!preferences) {
      return res.status(400).json({
        success: false,
        error: 'Preferences object is required',
      });
    }

    // Check if user_settings record exists
    const { data: existing } = await req.db!
      .from('user_settings')
      .select('id')
      .eq('user_id', req.userId)
      .single();

    if (!existing) {
      // Create new settings record
      const { data, error } = await req.db!
        .from('user_settings')
        .insert({
          user_id: req.userId,
          preferences,
        })
        .select('preferences')
        .single();

      if (error) {
        logger.error('Error creating notification preferences:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to save preferences',
        });
      }

      return res.json({
        success: true,
        data: data.preferences,
        message: 'Preferences saved successfully',
      });
    }

    // Update existing settings
    const { data, error } = await req.db!
      .from('user_settings')
      .update({ preferences })
      .eq('user_id', req.userId)
      .select('preferences')
      .single();

    if (error) {
      logger.error('Error updating notification preferences:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update preferences',
      });
    }

    logger.info(`Updated notification preferences for user: ${req.userId}`);

    res.json({
      success: true,
      data: data.preferences,
      message: 'Preferences updated successfully',
    });
  } catch (error) {
    logger.error('Error updating notification preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update preferences',
    });
  }
});

/**
 * PUT /notification-preferences/:category/:preference
 * Update a specific notification preference
 */
router.put('/:category/:preference', requireAuth, async (req: Request, res: Response) => {
  try {
    const { category, preference } = req.params;
    const { enabled, channels } = req.body;

    if (enabled === undefined) {
      return res.status(400).json({
        success: false,
        error: 'enabled field is required',
      });
    }

    // Get current preferences
    const { data: current } = await req.db!
      .from('user_settings')
      .select('preferences')
      .eq('user_id', req.userId)
      .single();

    let preferences = current?.preferences || {};

    // If preferences is empty, get defaults
    if (!preferences || Object.keys(preferences).length === 0) {
      const { data: defaults } = await req.db!
        .rpc('get_default_notification_preferences');
      preferences = defaults || {};
    }

    // Update the specific preference
    if (!preferences.notifications) {
      preferences.notifications = {};
    }
    if (!preferences.notifications[category]) {
      preferences.notifications[category] = {};
    }
    
    preferences.notifications[category][preference] = {
      enabled,
      channels: channels || preferences.notifications[category][preference]?.channels || ['push'],
    };

    // Save updated preferences
    const { data, error } = await req.db!
      .from('user_settings')
      .upsert({
        user_id: req.userId,
        preferences,
      })
      .select('preferences')
      .single();

    if (error) {
      logger.error('Error updating specific preference:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update preference',
      });
    }

    logger.info(`Updated ${category}.${preference} preference for user: ${req.userId}`);

    res.json({
      success: true,
      data: data.preferences,
      message: 'Preference updated successfully',
    });
  } catch (error) {
    logger.error('Error updating specific preference:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update preference',
    });
  }
});

/**
 * GET /notification-preferences/defaults
 * Get default notification preferences structure
 */
router.get('/defaults', async (req: Request, res: Response) => {
  try {
    const { data, error } = await req.db!
      .rpc('get_default_notification_preferences');

    if (error) {
      logger.error('Error getting default preferences:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to get default preferences',
      });
    }

    res.json({
      success: true,
      data: data || {},
    });
  } catch (error) {
    logger.error('Error getting default preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get default preferences',
    });
  }
});

/**
 * POST /notification-preferences/reset
 * Reset notification preferences to defaults
 */
router.post('/reset', requireAuth, async (req: Request, res: Response) => {
  try {
    // Get default preferences
    const { data: defaults, error: defaultsError } = await req.db!
      .rpc('get_default_notification_preferences');

    if (defaultsError) {
      logger.error('Error getting default preferences:', defaultsError);
      return res.status(500).json({
        success: false,
        error: 'Failed to reset preferences',
      });
    }

    // Update user settings with defaults
    const { data, error } = await req.db!
      .from('user_settings')
      .upsert({
        user_id: req.userId,
        preferences: defaults,
      })
      .select('preferences')
      .single();

    if (error) {
      logger.error('Error resetting preferences:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to reset preferences',
      });
    }

    logger.info(`Reset notification preferences to defaults for user: ${req.userId}`);

    res.json({
      success: true,
      data: data.preferences,
      message: 'Preferences reset to defaults',
    });
  } catch (error) {
    logger.error('Error resetting preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset preferences',
    });
  }
});

export default router;
