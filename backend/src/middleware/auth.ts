import { Request, Response, NextFunction } from 'express';
import { createServerComponentSupabaseClient } from '@/lib/supabase-server';

/**
 * Verify admin token middleware
 * Checks if user is authenticated and is an admin
 */
export async function verifyAdminToken(req: Request, res: Response, next: NextFunction) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token with Supabase
    const supabase = createServerComponentSupabaseClient();
    
    // Note: In a real implementation, you'd verify the JWT token with Supabase
    // For now, we'll use a placeholder approach
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
    }

    // Attach user to request for use in route handlers
    (req as any).user = user;
    (req as any).userId = user.id;

    next();
  } catch (error: any) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error',
    });
  }
}

/**
 * Verify user token middleware
 * Checks if user is authenticated (admin or regular user)
 */
export async function verifyUserToken(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header',
      });
    }

    const token = authHeader.substring(7);
    const supabase = createServerComponentSupabaseClient();

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }

    (req as any).user = user;
    (req as any).userId = user.id;

    next();
  } catch (error: any) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error',
    });
  }
}

/**
 * Optional auth middleware
 * Attaches user info if authenticated, but doesn't require it
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const supabase = createServerComponentSupabaseClient();

      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (!error && user) {
        (req as any).user = user;
        (req as any).userId = user.id;
      }
    }

    next();
  } catch (error) {
    // If auth fails, just continue without user context
    next();
  }
}
