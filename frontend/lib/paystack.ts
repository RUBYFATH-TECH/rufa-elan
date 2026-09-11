/**
 * Paystack Payment Integration Helper
 * Handles payment initialization and verification for frontend
 */

const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export interface PaymentInitializationData {
  order_id: string;
  amount: number;
  email: string;
  metadata?: Record<string, any>;
}

export interface PaymentInitializationResponse {
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

export interface PaymentVerificationResponse {
  success: boolean;
  data?: {
    status: string;
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

/**
 * Initialize a payment with Paystack
 */
export async function initializePayment(
  paymentData: PaymentInitializationData,
  token: string
): Promise<PaymentInitializationResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/payments/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to initialize payment');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error initializing payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Verify a payment with the backend
 */
export async function verifyPayment(
  reference: string,
  token: string
): Promise<PaymentVerificationResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/payments/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to verify payment');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Retry a payment for an order
 */
export async function retryPayment(
  orderId: string,
  email: string,
  token: string
): Promise<PaymentInitializationResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/payments/retry/${orderId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to retry payment');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error retrying payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get user's payment history
 */
export async function getPaymentHistory(
  token: string,
  page: number = 1,
  limit: number = 20,
  status?: string
): Promise<any> {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);

    const response = await fetch(`${BACKEND_URL}/api/payments?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch payment history');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get payment details
 */
export async function getPaymentDetails(
  paymentId: string,
  token: string
): Promise<any> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch payment details');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching payment details:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Load Paystack script dynamically
 * Returns a promise that resolves when PaystackPop is available
 */
export function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if ((window as any).PaystackPop) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => {
      resolve();
    };
    script.onerror = () => {
      reject(new Error('Failed to load Paystack script'));
    };
    document.head.appendChild(script);
  });
}

/**
 * Open Paystack payment modal
 */
export async function openPaystackModal(options: {
  key: string;
  email: string;
  amount: number; // in naira
  reference: string;
  onClose: () => void;
  onSuccess: (response: any) => void;
}): Promise<void> {
  try {
    await loadPaystackScript();

    const handler = (window as any).PaystackPop.setup({
      key: options.key,
      email: options.email,
      amount: options.amount * 100, // Paystack uses kobo
      ref: options.reference,
      currency: 'NGN',
      onClose: options.onClose,
      onSuccess: options.onSuccess
    });

    handler.openIframe();
  } catch (error) {
    console.error('Error opening Paystack modal:', error);
    throw error;
  }
}

/**
 * Process payment flow (initialization -> modal -> verification)
 */
export async function processPayment(
  paymentData: PaymentInitializationData,
  token: string,
  userEmail: string
): Promise<{
  success: boolean;
  reference?: string;
  error?: string;
}> {
  try {
    // Step 1: Initialize payment with backend
    const initResponse = await initializePayment(paymentData, token);

    if (!initResponse.success || !initResponse.data) {
      return {
        success: false,
        error: initResponse.message || 'Failed to initialize payment'
      };
    }

    const { reference, public_key } = initResponse.data;

    // Step 2: Handle the payment modal
    return new Promise((resolve) => {
      const paymentModalPromise = new Promise<void>((resolveModal, rejectModal) => {
        openPaystackModal({
          key: public_key,
          email: userEmail,
          amount: paymentData.amount,
          reference,
          onClose: () => {
            rejectModal(new Error('Payment modal closed'));
          },
          onSuccess: async () => {
            // Step 3: Verify payment
            const verifyResponse = await verifyPayment(reference, token);

            if (verifyResponse.success) {
              resolveModal();
            } else {
              rejectModal(new Error(verifyResponse.message || 'Payment verification failed'));
            }
          }
        });
      });

      paymentModalPromise
        .then(() => {
          resolve({
            success: true,
            reference
          });
        })
        .catch((error) => {
          resolve({
            success: false,
            error: error.message
          });
        });
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export default {
  initializePayment,
  verifyPayment,
  retryPayment,
  getPaymentHistory,
  getPaymentDetails,
  loadPaystackScript,
  openPaystackModal,
  processPayment,
  PAYSTACK_PUBLIC_KEY
};
