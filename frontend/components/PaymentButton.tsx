'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { processPayment } from '@/lib/paystack';
import { useToast } from '@/hooks/use-toast';

export interface PaymentButtonProps {
  orderId: string;
  amount: number;
  email?: string;
  onSuccess?: (reference: string) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

/**
 * PaymentButton Component
 * Handles Paystack payment flow for orders
 */
export const PaymentButton: React.FC<PaymentButtonProps> = ({
  orderId,
  amount,
  email: customEmail,
  onSuccess,
  onError,
  className = '',
  disabled = false
}) => {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    try {
      if (!session?.user?.email && !customEmail) {
        toast({
          title: 'Error',
          description: 'Email address is required to process payment',
          variant: 'destructive'
        });
        return;
      }

      if (!session?.accessToken) {
        toast({
          title: 'Error',
          description: 'Authentication required. Please log in.',
          variant: 'destructive'
        });
        return;
      }

      setIsLoading(true);

      const userEmail = customEmail || session.user.email || '';

      // Process payment
      const result = await processPayment(
        {
          order_id: orderId,
          amount,
          email: userEmail,
          metadata: {
            order_id: orderId
          }
        },
        session.accessToken,
        userEmail
      );

      if (result.success && result.reference) {
        toast({
          title: 'Success',
          description: 'Payment completed successfully!',
          variant: 'default'
        });

        if (onSuccess) {
          onSuccess(result.reference);
        }
      } else {
        const errorMessage = result.error || 'Payment failed. Please try again.';
        toast({
          title: 'Payment Failed',
          description: errorMessage,
          variant: 'destructive'
        });

        if (onError) {
          onError(errorMessage);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      console.error('Payment error:', error);

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });

      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading || disabled}
      className={`
        px-6 py-2 font-medium rounded-lg
        bg-blue-600 text-white hover:bg-blue-700
        disabled:bg-gray-400 disabled:cursor-not-allowed
        transition-colors duration-200
        flex items-center gap-2
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <span>Pay ₦{amount.toLocaleString('en-NG')}</span>
        </>
      )}
    </button>
  );
};

export default PaymentButton;
