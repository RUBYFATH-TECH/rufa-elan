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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-orange-50 to-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full">
        {status.loading ? (
          <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 text-center border border-slate-200">
            <div className="flex justify-center mb-6">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-orange-100 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-orange-600 rounded-full animate-spin" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              Verifying Payment
            </h2>
            <p className="text-slate-600 text-lg">
              Please wait while we confirm your transaction...
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Secure payment processing</span>
            </div>
          </div>
        ) : status.success ? (
          <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 text-center border border-green-200">
            {/* Success Icon with Animation */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            {/* Success Message */}
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              Payment Successful!
            </h2>
            <p className="text-slate-600 text-lg mb-6">
              Your transaction has been completed successfully
            </p>

            {/* Amount Display */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-6">
              <p className="text-sm font-semibold text-green-800 mb-2 uppercase tracking-wide">
                Amount Paid
              </p>
              <p className="text-4xl font-bold text-green-700">
                GH₵ {status.payment?.amount?.toFixed(2) || '0.00'}
              </p>
              <div className="mt-4 pt-4 border-t border-green-200">
                <div className="flex items-center justify-center gap-2 text-sm text-green-700">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Payment Confirmed</span>
                </div>
              </div>
            </div>

            {/* Reference Number */}
            <div className="bg-slate-50 rounded-xl p-5 mb-6 border border-slate-200">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="flex-1 text-left">
                  <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                    Transaction Reference
                  </p>
                  <p className="font-mono text-sm text-slate-800 break-all leading-relaxed">
                    {status.reference}
                  </p>
                </div>
              </div>
            </div>

            {/* Redirect Message */}
            <div className="flex items-center justify-center gap-2 text-slate-600 mb-6">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <p className="text-sm">
                Redirecting to your orders...
              </p>
            </div>

            {/* Action Button */}
            <button
              onClick={() => router.push('/account/orders')}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-orange-700 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              View My Orders
            </button>

            {/* Additional Info */}
            <p className="mt-6 text-xs text-slate-500">
              A confirmation email has been sent to your registered email address
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 text-center border border-red-200">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>

            {/* Error Message */}
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              Payment Failed
            </h2>
            <p className="text-slate-600 text-lg mb-6">
              {status.error || 'We couldn\'t verify your payment. Please try again or contact support.'}
            </p>

            {/* Reference if available */}
            {status.reference && (
              <div className="bg-slate-50 rounded-xl p-5 mb-6 border border-slate-200">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="flex-1 text-left">
                    <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                      Reference Number
                    </p>
                    <p className="font-mono text-sm text-slate-800 break-all leading-relaxed">
                      {status.reference}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      Please save this reference for support inquiries
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push('/checkout')}
                className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/contact')}
                className="flex-1 bg-slate-100 text-slate-700 py-4 px-6 rounded-xl font-semibold hover:bg-slate-200 transition-all duration-200 border border-slate-300"
              >
                Contact Support
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Need help?</strong> Our support team is available 24/7 to assist you with payment issues.
              </p>
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-orange-50 to-slate-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 text-center border border-slate-200 max-w-lg w-full mx-4">
          <div className="flex justify-center mb-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-orange-100 rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-orange-600 rounded-full animate-spin" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Loading...</h2>
          <p className="text-slate-600">Please wait a moment</p>
        </div>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}
