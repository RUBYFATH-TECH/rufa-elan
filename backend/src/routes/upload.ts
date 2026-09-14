/**
 * Upload API routes for RUFA ELAN e-commerce application
 * Handles image uploads to Supabase Storage
 */

import express from 'express';
import { Request, Response } from 'express';
import { supabaseAdmin } from '../utils/supabase';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types/database';

const router = express.Router();

/**
 * Helper function to upload image to Supabase Storage
 */
async function uploadImageToStorage(
  base64Image: string,
  bucket: string,
  filePath: string,
  contentType: string = 'image/jpeg'
) {
  // Convert base64 to buffer
  const base64String = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');
  const buffer = Buffer.from(base64String, 'base64');

  logger.info('Uploading to Supabase Storage', {
    bucket,
    path: filePath,
    size: buffer.length
  });

  // Upload to Supabase Storage
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(filePath, buffer, {
      contentType,
      upsert: true, // Allow overwrite for avatars
    });

  if (error) {
    logger.error('Supabase Storage upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }

  logger.info('File uploaded to Supabase Storage', { path: data.path });

  // Get public URL
  const { data: urlData } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return {
    url: urlData.publicUrl,
    path: filePath,
  };
}

/**
 * POST /api/upload/avatar
 * Upload user avatar image to Supabase Storage
 * Body: { image: base64_string, userId?: string }
 */
router.post('/avatar', async (req: Request, res: Response) => {
  try {
    const { image, userId } = req.body;

    logger.info('Avatar upload request received', {
      hasImage: !!image,
      userId,
    });

    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'Missing image data',
        message: 'Image base64 string is required'
      } as ApiResponse);
    }

    // Validate base64 format
    if (!image.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image format',
        message: 'Image must be a valid base64 data URL'
      } as ApiResponse);
    }

    // Generate filename
    const filename = `avatar-${userId || 'unknown'}-${Date.now()}.jpg`;
    const filePath = `avatars/${filename}`;
    const bucket = 'product-images'; // Use same bucket as products

    // Upload image
    const uploadResult = await uploadImageToStorage(image, bucket, filePath);

    logger.info('Avatar uploaded successfully', {
      filename,
      url: uploadResult.url,
    });

    return res.json({
      success: true,
      data: {
        url: uploadResult.url,
        filename,
        path: uploadResult.path,
      },
      message: 'Avatar uploaded successfully'
    } as ApiResponse);

  } catch (error) {
    logger.error('Avatar upload error:', error);
    return res.status(500).json({
      success: false,
      error: 'Upload failed',
      message: error instanceof Error ? error.message : 'Failed to upload avatar'
    } as ApiResponse);
  }
});

/**
 * POST /api/upload
 * Upload image to Supabase Storage (generic product images)
 * Body: { image: base64_string, filename?: string }
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { image, filename } = req.body;

    logger.info('Upload request received', {
      hasImage: !!image,
      imageLength: image ? (image.length > 100 ? image.length + ' bytes' : 'small') : 0,
      filename
    });

    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'Missing image data',
        message: 'Image base64 string is required'
      } as ApiResponse);
    }

    // Validate base64 format
    if (!image.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image format',
        message: 'Image must be a valid base64 data URL'
      } as ApiResponse);
    }

    logger.info('Image validation passed, uploading to Supabase Storage');

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const uploadFilename = filename || `product-${timestamp}-${randomStr}.jpg`;
    const filePath = `products/${uploadFilename}`;
    const bucket = 'product-images';

    // Upload image
    const uploadResult = await uploadImageToStorage(image, bucket, filePath);

    logger.info('Image uploaded successfully to Supabase Storage', {
      filename: uploadFilename,
      url: uploadResult.url,
    });

    res.json({
      success: true,
      data: {
        url: uploadResult.url,
        filename: uploadFilename,
        path: uploadResult.path,
      },
      message: 'Image uploaded successfully'
    } as ApiResponse);

  } catch (error) {
    logger.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Upload failed',
      message: error instanceof Error ? error.message : 'Failed to upload image'
    } as ApiResponse);
  }
});

export default router;
