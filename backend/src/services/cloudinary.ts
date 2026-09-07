import { logger } from '../utils/logger';
import { serviceConfig } from '../config/services';

// Note: This is a basic implementation. For production, you might want to install cloudinary SDK
// npm install cloudinary @types/cloudinary

export interface CloudinaryUploadOptions {
  folder?: string;
  public_id?: string;
  format?: string;
  quality?: string | number;
  width?: number;
  height?: number;
  crop?: string;
  transformation?: any[];
}

export interface CloudinaryUploadResult {
  public_id: string;
  url: string;
  secure_url: string;
  format: string;
  resource_type: string;
  bytes: number;
  width: number;
  height: number;
  created_at: string;
}

class CloudinaryService {
  private readonly cloudName = serviceConfig.cloudinary.cloudName;
  private readonly apiKey = serviceConfig.cloudinary.apiKey;
  private readonly apiSecret = serviceConfig.cloudinary.apiSecret;
  private readonly uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

  // Generate signature for authenticated uploads
  private generateSignature(params: any, timestamp: number): string {
    const crypto = require('crypto');
    
    // Sort parameters
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as any);

    // Create signature string
    const signatureString = Object.entries(sortedParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&') + this.apiSecret;

    return crypto
      .createHash('sha1')
      .update(signatureString)
      .digest('hex');
  }

  async uploadFile(
    file: Buffer | string, 
    options: CloudinaryUploadOptions = {}
  ): Promise<CloudinaryUploadResult> {
    try {
      const FormData = require('form-data');
      const fetch = require('node-fetch');
      
      const form = new FormData();
      const timestamp = Math.round(Date.now() / 1000);

      // Prepare upload parameters
      const params: any = {
        timestamp,
        folder: options.folder || 'rufa_elan',
        ...options,
      };

      // Remove undefined values
      Object.keys(params).forEach(key => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      // Generate signature
      const signature = this.generateSignature(params, timestamp);

      // Add parameters to form
      Object.entries(params).forEach(([key, value]) => {
        form.append(key, value);
      });

      form.append('api_key', this.apiKey);
      form.append('signature', signature);
      form.append('file', file);

      const response = await fetch(this.uploadUrl, {
        method: 'POST',
        body: form,
      });

      const result = await response.json();

      if (!response.ok) {
        logger.error('Cloudinary upload error:', result);
        throw new Error(result.error?.message || 'Cloudinary upload failed');
      }

      logger.info('File uploaded to Cloudinary:', { 
        public_id: result.public_id,
        url: result.secure_url 
      });

      return result;
    } catch (error) {
      logger.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  }

  async uploadBase64(
    base64Data: string, 
    options: CloudinaryUploadOptions = {}
  ): Promise<CloudinaryUploadResult> {
    try {
      // Remove data URL prefix if present
      const base64String = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
      const buffer = Buffer.from(base64String, 'base64');
      
      return await this.uploadFile(buffer, options);
    } catch (error) {
      logger.error('Error uploading base64 to Cloudinary:', error);
      throw error;
    }
  }

  async deleteFile(publicId: string): Promise<boolean> {
    try {
      const fetch = require('node-fetch');
      const FormData = require('form-data');
      
      const form = new FormData();
      const timestamp = Math.round(Date.now() / 1000);

      const params = {
        public_id: publicId,
        timestamp,
      };

      const signature = this.generateSignature(params, timestamp);

      form.append('public_id', publicId);
      form.append('timestamp', timestamp.toString());
      form.append('api_key', this.apiKey);
      form.append('signature', signature);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`,
        {
          method: 'POST',
          body: form,
        }
      );

      const result = await response.json();

      if (result.result === 'ok') {
        logger.info('File deleted from Cloudinary:', { public_id: publicId });
        return true;
      } else {
        logger.error('Error deleting file from Cloudinary:', result);
        return false;
      }
    } catch (error) {
      logger.error('Error deleting file from Cloudinary:', error);
      throw error;
    }
  }

  generateUrl(
    publicId: string, 
    transformations: any = {}
  ): string {
    const baseUrl = `https://res.cloudinary.com/${this.cloudName}/image/upload`;
    
    if (Object.keys(transformations).length === 0) {
      return `${baseUrl}/${publicId}`;
    }

    // Build transformation string
    const transformArray = [];
    
    if (transformations.width) transformArray.push(`w_${transformations.width}`);
    if (transformations.height) transformArray.push(`h_${transformations.height}`);
    if (transformations.crop) transformArray.push(`c_${transformations.crop}`);
    if (transformations.quality) transformArray.push(`q_${transformations.quality}`);
    if (transformations.format) transformArray.push(`f_${transformations.format}`);

    const transformString = transformArray.join(',');
    
    return `${baseUrl}/${transformString}/${publicId}`;
  }

  // Utility function to validate image format
  isValidImageFormat(format: string): boolean {
    const validFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff'];
    return validFormats.includes(format.toLowerCase());
  }

  // Get optimized image URL
  getOptimizedImageUrl(
    publicId: string, 
    options: {
      width?: number;
      height?: number;
      quality?: string | number;
      format?: string;
    } = {}
  ): string {
    const transformations = {
      quality: options.quality || 'auto',
      format: options.format || 'auto',
      ...options,
    };

    return this.generateUrl(publicId, transformations);
  }
}

export const cloudinaryService = new CloudinaryService();
export default cloudinaryService;