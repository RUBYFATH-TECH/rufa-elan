"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Heart,
  Trash2,
  ShoppingCart,
  Star,
  AlertCircle,
  CheckCircle,
  Loader
} from "lucide-react";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import { isKnownAdminEmail } from "@/lib/admin-common";
import { useWishlistStore } from "@/store/wishlist-store";
import { useCartStore } from "@/store/cart-store";
import wishlistService, { type WishlistItem } from "@/lib/api-services/wishlist";
import AccountLayout from "@/components/account-layout";

type UserProfile = {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
};

export default function WishlistPage() {
  const router = useRouter();
  const supabase = createClientComponentSupabaseClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [mounted, setMounted] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

  // Cart store
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

        // Load wishlist from API
        try {
          const items = await wishlistService.getWishlist();
          setWishlistItems(items);
        } catch (error) {
          console.error('Failed to load wishlist:', error);
          setErrorMessage('Failed to load wishlist. Please try again.');
        }

        setMounted(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading user data:', error);
        setMounted(true);
        setIsLoading(false);
      }
    };

    loadData();
  }, [router, supabase]);

  const handleAddToCart = async (item: WishlistItem) => {
    if (!item.product) return;
    
    try {
      setAddingToCartId(item.product_id);
      const primaryImage = item.product.product_images?.find(img => img.is_primary)?.url || 
                          item.product.product_images?.[0]?.url || '';
      
      addToCart({
        id: item.product_id,
        name: item.product.name,
        price: item.product.sale_price || item.product.regular_price,
        image: primaryImage,
        quantity: 1
      });

      setSuccessMessage(`${item.product.name} added to cart!`);
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setErrorMessage('Failed to add item to cart.');
    } finally {
      setAddingToCartId(null);
    }
  };

  const handleRemoveFromWishlist = async (item: WishlistItem) => {
    if (!confirm('Remove this item from your wishlist?')) return;

    try {
      setRemovingId(item.product_id);
      await wishlistService.removeFromWishlist(item.product_id);
      
      // Update local state
      setWishlistItems(prev => prev.filter(w => w.product_id !== item.product_id));
      
      setSuccessMessage('Item removed from wishlist');
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (error: any) {
      console.error('Error removing from wishlist:', error);
      setErrorMessage(error.message || 'Failed to remove item from wishlist.');
    } finally {
      setRemovingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-4">Loading wishlist...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600 mt-1">
              {mounted ? `${wishlistItems.length} item${wishlistItems.length !== 1 ? 's' : ''} saved for later` : 'Loading...'}
            </p>
          </div>
          <Heart className="h-8 w-8 text-red-500" />
        </div>
      </div>

      {/* Wishlist Items or Empty State */}
      {!mounted ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-4">Loading wishlist items...</p>
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-600 mb-6">
            Save items you love to your wishlist. Review them anytime and easily move them to your cart.
          </p>
          <Link 
            href="/shop"
            className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 font-medium transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => {
            if (!item.product) return null;
            
            const primaryImage = item.product.product_images?.find(img => img.is_primary)?.url || 
                               item.product.product_images?.[0]?.url;
            const currentPrice = item.product.sale_price || item.product.regular_price;
            const originalPrice = item.product.regular_price;
            const hasDiscount = item.product.sale_price && item.product.sale_price < originalPrice;
            const discountPercent = hasDiscount 
              ? Math.round(((originalPrice - item.product.sale_price!) / originalPrice) * 100)
              : 0;

            return (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-200 overflow-hidden">
                  {primaryImage ? (
                    <img 
                      src={primaryImage} 
                      alt={item.product.name}
                      className="w-full h-full object-cover hover:scale-105 transition"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-400">
                      <Heart className="h-12 w-12" />
                    </div>
                  )}
                  
                  {/* Discount Badge */}
                  {hasDiscount && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                      -{discountPercent}%
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveFromWishlist(item)}
                    disabled={removingId === item.product_id}
                    className="absolute top-2 left-2 bg-white/90 hover:bg-white rounded-full p-2 transition disabled:opacity-50"
                    title="Remove from wishlist"
                  >
                    {removingId === item.product_id ? (
                      <Loader className="h-5 w-5 text-red-500 animate-spin" />
                    ) : (
                      <Heart className="h-5 w-5 text-red-500 fill-current" />
                    )}
                  </button>
                </div>
                
                {/* Product Info */}
                <div className="p-4">
                  {/* Product Name */}
                  <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 hover:line-clamp-none">
                    <Link href={`/products/${item.product.slug}`} className="hover:text-orange-600">
                      {item.product.name}
                    </Link>
                  </h3>
                  
                  {/* Rating */}
                  <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400 text-sm">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < Math.round(item.product!.avg_rating) ? 'fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-2">({item.product.review_count})</span>
                  </div>
                  
                  {/* Pricing */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg font-bold text-gray-900">
                      GHS {currentPrice.toFixed(2)}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-gray-500 line-through">
                        GHS {originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  {/* Add to Cart Button */}
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={addingToCartId === item.product_id}
                    className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white py-2 px-4 rounded-md transition text-sm font-medium flex items-center justify-center gap-2"
                  >
                    {addingToCartId === item.product_id ? (
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
                    Added {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Continue Shopping */}
      {mounted && wishlistItems.length > 0 && (
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