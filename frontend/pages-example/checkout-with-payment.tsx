/**
 * Example Checkout Page with Paystack Payment Integration
 * 
 * This is an example showing how to integrate the payment flow
 * in your checkout/payment page. Adapt this to your actual page structure.
 */

'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PaymentButton from '@/components/PaymentButton';
import { useToast } from '@/hooks/use-toast';

interface CheckoutPageProps {
  orderId: string;
  orderDetails: {
    id: string;
    order_number: string;
    total_amount: number;
    subtotal: number;
    shipping_fee: number;
    discount_amount: number;
    items: Array<{
      product_variant_id: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }>;
    shipping_address: {
      name: string;
      address: string;
      city: string;
      state: string;
      postal_code: string;
      phone: string;
    };
  };
}

/**
 * Example Checkout Page Component
 */
export default function CheckoutPage({ orderId, orderDetails }: CheckoutPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [paymentStep, setPaymentStep] = useState<'review' | 'processing' | 'complete'>('review');
  const [paymentReference, setPaymentReference] = useState<string | null>(null);

  const handlePaymentSuccess = (reference: string) => {
    setPaymentReference(reference);
    setPaymentStep('complete');

    // Show success message
    toast({
      title: 'Payment Successful',
      description: `Your order ${orderDetails.order_number} has been confirmed!`,
      variant: 'default'
    });

    // Redirect after 2 seconds
    setTimeout(() => {
      router.push(`/orders/${orderId}`);
    }, 2000);
  };

  const handlePaymentError = (error: string) => {
    setPaymentStep('review');
    toast({
      title: 'Payment Failed',
      description: error,
      variant: 'destructive'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Order {orderDetails.order_number}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="md:col-span-2">
            {paymentStep === 'review' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

                {/* Order Items */}
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <h3 className="font-medium text-gray-900 mb-3">Items</h3>
                  <div className="space-y-2">
                    {orderDetails.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Item #{index + 1} (Qty: {item.quantity})
                        </span>
                        <span className="font-medium text-gray-900">
                          ₦{item.total_price.toLocaleString('en-NG')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <h3 className="font-medium text-gray-900 mb-3">Shipping Address</h3>
                  <div className="text-sm text-gray-600">
                    <p>{orderDetails.shipping_address.name}</p>
                    <p>{orderDetails.shipping_address.address}</p>
                    <p>
                      {orderDetails.shipping_address.city}, {orderDetails.shipping_address.state}{' '}
                      {orderDetails.shipping_address.postal_code}
                    </p>
                    <p>{orderDetails.shipping_address.phone}</p>
                  </div>
                </div>

                {/* Order Total */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span>₦{orderDetails.subtotal.toLocaleString('en-NG')}</span>
                    </div>
                    {orderDetails.discount_amount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-₦{orderDetails.discount_amount.toLocaleString('en-NG')}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span>₦{orderDetails.shipping_fee.toLocaleString('en-NG')}</span>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-4 flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-blue-600">
                      ₦{orderDetails.total_amount.toLocaleString('en-NG')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {paymentStep === 'processing' && (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="mb-4">
                  <div className="inline-block">
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 border-4 border-blue-200 rounded-full" />
                      <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin" />
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">Processing your payment...</p>
              </div>
            )}

            {paymentStep === 'complete' && (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="mb-4">
                  <div className="inline-block w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</h3>
                <p className="text-gray-600 mb-4">Your order has been confirmed and is being processed.</p>
                {paymentReference && (
                  <p className="text-sm font-mono text-gray-500 mb-4">Ref: {paymentReference}</p>
                )}
              </div>
            )}
          </div>

          {/* Payment Section */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>

              {paymentStep === 'review' && (
                <div className="space-y-4">
                  {/* Payment Method Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Secure Payment</strong>
                    </p>
                    <p className="text-xs text-gray-500">
                      Your payment is processed securely through Paystack. We accept all major payment methods.
                    </p>
                  </div>

                  {/* Payment Amount */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-1">Amount to Pay</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₦{orderDetails.total_amount.toLocaleString('en-NG')}
                    </p>
                  </div>

                  {/* Payment Button */}
                  {session?.user?.email && (
                    <PaymentButton
                      orderId={orderId}
                      amount={orderDetails.total_amount}
                      email={session.user.email}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      className="w-full"
                    />
                  )}

                  {!session?.user?.email && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        Please sign in to continue with payment
                      </p>
                    </div>
                  )}

                  {/* Security Info */}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" />
                      </svg>
                      Your payment is encrypted and secure
                    </p>
                  </div>
                </div>
              )}

              {(paymentStep === 'processing' || paymentStep === 'complete') && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600">
                    {paymentStep === 'processing' ? 'Processing...' : 'Complete!'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Need Help?</h3>
          <p className="text-sm text-blue-800">
            If you experience any issues during checkout, please contact our support team at support@rufaelan.com
          </p>
        </div>
      </div>
    </div>
  );
}
