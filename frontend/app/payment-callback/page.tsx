'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyPayment } from '@/lib/paystack';
import { createClientComponentSupabaseClient } from '@/lib/supabase-client';
import { useCartStore } from '@/store/cart-store';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

interface PaymentStatus {
  loading: boolean;
  success: boolean;
  error?: string;
  payment?: any;
  reference?: string;
}

/**
 * Payment Callback Page
 * Handles payment verification after Paystack redirect
 */
function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const clearCart = useCartStore((state: any) => state.clearCart);
  const [status, setStatus] = useState<PaymentStatus>({
    loading: true,
    success: false
  });

  useEffect(() => {
    const verifyPaymentTransaction = async () => {
      try {
        const reference = searchParams.get('reference');

        if (!reference) {
          setStatus({
            loading: false,
            success: false,
            error: 'No payment reference provided'
          });
          return;
        }

        const supabase = createClientComponentSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
          setStatus({
            loading: false,
            success: false,
            error: 'Authentication required'
          });
          return;
        }

        // Verify payment with backend
        const result = await verifyPayment(reference, session.access_token);

        if (result.success) {
          setStatus({
            loading: false,
            success: true,
            reference,
            payment: result.data
          });

          // Clear cart after successful payment verification
          try {
            await clearCart();
            console.log('Cart cleared after successful payment');
          } catch (cartError) {
            console.error('Failed to clear cart:', cartError);
            // Don't fail the payment verification if cart clearing fails
          }

          // Redirect to orders page after 3 seconds
          setTimeout(() => {
            router.push('/account/orders');
          }, 3000);
        } else {
          setStatus({
            loading: false,
            success: false,
            error: result.message || 'Payment verification failed',
            reference
          });

        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        setStatus({
          loading: false,
          success: false,
          error: errorMessage
        });

      }
    };

    verifyPaymentTransaction();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {status.loading ? (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying Payment
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your payment...
            </p>
          </div>
        ) : status.success ? (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-4">
              Your payment of ₦{status.payment?.amount?.toLocaleString('en-NG')} has been confirmed.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-500 mb-1">Reference:</p>
              <p className="font-mono text-sm text-gray-900 break-all">
                {status.reference}
              </p>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Redirecting to your orders page...
            </p>
            <button
              onClick={() => router.push('/account/orders')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Orders
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Failed
            </h2>
            <p className="text-gray-600 mb-4">
              {status.error || 'Unable to verify your payment. Please try again.'}
            </p>
            {status.reference && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-gray-500 mb-1">Reference:</p>
                <p className="font-mono text-sm text-gray-900 break-all">
                  {status.reference}
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => router.back()}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => router.push('/account/orders')}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                To Orders
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin" />
            </div>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}
