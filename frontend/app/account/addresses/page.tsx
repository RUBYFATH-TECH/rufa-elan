"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Plus,
  Edit,
  Trash2,
  Home,
  Building
} from "lucide-react";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import { isKnownAdminEmail } from "@/lib/admin-common";
import AccountLayout from "@/components/account-layout";

type UserProfile = {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
};

type Address = {
  id: string;
  type: 'home' | 'work' | 'other';
  label: string;
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  region: string;
  postal_code?: string;
  is_default: boolean;
};

export default function AddressesPage() {
  const router = useRouter();
  const supabase = createClientComponentSupabaseClient();
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const sessionUser = data.session?.user;
        
        if (!sessionUser) {
          router.replace("/auth/login");
          return;
        }

        const email = sessionUser.email?.trim().toLowerCase();
        if (email && (isKnownAdminEmail(email))) {
          const { data: adminUser } = await supabase
            .from("admin_users")
            .select("id")
            .ilike("email", email)
            .maybeSingle();

          if (adminUser || isKnownAdminEmail(email)) {
            router.replace("/admin/dashboard");
            return;
          }
        }

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

        // Load mock addresses
        const mockAddresses: Address[] = [
          {
            id: '1',
            type: 'home',
            label: 'Home',
            full_name: profile.full_name || 'John Doe',
            phone: profile.phone || '+233 24 000 0000',
            address_line_1: '123 Main Street',
            address_line_2: 'Apartment 4B',
            city: 'Accra',
            region: 'Greater Accra',
            postal_code: 'GA-123-4567',
            is_default: true
          },
          {
            id: '2',
            type: 'work',
            label: 'Office',
            full_name: profile.full_name || 'John Doe',
            phone: profile.phone || '+233 24 000 0000',
            address_line_1: '456 Business Avenue',
            city: 'Kumasi',
            region: 'Ashanti',
            postal_code: 'AK-789-0123',
            is_default: false
          }
        ];

        setAddresses(mockAddresses);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading user data:', error);
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [router, supabase]);

  if (isLoading) {
    return (
      <AccountLayout>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-4">Loading addresses...</p>
        </div>
      </AccountLayout>
    );
  }

  if (!userProfile) {
    router.push('/auth/login');
    return null;
  }

  return (
    <AccountLayout>
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Delivery Addresses</h1>
            <p className="text-gray-600 mt-1">
              Manage your delivery addresses for faster checkout
            </p>
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium">
            <Plus className="w-4 h-4 mr-2" />
            Add Address
          </button>
        </div>
      </div>

      {/* Addresses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((address) => (
          <div key={address.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                {address.type === 'home' ? (
                  <Home className="h-5 w-5 text-gray-400 mr-2" />
                ) : (
                  <Building className="h-5 w-5 text-gray-400 mr-2" />
                )}
                <span className="text-sm font-medium text-gray-900">{address.label}</span>
                {address.is_default && (
                  <span className="ml-2 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                    Default
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                <button className="text-gray-400 hover:text-gray-600">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="text-gray-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">{address.full_name}</p>
              <p>{address.phone}</p>
              <p>{address.address_line_1}</p>
              {address.address_line_2 && <p>{address.address_line_2}</p>}
              <p>{address.city}, {address.region}</p>
              {address.postal_code && <p>{address.postal_code}</p>}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between">
                <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                  Edit
                </button>
                {!address.is_default && (
                  <button className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                    Set as Default
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add New Address Card */}
        <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-6 flex items-center justify-center hover:border-orange-300 hover:bg-orange-50 transition-colors cursor-pointer">
          <div className="text-center">
            <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">Add New Address</p>
            <p className="text-xs text-gray-500 mt-1">Create a new delivery address</p>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}