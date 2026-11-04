"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart-store";
import { ArrowLeft, CircleUserRound, ShoppingBag, Trash2, X, Minus, Plus, Truck, Shield, RotateCcw, AlertTriangle, CheckCircle, ChevronDown } from "lucide-react";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import { GHANA_REGIONS, type GhanaRegionValue } from "@/lib/constants/ghana-regions";

export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const error = useCartStore((state) => state.error);
  const total = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const subtotal = total;
  const shippingEstimate = 25;
  const [showAccountPrompt, setShowAccountPrompt] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<GhanaRegionValue>('');
  const [shippingFee, setShippingFee] = useState(0);
  
  // Calculate shipping based on region
  const calculateShipping = (region: GhanaRegionValue) => {
    if (!region) return 0;
    
    // Base shipping rates per region (in GHS)
    const regionRates: Record<string, number> = {
      'greater_accra': 15,
      'ashanti': 20,
      'central': 25,
      'eastern': 25,
      'western': 30,
      'volta': 30,
      'northern': 40,
      'upper_east': 45,
      'upper_west': 45,
      'brong_ahafo': 30,
      'bono': 30,
      'bono_east': 30,
      'ahafo': 30,
      'savannah': 40,
      'north_east': 45,
      'oti': 35,
    };
    
    return regionRates[region] || 25;
  };
  
  // Handle region selection
  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const region = e.target.value as GhanaRegionValue;
    setSelectedRegion(region);
    const fee = calculateShipping(region);
    setShippingFee(fee);
  };
  
  // Discount calculation (5% welcome offer)
  const discountPercent = 5;
  const discountAmount = (subtotal * discountPercent) / 100;

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/shop");
  };

  const startCheckout = async () => {
    const supabase = createClientComponentSupabaseClient();
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setShowAccountPrompt(true);
      return;
    }

    // User is logged in - check for addresses
    try {
      const response = await fetch("/api/addresses", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        const addresses = await response.json();
        if (!addresses || addresses.length === 0) {
          // No addresses - redirect to add address
          router.push("/account/addresses?redirect=/checkout");
          return;
        }
      }
    } catch (error) {
      console.error("Error checking addresses:", error);
      // Continue to checkout anyway if API fails
    }

    // Has addresses or we couldn't check - proceed to checkout
    router.push("/checkout");
  };

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-16 text-center shadow-lg">
          <div className="flex justify-center">
            <div className="rounded-full bg-slate-100 p-6">
              <ShoppingBag className="h-12 w-12 text-slate-400" />
            </div>
          </div>
          <h1 className="mt-8 text-3xl font-bold text-slate-950">Your cart is empty</h1>
          <p className="mt-3 text-slate-600">Browse our collection and add your favorite items to get started.</p>
          <Link 
            href="/shop"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-8 py-4 font-semibold text-white transition hover:bg-orange-700 shadow-md hover:shadow-lg"
          >
            <ShoppingBag className="h-5 w-5" />
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/shop"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
          aria-label="Continue shopping"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Continue Shopping
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr,420px]">
        {/* Cart Items Table */}
        <div className="space-y-6">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 pb-4 border-b border-slate-200 text-sm font-semibold text-slate-600 uppercase tracking-wide">
            <div>Product</div>
            <div className="text-center">Price</div>
            <div className="text-center">Quantity</div>
            <div className="text-center">Subtotal</div>
            <div className="w-10"></div>
          </div>

          {/* Cart Items */}
          {items.map((item) => (
            <div key={item.id} className="grid md:grid-cols-[2fr,1fr,1fr,1fr,auto] gap-4 items-center py-4 border-b border-slate-100">
              {/* Product Info */}
              <div className="flex gap-4 items-start">
                <div className="relative flex-shrink-0">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="h-16 w-16 md:h-20 md:w-20 rounded-lg object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm md:text-base font-semibold text-slate-900 line-clamp-2">{item.name}</h3>
                  {item.variant && (
                    <p className="mt-1 text-xs text-slate-600">Colour: {item.variant}</p>
                  )}
                  {/* Mobile: Show Remove link */}
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="md:hidden mt-2 text-xs text-red-500 hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="text-sm md:text-base font-semibold text-slate-900 md:text-center">
                <span className="md:hidden text-slate-600 mr-2">Price:</span>
                GHS {item.price.toFixed(2)}
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center justify-start md:justify-center">
                <div className="flex items-center gap-1 border border-slate-300 rounded-md bg-slate-50">
                  <button 
                    onClick={() => updateQuantity(item.id, Math.max(item.quantity - 1, 1))}
                    className="p-2 hover:bg-slate-100 transition text-slate-600"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-10 text-center text-sm font-medium text-slate-900">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-2 hover:bg-slate-100 transition text-slate-600"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Subtotal */}
              <div className="text-sm md:text-base font-bold text-slate-900 md:text-center">
                <span className="md:hidden text-slate-600 mr-2">Subtotal:</span>
                GHS {(item.price * item.quantity).toFixed(2)}
              </div>

              {/* Remove Button - Desktop */}
              <button 
                onClick={() => removeItem(item.id)}
                className="hidden md:flex items-center justify-center w-10 h-10 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Remove item"
                aria-label={`Remove ${item.name} from cart`}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}

          {/* Continue Shopping & Empty Cart Links */}
          <div className="flex items-center justify-between pt-4">
            <Link 
              href="/shop"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to empty your cart?')) {
                  items.forEach(item => removeItem(item.id));
                }
              }}
              className="text-sm text-red-500 hover:text-red-700 font-medium transition"
            >
              Empty Cart
            </button>
          </div>

          {/* Stock Warning Message */}
          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900">Stock Limit Reached</p>
                <p className="mt-1 text-sm text-amber-800">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <aside className="h-fit rounded-lg border border-slate-200 bg-white shadow-sm">
          {/* Header */}
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-xl font-bold text-slate-950">Order Summary</h2>
          </div>
          
          {/* Breakdown */}
          <div className="px-6 py-5 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span>
              <span className="font-semibold text-slate-900">GHS {subtotal.toFixed(2)}</span>
            </div>
            
            {/* Shipping with Region Selector */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Shipping</span>
                <span className="font-semibold text-slate-900">
                  {selectedRegion ? `GHS ${shippingFee.toFixed(2)}` : 'Select region below'}
                </span>
              </div>
              
              {/* Region Dropdown */}
              <div className="relative">
                <label htmlFor="region-select" className="sr-only">Deliver to which region?</label>
                <select
                  id="region-select"
                  value={selectedRegion}
                  onChange={handleRegionChange}
                  className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-4 py-2.5 pr-10 text-sm text-slate-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition cursor-pointer"
                >
                  {GHANA_REGIONS.map((region) => (
                    <option key={region.value} value={region.value}>
                      {region.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            
            {/* Discount */}
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Discount</span>
              <span className="font-semibold text-green-600">-GHS {discountAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-slate-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <span className="text-base font-semibold text-slate-950">Total (excl. shipping)</span>
              <span className="text-2xl font-bold text-slate-950">GHS {(subtotal - discountAmount).toFixed(2)}</span>
            </div>
          </div>

          {/* Welcome Offer Banner */}
          <div className="mx-6 mb-5 rounded-lg bg-green-50 border border-green-200 p-3 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-900">Welcome Offer — 5% Off First Order</p>
              <p className="text-xs text-green-700 mt-0.5">GHS {discountAmount.toFixed(2)} saved</p>
            </div>
            <button className="ml-auto text-green-700 hover:text-green-900">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Payment Methods */}
          <div className="px-6 pb-5">
            <p className="text-xs text-slate-600 mb-2">Accepted payments:</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-md border border-slate-200">MTN MoMo</span>
              <span className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-md border border-slate-200">Telecel Cash</span>
              <span className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-md border border-slate-200">AirtelTigo</span>
              <span className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-md border border-slate-200">Paystack</span>
              <span className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-md border border-slate-200">Visa/MC</span>
            </div>
          </div>

          {/* Checkout Button */}
          <div className="px-6 pb-6">
            <button
              onClick={startCheckout}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-6 py-3.5 text-base font-bold text-white transition hover:bg-orange-700 shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              <Shield className="h-5 w-5" />
              Proceed to Checkout
            </button>
            <p className="mt-3 text-center text-xs text-slate-500 flex items-center justify-center gap-1">
              <Shield className="h-3 w-3" />
              Secure checkout powered by Paystack
            </p>
          </div>
        </aside>
      </div>

      {showAccountPrompt ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="account-prompt-title">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-8 shadow-2xl">
            <button 
              onClick={() => setShowAccountPrompt(false)} 
              aria-label="Close" 
              className="absolute right-4 top-4 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Icon */}
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100">
              <CircleUserRound className="h-7 w-7 text-orange-600" />
            </div>

            {/* Content */}
            <h2 id="account-prompt-title" className="mt-6 text-2xl font-bold text-slate-950">Sign in to checkout</h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">Create an account or sign in to securely checkout and track your orders. It takes just 30 seconds!</p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col gap-3">
              <Link 
                href="/auth/login?redirect=/checkout" 
                className="rounded-lg bg-orange-600 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-orange-700 shadow-md hover:shadow-lg"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/register?redirect=/checkout" 
                className="rounded-lg border border-orange-300 bg-orange-50 px-5 py-3 text-center text-sm font-bold text-orange-600 transition hover:bg-orange-100"
              >
                Create Account
              </Link>
            </div>

            {/* Privacy Note */}
            <p className="mt-4 text-xs text-slate-500 text-center">We'll never share your personal information</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
