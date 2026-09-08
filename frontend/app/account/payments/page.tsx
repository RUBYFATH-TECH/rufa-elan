"use client";

import { useEffect, useState } from "react";
import { 
  Plus,
  Edit,
  Trash2,
  Shield,
  CreditCard
} from "lucide-react";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import AccountLayout from "@/components/account-layout";

type UserProfile = {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
};

type PaymentMethod = {
  id: string;
  type: 'card' | 'mobile_money' | 'bank_transfer';
  provider: string;
  last_four?: string;
  phone?: string;
  account_name?: string;
  is_default: boolean;
  expires_at?: string;
};

export default function PaymentMethodsPage() {
  const supabase = createClientComponentSupabaseClient();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const sessionUser = data.session?.user;
        
        if (sessionUser) {
          // Set user profile
          const profile: UserProfile = {
            id: sessionUser.id,
            email: sessionUser.email || '',
            full_name: sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || '',
            phone: sessionUser.user_metadata?.phone || '',
            avatar_url: sessionUser.user_metadata?.avatar_url || null,
            created_at: sessionUser.created_at || new Date().toISOString()
          };

          setUserProfile(profile);

          // Load mock payment methods
          const mockPaymentMethods: PaymentMethod[] = [
            {
              id: '1',
              type: 'mobile_money',
              provider: 'MTN Mobile Money',
              phone: '+233 24 *** **56',
              account_name: profile.full_name || 'John Doe',
              is_default: true
            },
            {
              id: '2',
              type: 'mobile_money', 
              provider: 'Vodafone Cash',
              phone: '+233 20 *** **89',
              account_name: profile.full_name || 'John Doe',
              is_default: false
            },
            {
              id: '3',
              type: 'card',
              provider: 'Visa',
              last_four: '4321',
              expires_at: '12/26',
              is_default: false
            }
          ];

          setPaymentMethods(mockPaymentMethods);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, [supabase]);

  const getPaymentIcon = (type: string, provider: string) => {
    if (type === 'mobile_money') {
      if (provider.includes('MTN')) {
        return <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center text-white text-xs font-bold">MTN</div>;
      }
      if (provider.includes('Vodafone')) {
        return <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">VOD</div>;
      }
    }
    return <CreditCard className="w-8 h-8 text-gray-400" />;
  };

  return (
    <AccountLayout>
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
            <p className="text-gray-600 mt-1">
              Manage your payment methods for faster and secure checkout
            </p>
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium">
            <Plus className="w-4 h-4 mr-2" />
            Add Payment Method
          </button>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-blue-600 mr-3" />
          <div>
            <p className="text-sm font-medium text-blue-800">Your payment information is secure</p>
            <p className="text-sm text-blue-700 mt-1">
              We use industry-standard encryption to protect your payment data and never store sensitive card information.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Methods List */}
      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div key={method.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {getPaymentIcon(method.type, method.provider)}
                <div className="ml-4">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-gray-900">{method.provider}</p>
                    {method.is_default && (
                      <span className="ml-2 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {method.type === 'card' ? (
                      <>
                        •••• •••• •••• {method.last_four}
                        {method.expires_at && (
                          <span className="ml-2">Expires {method.expires_at}</span>
                        )}
                      </>
                    ) : method.type === 'mobile_money' ? (
                      <>
                        {method.phone}
                        {method.account_name && (
                          <span className="ml-2">• {method.account_name}</span>
                        )}
                      </>
                    ) : (
                      method.account_name
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="text-gray-400 hover:text-gray-600">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="text-gray-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between">
                <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                  Edit
                </button>
                {!method.is_default && (
                  <button className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                    Set as Default
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add New Payment Method Card */}
        <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-6 flex items-center justify-center hover:border-orange-300 hover:bg-orange-50 transition-colors cursor-pointer">
          <div className="text-center">
            <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">Add New Payment Method</p>
            <p className="text-xs text-gray-500 mt-1">Add a card or mobile money account</p>
          </div>
        </div>
      </div>

      {/* Accepted Payment Methods */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Accepted Payment Methods</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center p-3 bg-white rounded border">
            <div className="w-6 h-6 bg-yellow-500 rounded mr-2"></div>
            <span className="text-xs font-medium">MTN MoMo</span>
          </div>
          <div className="flex items-center p-3 bg-white rounded border">
            <div className="w-6 h-6 bg-red-500 rounded mr-2"></div>
            <span className="text-xs font-medium">Vodafone Cash</span>
          </div>
          <div className="flex items-center p-3 bg-white rounded border">
            <div className="w-6 h-6 bg-blue-600 rounded mr-2"></div>
            <span className="text-xs font-medium">Visa</span>
          </div>
          <div className="flex items-center p-3 bg-white rounded border">
            <div className="w-6 h-6 bg-orange-500 rounded mr-2"></div>
            <span className="text-xs font-medium">Mastercard</span>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}
