/**
 * Payment-related TypeScript types
 */

export interface Payment {
  id: string;
  order_id: string;
  user_id: string;
  provider: string; // 'paystack', etc.
  reference: string;
  transaction_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  gateway_response?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PaymentInitRequest {
  order_id: string;
  amount: number;
  email: string;
  metadata?: Record<string, any>;
}

export interface PaymentInitResponse {
  success: boolean;
  data?: {
    reference: string;
    authorization_url: string;
    access_code: string;
    public_key: string;
    amount: number;
    payment_id: string;
  };
  error?: string;
  message?: string;
}

export interface PaymentVerifyResponse {
  success: boolean;
  data?: {
    status: 'pending' | 'completed' | 'failed';
    reference: string;
    amount: number;
    currency: string;
    paid_at: string;
    transaction_id: string;
    customer: {
      email: string;
      first_name: string;
      last_name: string;
    };
  };
  error?: string;
  message?: string;
}

export interface PaymentHistoryResponse {
  success: boolean;
  data: Payment[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  error?: string;
}

export interface PaystackModalOptions {
  key: string;
  email: string;
  amount: number;
  reference: string;
  onClose: () => void;
  onSuccess: (response: any) => void;
}

export interface PaystackResponse {
  status: 'success' | 'failed';
  message: string;
  data?: {
    authorization_url?: string;
    access_code?: string;
    reference?: string;
    [key: string]: any;
  };
}

export interface ProcessPaymentResult {
  success: boolean;
  reference?: string;
  error?: string;
}

export interface PaymentRetryRequest {
  email: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: 'pending_payment' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'unpaid' | 'paid' | 'partial' | 'failed';
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  items: OrderItem[];
  shipping_address: Address;
  billing_address: Address;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_variant_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Address {
  name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  phone: string;
  shipping_fee?: number;
}

export interface PaymentStats {
  total_payments: number;
  successful_payments: number;
  failed_payments: number;
  pending_payments: number;
  total_amount_paid: number;
  last_payment_date?: string;
}
