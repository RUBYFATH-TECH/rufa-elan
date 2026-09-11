"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Clock,
  Trash2,
  ShoppingCart,
  Star,
  AlertCircle,
  CheckCircle,
  Loader,
  Bell
} from "lucide-react";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import { isKnownAdminEmail } from "@/lib/admin-common";
import { useWaitlistStore } from "@/store/waitlist-store";
import { useCartStore } from "@/store/cart-store";
import AccountLayout from "@/components/account-layout";

type UserProfile = {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
};

type WaitlistItemDisplay = {
  id: string;
  name: string;
  image: string;
  price: number;
  slug: string;
  addedAt: string;
};

export default function WaitlistPage() {
  const router = useRouter();
  const supabase = createClientComponentSupabaseClient();
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [mounted, setMounted] = useState(false);
  const [waitlistItems, setWaitlistItems] = useState<WaitlistItemDisplay[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

  // Store
  const storeItems = useWaitlistStore((state) => state.items);
  const removeWaitlistItem = useWaitlistStore((state) => state.removeItem);
  const addToCart = useCartStore((state) => state.addItem);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const sessionUser = data.session?.user;
        
        if (!sessionUser) {
          router.replace("/auth/login");
          return;
        }

        const email = sessionUser.email?.trim().toLowerCase();
        if (email && isKnownAdminEmail(email)) {
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

        // Load waitlist from store and add timestamps
        const itemsWithTimestamps = storeItems.map((item) => ({
          ...item,
          addedAt: new Date().toLocaleDateString()
        }));
        setWaitlistItems(itemsWithTimestamps);

        setMounted(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading user data:', error);
        setMounted(true);
        setIsLoading(false);
      }
    };

    loadData();
  }, [router, supabase, storeItems]);

  const handleAddToCart = async (item: WaitlistItemDisplay) => {
    try {
      setAddingToCartId(item.id);
      
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: 1
      });

      setSuccessMessage(`${item.name} added to cart!`);
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setErrorMessage('Failed to add item to cart.');
    } finally {
      setAddingToCartId(null);
    }
  };

  const handleRemoveFromWaitlist = (itemId: string) => {
    if (!confirm('Remove this item from your waitlist?')) return;

    try {
      setRemovingId(itemId);
      removeWaitlistItem(itemId);
      
      // Update local state
      setWaitlistItems(prev => prev.filter(w => w.id !== itemId));
      
      setSuccessMessage('Item removed from waitlist');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (error: any) {
      console.error('Error removing from waitlist:', error);
      setErrorMessage(error.message || 'Failed to remove item from waitlist.');
    } finally {
      setRemovingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-4">Loading waitlist...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return null;
  }

  return (
    <AccountLayout requireAuth>
      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-sm text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Waitlist</h1>
            <p className="text-gray-600 mt-1">
              {mounted ? `${waitlistItems.length} item${waitlistItems.length !== 1 ? 's' : ''} waiting for notification` : 'Loading...'}
            </p>
          </div>
          <Clock className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <Bell className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-blue-900">Get notified when items are back in stock</p>
          <p className="text-blue-800">We'll send you an email notification as soon as items on your waitlist become available again.</p>
        </div>
      </div>

      {/* Waitlist Items or Empty State */}
      {!mounted ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-4">Loading waitlist items...</p>
        </div>
      ) : waitlistItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your waitlist is empty</h3>
          <p className="text-gray-600 mb-6">
            Add products to your waitlist and we'll notify you when they're back in stock or on sale.
          </p>
          <Link 
            href="/shop"
            className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 font-medium transition"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {waitlistItems.map((item) => {
            return (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-200 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-105 transition"
                  />

                  {/* Waitlist Badge */}
                  <div className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    In Waitlist
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveFromWaitlist(item.id)}
                    disabled={removingId === item.id}
                    className="absolute top-2 left-2 bg-white/90 hover:bg-white rounded-full p-2 transition disabled:opacity-50"
                    title="Remove from waitlist"
                  >
                    {removingId === item.id ? (
                      <Loader className="h-5 w-5 text-gray-600 animate-spin" />
                    ) : (
                      <Trash2 className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                </div>
                
                {/* Product Info */}
                <div className="p-4">
                  {/* Product Name */}
                  <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 hover:line-clamp-none">
                    <Link href={`/products/${item.slug}`} className="hover:text-orange-600">
                      {item.name}
                    </Link>
                  </h3>
                  
                  {/* Pricing */}
                  <div className="mb-4">
                    <span className="text-lg font-bold text-gray-900">
                      GHS {item.price.toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={addingToCartId === item.id}
                    className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white py-2 px-4 rounded-md transition text-sm font-medium flex items-center justify-center gap-2"
                  >
                    {addingToCartId === item.id ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                      </>
                    )}
                  </button>

                  {/* Date Added */}
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Added {item.addedAt}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Continue Shopping */}
      {mounted && waitlistItems.length > 0 && (
        <div className="mt-8 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-900 rounded-md hover:bg-gray-200 font-medium transition"
          >
            Continue Shopping
          </Link>
        </div>
      )}
    </AccountLayout>
  );
}
