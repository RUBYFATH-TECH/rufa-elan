import fetch from 'node-fetch';
import { logger } from '../utils/logger';
import { serviceConfig } from '../config/services';

export interface EmailData {
  to: string | string[];
  from?: string;
  subject: string;
  html?: string;
  text?: string;
  cc?: string[];
  bcc?: string[];
  reply_to?: string;
  attachments?: {
    filename: string;
    content: string; // base64 encoded
    content_type: string;
  }[];
}

export interface OrderEmailData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  totalAmount: number;
  orderDate: string;
  deliveryAddress?: string;
  trackingNumber?: string;
}

class EmailService {
  private readonly apiKey = serviceConfig.email.resendApiKey;
  private readonly fromAddress = serviceConfig.email.fromAddress;
  private readonly apiUrl = 'https://api.resend.com/emails';

  private async sendRequest(data: any) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        logger.error('Resend API error:', result);
        throw new Error(((result as any) || {}).message || 'Email sending failed');
      }

      return result;
    } catch (error) {
      logger.error('Email sending error:', error);
      throw error;
    }
  }

  async sendEmail(emailData: EmailData) {
    try {
      const data = {
        from: emailData.from || this.fromAddress,
        to: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        cc: emailData.cc,
        bcc: emailData.bcc,
        reply_to: emailData.reply_to,
        attachments: emailData.attachments,
      };

      // Remove undefined fields
      Object.keys(data).forEach(key => {
        if (data[key] === undefined) {
          delete data[key];
        }
      });

      const result = await this.sendRequest(data);
      
      logger.info('Email sent successfully:', { 
        to: emailData.to, 
        subject: emailData.subject,
        id: (result as any).id 
      });

      return result;
    } catch (error) {
      logger.error('Error sending email:', error);
      throw error;
    }
  }

  // Email Templates

  async sendOrderConfirmation(orderData: OrderEmailData) {
    const html = this.generateOrderConfirmationTemplate(orderData);
    
    return await this.sendEmail({
      to: orderData.customerEmail,
      subject: `Order Confirmation - ${orderData.orderId}`,
      html,
    });
  }

  async sendOrderShipped(orderData: OrderEmailData) {
    const html = this.generateOrderShippedTemplate(orderData);
    
    return await this.sendEmail({
      to: orderData.customerEmail,
      subject: `Your Order Has Been Shipped - ${orderData.orderId}`,
      html,
    });
  }

  async sendOrderDelivered(orderData: OrderEmailData) {
    const html = this.generateOrderDeliveredTemplate(orderData);
    
    return await this.sendEmail({
      to: orderData.customerEmail,
      subject: `Order Delivered - ${orderData.orderId}`,
      html,
    });
  }

  async sendWelcomeEmail(customerName: string, customerEmail: string) {
    const html = this.generateWelcomeTemplate(customerName);
    
    return await this.sendEmail({
      to: customerEmail,
      subject: 'Welcome to RUFA ELAN!',
      html,
    });
  }

  async sendPasswordReset(customerEmail: string, resetLink: string, customerName?: string) {
    const html = this.generatePasswordResetTemplate(resetLink, customerName);
    
    return await this.sendEmail({
      to: customerEmail,
      subject: 'Reset Your RUFA ELAN Password',
      html,
    });
  }

  // Email Template Generators

  private generateOrderConfirmationTemplate(orderData: OrderEmailData): string {
    const itemsHtml = orderData.orderItems.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <div style="display: flex; align-items: center;">
            ${item.image ? `<img src="${item.image}" style="width: 50px; height: 50px; margin-right: 10px; border-radius: 4px;">` : ''}
            <div>
              <div style="font-weight: bold;">${item.name}</div>
              <div style="color: #666;">Quantity: ${item.quantity}</div>
            </div>
          </div>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ₦${item.price.toLocaleString()}
        </td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50;">RUFA ELAN</h1>
          <h2 style="color: #27ae60;">Order Confirmation</h2>
        </div>
        
        <p>Dear ${orderData.customerName},</p>
        <p>Thank you for your order! We're excited to confirm that we've received your order and it's being processed.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> ${orderData.orderId}</p>
          <p><strong>Order Date:</strong> ${orderData.orderDate}</p>
          ${orderData.deliveryAddress ? `<p><strong>Delivery Address:</strong> ${orderData.deliveryAddress}</p>` : ''}
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #2c3e50; color: white;">
              <th style="padding: 15px; text-align: left;">Item</th>
              <th style="padding: 15px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
            <tr style="background: #f8f9fa; font-weight: bold;">
              <td style="padding: 15px;">Total</td>
              <td style="padding: 15px; text-align: right;">₦${orderData.totalAmount.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <p>We'll send you another email with tracking information once your order has been shipped.</p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p>Thank you for shopping with RUFA ELAN!</p>
          <p style="color: #666; font-size: 12px;">If you have any questions, please contact our support team.</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateOrderShippedTemplate(orderData: OrderEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Shipped</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50;">RUFA ELAN</h1>
          <h2 style="color: #3498db;">Your Order Has Been Shipped!</h2>
        </div>
        
        <p>Dear ${orderData.customerName},</p>
        <p>Great news! Your order <strong>${orderData.orderId}</strong> has been shipped and is on its way to you.</p>
        
        ${orderData.trackingNumber ? `
        <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h3 style="margin: 0; color: #2c3e50;">Tracking Number</h3>
          <p style="font-size: 18px; font-weight: bold; color: #3498db; margin: 10px 0;">${orderData.trackingNumber}</p>
          <p style="margin: 0; color: #666;">You can use this number to track your package</p>
        </div>
        ` : ''}

        ${orderData.deliveryAddress ? `
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Delivery Address</h3>
          <p>${orderData.deliveryAddress}</p>
        </div>
        ` : ''}

        <p>Your order should arrive within 3-7 business days. We'll send you another confirmation email once it's been delivered.</p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p>Thank you for shopping with RUFA ELAN!</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateOrderDeliveredTemplate(orderData: OrderEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Delivered</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50;">RUFA ELAN</h1>
          <h2 style="color: #27ae60;">Order Delivered Successfully!</h2>
        </div>
        
        <p>Dear ${orderData.customerName},</p>
        <p>Your order <strong>${orderData.orderId}</strong> has been successfully delivered!</p>
        
        <p>We hope you love your purchase. If you have any issues or concerns, please don't hesitate to contact our customer support team.</p>
        
        <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
          <h3>How was your experience?</h3>
          <p>We'd love to hear your feedback about your order and shopping experience.</p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p>Thank you for choosing RUFA ELAN!</p>
          <p style="color: #666; font-size: 12px;">We look forward to serving you again soon.</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateWelcomeTemplate(customerName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to RUFA ELAN</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50;">Welcome to RUFA ELAN!</h1>
        </div>
        
        <p>Dear ${customerName},</p>
        <p>Welcome to RUFA ELAN! We're thrilled to have you join our community of fashion enthusiasts.</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h3>Start Shopping</h3>
          <p>Discover our latest collections and find your perfect style.</p>
          <a href="${serviceConfig.app.frontendUrl}" style="display: inline-block; background: #2c3e50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 10px;">Shop Now</a>
        </div>

        <p>If you have any questions or need assistance, our customer support team is here to help.</p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p>Happy shopping!</p>
          <p style="color: #666; font-size: 12px;">The RUFA ELAN Team</p>
        </div>
      </body>
      </html>
    `;
  }

  private generatePasswordResetTemplate(resetLink: string, customerName?: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50;">RUFA ELAN</h1>
          <h2 style="color: #e74c3c;">Password Reset Request</h2>
        </div>
        
        <p>Dear ${customerName || 'Customer'},</p>
        <p>We received a request to reset your password for your RUFA ELAN account.</p>
        
        <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
          <p>Click the button below to reset your password:</p>
          <a href="${resetLink}" style="display: inline-block; background: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 10px;">Reset Password</a>
        </div>

        <p><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="color: #666; font-size: 12px; word-break: break-all;">${resetLink}</p>
        </div>
      </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();
export default emailService;