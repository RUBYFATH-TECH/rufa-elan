import fetch from 'node-fetch';
import { logger } from '../utils/logger';
import { serviceConfig } from '../config/services';

export interface PaystackInitializePaymentData {
  amount: number; // Amount in pesewas (multiply cedis by 100)
  email: string;
  reference?: string;
  callback_url?: string;
  metadata?: any;
  channels?: string[];
  currency?: string;
}

export interface PaystackVerifyPaymentResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: any;
    log: any;
    fees: number;
    fees_split: any;
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
    };
    customer: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      customer_code: string;
      phone: string;
      metadata: any;
      risk_action: string;
    };
  };
}

class PaystackService {
  private readonly baseUrl = 'https://api.paystack.co';
  private readonly secretKey = serviceConfig.paystack.secretKey;

  private async makeRequest(endpoint: string, options: any = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: options.method || 'GET',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      const data: any = await response.json();

      if (!response.ok) {
        logger.error('Paystack API error:', data);
        throw new Error((data as any)?.message || 'Paystack API request failed');
      }

      return data;
    } catch (error) {
      logger.error('Paystack request error:', error);
      throw error;
    }
  }

  async initializePayment(paymentData: PaystackInitializePaymentData) {
    try {
      logger.info('Initializing Paystack payment:', { 
        email: paymentData.email, 
        amount: paymentData.amount 
      });

      const response = await this.makeRequest('/transaction/initialize', {
        method: 'POST',
        body: {
          ...paymentData,
          amount: Math.round(paymentData.amount), // Ensure amount is integer
          currency: paymentData.currency || 'NGN',
        },
      });

      logger.info('Paystack payment initialized:', { reference: response.data?.reference });
      return response;
    } catch (error) {
      logger.error('Error initializing payment:', error);
      throw error;
    }
  }

  async verifyPayment(reference: string): Promise<PaystackVerifyPaymentResponse> {
    try {
      logger.info('Verifying Paystack payment:', { reference });

      const response: any = await this.makeRequest(`/transaction/verify/${reference}`);

      logger.info('Payment verification result:', { 
        reference, 
        status: (response as any)?.data?.status,
        amount: (response as any)?.data?.amount 
      });

      return response as PaystackVerifyPaymentResponse;
    } catch (error) {
      logger.error('Error verifying payment:', error);
      throw error;
    }
  }

  async getTransaction(transactionId: string) {
    try {
      const response = await this.makeRequest(`/transaction/${transactionId}`);
      return response;
    } catch (error) {
      logger.error('Error fetching transaction:', error);
      throw error;
    }
  }

  async listTransactions(options: { 
    perPage?: number; 
    page?: number; 
    customer?: string;
    status?: string;
    from?: string;
    to?: string;
  } = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (options.perPage) queryParams.append('perPage', options.perPage.toString());
      if (options.page) queryParams.append('page', options.page.toString());
      if (options.customer) queryParams.append('customer', options.customer);
      if (options.status) queryParams.append('status', options.status);
      if (options.from) queryParams.append('from', options.from);
      if (options.to) queryParams.append('to', options.to);

      const endpoint = `/transaction?${queryParams.toString()}`;
      const response = await this.makeRequest(endpoint);
      return response;
    } catch (error) {
      logger.error('Error listing transactions:', error);
      throw error;
    }
  }

  async createCustomer(customerData: {
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    metadata?: any;
  }) {
    try {
      const response = await this.makeRequest('/customer', {
        method: 'POST',
        body: customerData,
      });

      logger.info('Paystack customer created:', { email: customerData.email });
      return response;
    } catch (error) {
      logger.error('Error creating customer:', error);
      throw error;
    }
  }

  async getCustomer(customerCode: string) {
    try {
      const response = await this.makeRequest(`/customer/${customerCode}`);
      return response;
    } catch (error) {
      logger.error('Error fetching customer:', error);
      throw error;
    }
  }

  // Webhook signature verification
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      const crypto = require('crypto');
      const hash = crypto
        .createHmac('sha512', serviceConfig.paystack.webhookSecret)
        .update(payload, 'utf-8')
        .digest('hex');
      
      return hash === signature;
    } catch (error) {
      logger.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  // Generate reference for transactions
  generateReference(prefix: string = 'REF'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${prefix}_${timestamp}_${random}`;
  }

  // Convert cedis to pesewas (smallest unit)
  cedisToSmallestUnit(amount: number): number {
    return Math.round(amount * 100);
  }

  // Convert pesewas to cedis
  smallestUnitToCedis(amount: number): number {
    return amount / 100;
  }

  // Alias for backward compatibility
  nairaToKobo(naira: number): number {
    return this.cedisToSmallestUnit(naira);
  }

  // Alias for backward compatibility
  koboToNaira(kobo: number): number {
    return this.smallestUnitToCedis(kobo);
  }
}

export const paystackService = new PaystackService();
export default paystackService;