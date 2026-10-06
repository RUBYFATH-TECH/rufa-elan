"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart-store";
import { ArrowLeft, CircleUserRound, ShoppingBag, Trash2, X, Minus, Plus, Truck, Shield, RotateCcw, AlertTriangle } from "lucide-react";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";

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
        <button
          type="button"
          onClick={goBack}
          className="mb-4 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          aria-label="Go back to the previous page"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-slate-950">Shopping Cart</h1>
        <p className="mt-2 text-slate-600">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr,380px]">
        {/* Cart Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-all group">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                {/* Top row: Image and Product Info with Remove button */}
                <div className="flex gap-4 flex-1">
                  {/* Product Image */}
                  <div className="relative flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="h-20 w-20 sm:h-24 sm:w-24 rounded-lg object-cover shadow-sm group-hover:shadow-md transition"
                    />
                    {item.variant && (
                      <div className="absolute -bottom-1 -right-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-orange-700">
                        {item.variant}
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">{item.name}</h3>
                        <p className="mt-0.5 text-xs sm:text-sm text-slate-600">{item.variant ?? "Standard"}</p>
                      </div>
                      
                      {/* Remove Button - Mobile: Top Right */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(item.id);
                        }}
                        className="flex-shrink-0 p-1.5 sm:hidden text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition touch-manipulation"
                        title="Remove item"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {/* Stock Information */}
                    {item.stock_quantity !== undefined && (
                      <div className="mt-1">
                        {item.stock_quantity > 0 ? (
                          <p className={`text-[10px] sm:text-xs font-medium ${
                            item.stock_quantity <= 5 
                              ? 'text-orange-600' 
                              : 'text-green-600'
                          }`}>
                            {item.stock_quantity <= 5 
                              ? `Only ${item.stock_quantity} left!` 
                              : `${item.stock_quantity} available`
                            }
                          </p>
                        ) : (
                          <p className="text-[10px] sm:text-xs font-medium text-red-600">Out of stock</p>
                        )}
                      </div>
                    )}
                    
                    {/* Price - Mobile only */}
                    <p className="mt-2 text-base sm:hidden font-bold text-slate-950">GHS {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>

                {/* Bottom row: Quantity and Price - Desktop version */}
                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 p-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(item.id, Math.max(item.quantity - 1, 1));
                      }}
                      className="p-1.5 sm:p-2 hover:bg-white rounded-md transition text-slate-600 hover:text-slate-900 touch-manipulation active:scale-95"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 sm:w-10 text-center text-sm font-semibold text-slate-900">{item.quantity}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(item.id, item.quantity + 1);
                      }}
                      className="p-1.5 sm:p-2 hover:bg-white rounded-md transition text-slate-600 hover:text-slate-900 touch-manipulation active:scale-95"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Price - Desktop */}
                  <p className="hidden sm:block text-lg font-bold text-slate-950 min-w-[100px] text-right">
                    GHS {(item.price * item.quantity).toFixed(2)}
                  </p>

                  {/* Remove Button - Desktop only */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(item.id);
                    }}
                    className="hidden sm:flex flex-shrink-0 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Remove item"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Continue Shopping */}
          <Link 
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold transition"
          >
            ← Continue Shopping
          </Link>

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
        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-md sticky top-4">
          {/* Header */}
          <h2 className="text-lg font-bold text-slate-950">Order Summary</h2>
          
          {/* Breakdown */}
          <div className="mt-6 space-y-4 border-b border-slate-200 pb-6">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-semibold text-slate-900">GHS {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Shipping</span>
              <span className="font-semibold text-slate-900">GHS {shippingEstimate.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tax</span>
              <span className="font-semibold text-slate-900">Calculated at checkout</span>
            </div>
          </div>

          {/* Total */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-950">Total</span>
              <span className="text-2xl font-bold text-orange-600">GHS {(subtotal + shippingEstimate).toFixed(2)}</span>
            </div>
            <p className="text-xs text-slate-500">Excluding tax and final adjustments</p>
          </div>

          {/* Checkout Button */}
          <button
            onClick={startCheckout}
            className="w-full mt-6 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 px-6 py-3.5 text-sm font-bold text-white transition hover:from-orange-700 hover:to-red-700 shadow-md hover:shadow-lg active:scale-95"
          >
            Proceed to Checkout
          </button>

          {/* Trust Badges */}
          <div className="mt-6 space-y-3 border-t border-slate-200 pt-6">
            <div className="flex items-center gap-3 text-xs">
              <Truck className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <span className="text-slate-700"><span className="font-semibold">Free Delivery</span> on orders over GHS 500</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="text-slate-700"><span className="font-semibold">Secure Checkout</span> with Paystack</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <RotateCcw className="h-4 w-4 text-purple-600 flex-shrink-0" />
              <span className="text-slate-700"><span className="font-semibold">30-Day Returns</span> on all items</span>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="mt-6 rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900">
            <p className="font-semibold mb-1">Shipping Information</p>
            <p>Delivery fees calculated at checkout based on your location and selected service.</p>
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
