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
  // Only parameters that should be signed for Cloudinary API
  private generateSignature(params: any): string {
    const crypto = require('crypto');
    
    // Create signature string with all parameters that will be uploaded
    // Sort by key and format as key1=value1&key2=value2&...&api_secret
    const sortedKeys = Object.keys(params).sort();
    
    const signatureString = sortedKeys
      .map(key => `${key}=${params[key]}`)
      .join('&') + this.apiSecret;

    logger.info('Generating Cloudinary signature', {
      params: sortedKeys,
      apiKey: this.apiKey.substring(0, 5) + '...',
      apiSecret: this.apiSecret.substring(0, 5) + '...',
      signatureBase: sortedKeys.map(key => `${key}=${params[key]}`).join('&'),
    });

    const hash = crypto
      .createHash('sha1')
      .update(signatureString)
      .digest('hex');
    
    logger.info('Signature generated:', { hash: hash.substring(0, 10) + '...' });
    
    return hash;
  }

  async uploadFile(
    file: Buffer | string, 
    options: CloudinaryUploadOptions = {}
  ): Promise<CloudinaryUploadResult> {
    try {
      const FormData = require('form-data');
      const folder = options.folder || 'rufa_elan';

      // Use simple unsigned upload without requiring any preset
      // Just send file + folder, let Cloudinary handle it
      const form = new FormData();
      form.append('file', file);
      form.append('folder', folder);

      if (options.public_id) {
        form.append('public_id', options.public_id);
      }

      const fetchFn = typeof fetch !== 'undefined' ? fetch : require('node-fetch').default;
      
      logger.info('Uploading to Cloudinary (simple unsigned)', {
        cloudName: this.cloudName,
        folder,
      });

      const response = await fetchFn(this.uploadUrl, {
        method: 'POST',
        body: form,
        headers: form.getHeaders ? form.getHeaders() : {},
      });

      const responseText = await response.text();

      logger.info('Cloudinary response', {
        status: response.status,
        bodyLength: responseText.length,
      });
      
      if (!response.ok) {
        logger.error('Cloudinary error:', {
          status: response.status,
          body: responseText.substring(0, 500),
        });
        
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.error?.message || errorData.message || `Upload failed ${response.status}`);
        } catch (e) {
          throw new Error(responseText || `Upload failed ${response.status}`);
        }
      }

      const result = JSON.parse(responseText);

      logger.info('Upload successful', { 
        public_id: result.public_id,
        url: result.secure_url 
      });

      return result;
    } catch (error) {
      logger.error('Upload error:', error);
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
      const FormData = require('form-data');
      const fetchFn = typeof fetch !== 'undefined' ? fetch : require('node-fetch').default;
      
      const form = new FormData();
      const timestamp = Math.round(Date.now() / 1000);

      // Parameters FOR SIGNATURE (not including api_key)
      const params = {
        public_id: publicId,
        timestamp,
      };

      const signature = this.generateSignature(params);

      form.append('public_id', publicId);
      form.append('timestamp', timestamp.toString());
      form.append('api_key', this.apiKey);
      form.append('signature', signature);

      const response = await fetchFn(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`,
        {
          method: 'POST',
          body: form,
          headers: form.getHeaders ? form.getHeaders() : undefined,
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