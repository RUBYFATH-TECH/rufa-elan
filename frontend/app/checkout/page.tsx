"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore, type CartItem } from "@/store/cart-store";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import { MapPin, Truck, ChevronDown, Plus, AlertCircle, CheckCircle, Loader } from "lucide-react";
import addressesService, { type Address } from "@/lib/api-services/addresses";

// Leaflet map component - dynamic import
const DeliveryMap = dynamic(() => import("@/components/delivery-map"), { 
  ssr: false,
  loading: () => <div className="w-full h-64 bg-slate-100 flex items-center justify-center rounded-lg">Loading map...</div>
});

type CheckoutPayload = {
  orderId: string;
  email: string;
  amount: number;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  items: CartItem[];
  shipping_address: {
    full_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    deliveryOption: string;
  };
};

export default function CheckoutPage() {
  const items = useCartStore((state: any) => state.items) as CartItem[];
  const clearCart = useCartStore((state: any) => state.clearCart);
  const router = useRouter();
  const supabase = createClientComponentSupabaseClient();
  
  const [hasMounted, setHasMounted] = useState(false);
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [deliveryOption, setDeliveryOption] = useState<"delivery" | "pickup">("delivery");
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [geocodingAddress, setGeocodingAddress] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<{ authorization_url: string; reference: string; amount: number; email: string } | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "initialized" | "verifying" | "success" | "failed">("idle");
  const [paystackScriptLoaded, setPaystackScriptLoaded] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingOrder, setPendingOrder] = useState<CheckoutPayload | null>(null);
  
  const totalAmount = useMemo(() => items.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0), [items]);
  
  // Calculate delivery fee based on distance
  const baseDeliveryFee = 8; // 8 cedis base
  const costPerKm = 1.2; // 1.2 cedis per km
  
  const deliveryFee = useMemo(() => {
    if (deliveryOption === "pickup") return 0;
    if (calculatedDistance === null) return baseDeliveryFee;
    
    // Base fee + (distance * cost per km)
    return Math.ceil((baseDeliveryFee + (calculatedDistance * costPerKm)) * 100) / 100;
  }, [calculatedDistance, deliveryOption]);
  
  const grandTotal = totalAmount + deliveryFee;
  const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";
  const isPaystackConfigured = paystackPublicKey.trim().length > 0;

  // Distance calculation function (Haversine formula)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return 6371 * c; // Distance in km
  };

  // Geocode address using OpenStreetMap Nominatim
  const geocodeAddress = async (address: Address) => {
    if (address.latitude && address.longitude) {
      // Use stored coordinates if available
      const distance = calculateDistance(KUMASI_OFFICE.lat, KUMASI_OFFICE.lng, address.latitude, address.longitude);
      setCalculatedDistance(Math.round(distance * 10) / 10);
      return;
    }

    try {
      setGeocodingAddress(true);
      const query = `${address.address}, ${address.city}, Ghana`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const results = await response.json();

      if (results && results.length > 0) {
        const lat = parseFloat(results[0].lat);
        const lng = parseFloat(results[0].lon);
        const distance = calculateDistance(KUMASI_OFFICE.lat, KUMASI_OFFICE.lng, lat, lng);
        setCalculatedDistance(Math.round(distance * 10) / 10);
      } else {
        // Fallback to default distance if geocoding fails
        setCalculatedDistance(15);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setCalculatedDistance(15); // Default distance
    } finally {
      setGeocodingAddress(false);
    }
  };

  // Load Paystack script
  useEffect(() => {
    if (!paystackPublicKey || paystackScriptLoaded) return;

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => setPaystackScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, [paystackPublicKey, paystackScriptLoaded]);

  // Load addresses on mount
  useEffect(() => {
    setHasMounted(true);
    
    const loadAddresses = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          router.push("/auth/login?redirect=/checkout");
          return;
        }

        // Use the addresses service to fetch addresses
        const addresses = await addressesService.getAddresses();
        console.log("Fetched addresses:", addresses);
        
        if (addresses && addresses.length > 0) {
          setUserAddresses(addresses);
          
          // Set default address as selected
          const defaultAddress = addresses.find((a: Address) => a.is_default) || addresses[0];
          setSelectedAddress(defaultAddress);
          
          // Calculate distance for the selected address
          await geocodeAddress(defaultAddress);
        } else {
          // No addresses - redirect to add address
          router.push("/account/addresses?redirect=/checkout");
          return;
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading addresses:", error);
        setMessage("Error loading addresses. Please try again.");
        setIsLoading(false);
      }
    };

    loadAddresses();
  }, [router, supabase]);

  // Update distance when address changes
  useEffect(() => {
    if (selectedAddress && deliveryOption === "delivery") {
      geocodeAddress(selectedAddress);
    }
  }, [selectedAddress, deliveryOption]);

  // Load Paystack script
  useEffect(() => {
    if (!paystackPublicKey || paystackScriptLoaded) return;

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => setPaystackScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, [paystackPublicKey, paystackScriptLoaded]);

  // Load addresses on mount
  useEffect(() => {
    setHasMounted(true);
    
    const loadAddresses = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          router.push("/auth/login?redirect=/checkout");
          return;
        }

        const response = await fetch("/api/addresses", {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });

        if (response.ok) {
          const addresses = await response.json();
          if (addresses && addresses.length > 0) {
            setUserAddresses(addresses);
            // Set default address as selected
            const defaultAddress = addresses.find((a: any) => a.is_default) || addresses[0];
            setSelectedAddress(defaultAddress);
          } else {
            // No addresses - redirect to add address
            router.push("/account/addresses?redirect=/checkout");
            return;
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading addresses:", error);
        setIsLoading(false);
      }
    };

    loadAddresses();
  }, [router, supabase]);

  const handleProceedToPayment = async () => {
    if (!selectedAddress) {
      setMessage("Please select an address");
      return;
    }

    if (!isPaystackConfigured) {
      setMessage("Payment service is not configured. Please try again later.");
      return;
    }

    const orderId = `RUFA-${Math.floor(Date.now() / 1000)}`;
    const orderPayload: CheckoutPayload = {
      orderId,
      email: selectedAddress.email,
      amount: grandTotal,
      subtotal: totalAmount,
      shipping_fee: deliveryFee,
      discount_amount: 0,
      items,
      shipping_address: {
        full_name: selectedAddress.full_name,
        email: selectedAddress.email,
        phone: selectedAddress.phone,
        address: selectedAddress.address,
        city: selectedAddress.city,
        deliveryOption
      }
    };

    setPendingOrder(orderPayload);

    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setMessage("Authentication required. Please log in.");
        setPaymentStatus("failed");
        return;
      }

      // Call backend payment initialization endpoint
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/payments/initialize`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          order_id: orderId,
          amount: grandTotal,
          email: selectedAddress.email,
          metadata: {
            delivery_option: deliveryOption,
            address_id: selectedAddress.id,
            items: items.map(i => ({
              product_variant_id: i.id,
              quantity: i.quantity,
              price: i.price
            }))
          }
        })
      });

      const responseText = await response.text();
      console.log("Raw response text:", responseText);
      console.log("Response status:", response.status);
      console.log("Response headers:", {
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length')
      });

      let data: any = {};
      try {
        if (responseText) {
          data = JSON.parse(responseText);
        }
      } catch (parseError) {
        console.error("JSON parse error:", parseError, "Text:", responseText);
        data = { message: `Invalid response from server: ${responseText}` };
      }

      if (!response.ok) {
        console.error("Payment init error response:", {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        setMessage(data.message || `Payment initialization failed (${response.status}).`);
        setPaymentStatus("failed");
        return;
      }

      // Check if response is empty
      if (!responseText || Object.keys(data).length === 0) {
        console.error("Empty response from backend");
        setMessage("Empty response from payment service. Please try again.");
        setPaymentStatus("failed");
        return;
      }

      if (!data.success) {
        console.error("Payment init not successful:", data);
        setMessage(data.message || "Payment initialization failed.");
        setPaymentStatus("failed");
        return;
      }

      const authorizationUrl = data.data?.authorization_url ?? "";
      if (!authorizationUrl) {
        console.error("No authorization URL in response:", data);
        setMessage("Payment service did not return authorization URL");
        setPaymentStatus("failed");
        return;
      }
      const reference = data.data?.reference ?? orderId;
      const paymentId = data.data?.payment_id;
      
      setPaymentUrl(authorizationUrl);
      setPaymentDetails({ authorization_url: authorizationUrl, reference, amount: grandTotal, email: selectedAddress.email });
      setPaymentStatus("initialized");
      setMessage(null);
      
      // Open Paystack
      openPaystackInline({ authorization_url: authorizationUrl, reference, amount: grandTotal, email: selectedAddress.email });
    } catch (error) {
      console.error("Payment error:", error);
      setMessage("Failed to initialize payment. Please try again.");
      setPaymentStatus("failed");
    }
  };

  const verifyPayment = async (reference: string) => {
    setPaymentStatus("verifying");
    setMessage("Verifying payment...");

    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setPaymentStatus("failed");
        setMessage("Authentication required for payment verification.");
        return;
      }

      // Call backend verify endpoint
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/api/payments/verify/${reference}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        }
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setPaymentStatus("failed");
        setMessage(data.message || "Payment verification failed.");
        console.error("Verification failed:", data);
        return;
      }

      // Payment verified successfully
      setPaymentStatus("success");
      setMessage("Payment successful! Your order has been placed.");

      try {
        clearCart();
      } catch (e) {
        console.error("Error clearing cart:", e);
      }

      // Redirect to orders or home page
      setTimeout(() => {
        router.push("/orders");
      }, 2000);
    } catch (error) {
      console.error("Verification error:", error);
      setPaymentStatus("failed");
      setMessage("An error occurred during verification. Please try again.");
    }
  };

  const openPaystackInline = (details: any) => {
    if (!paystackPublicKey || typeof window === "undefined") {
      window.open(details.authorization_url, "_blank");
      return;
    }

    const paystack = (window as any).PaystackPop;
    if (!paystack) {
      window.open(details.authorization_url, "_blank");
      return;
    }

    const handler = paystack.setup({
      key: paystackPublicKey,
      email: details.email,
      amount: Math.round(details.amount * 100),
      currency: "GHS",
      ref: details.reference,
      onClose: () => {
        setMessage("Payment window closed. Please verify your payment or try again.");
      },
      callback: (response: any) => {
        if (response?.reference) {
          verifyPayment(response.reference);
        } else {
          setPaymentStatus("failed");
          setMessage("Payment response did not return a reference.");
        }
      }
    });

    handler.openIframe();
  };

  if (!hasMounted || isLoading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-md">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="text-slate-600 mt-4">Loading checkout...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold mb-4 transition"
            >
              ← Go Back
            </button>
            <h1 className="text-3xl font-bold text-slate-950">Checkout</h1>
            <p className="mt-2 text-slate-600">Select delivery address and payment method</p>
          </div>

          {/* Messages */}
          {message && (
            <div className={`rounded-lg border p-4 flex items-center gap-3 ${
              paymentStatus === "success"
                ? "bg-green-50 border-green-200"
                : paymentStatus === "failed"
                ? "bg-red-50 border-red-200"
                : "bg-blue-50 border-blue-200"
            }`}>
              {paymentStatus === "success" ? (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-slate-600 flex-shrink-0" />
              )}
              <p className={`text-sm ${
                paymentStatus === "success"
                  ? "text-green-800"
                  : paymentStatus === "failed"
                  ? "text-red-800"
                  : "text-blue-800"
              }`}>
                {message}
              </p>
            </div>
          )}

          {/* Address Selection */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-orange-600" />
              <h2 className="text-lg font-bold text-slate-950">Delivery Address</h2>
            </div>

            {userAddresses.length > 0 ? (
              <div className="space-y-4">
                {userAddresses.length === 1 ? (
                  // Single address - just display it
                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                    <p className="font-bold text-slate-900">{selectedAddress?.label}</p>
                    <p className="text-sm text-slate-600 mt-1">{selectedAddress?.full_name}</p>
                    <p className="text-sm text-slate-600">{selectedAddress?.phone}</p>
                    <p className="text-sm text-slate-600 mt-2">{selectedAddress?.address}</p>
                    <p className="text-sm text-slate-600">{selectedAddress?.city}{selectedAddress?.region ? `, ${selectedAddress.region}` : ''}</p>
                  </div>
                ) : (
                  // Multiple addresses - show dropdown
                  <div className="relative">
                    <select
                      value={selectedAddress?.id || ""}
                      onChange={(e) => {
                        const address = userAddresses.find(a => a.id === e.target.value);
                        if (address) {
                          setSelectedAddress(address);
                        }
                      }}
                      className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-4 py-3 pr-10 text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    >
                      <option value="">Select a delivery address</option>
                      {userAddresses.map((address) => (
                        <option key={address.id} value={address.id}>
                          {address.label} - {address.address} {address.is_default ? "(Default)" : ""}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
                  </div>
                )}

                {/* Add New Address Link */}
                <Link
                  href="/account/addresses?redirect=/checkout"
                  className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-semibold"
                >
                  <Plus className="h-4 w-4" />
                  Add New Address
                </Link>
              </div>
            ) : (
              <Link
                href="/account/addresses?redirect=/checkout"
                className="block w-full rounded-lg border-2 border-dashed border-slate-300 p-8 text-center hover:border-orange-300 hover:bg-orange-50 transition"
              >
                <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="font-semibold text-slate-900">No addresses yet</p>
                <p className="text-sm text-slate-600 mt-1">Add a delivery address to proceed</p>
              </Link>
            )}
          </div>

          {/* Delivery Option */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="h-5 w-5 text-orange-600" />
              <h2 className="text-lg font-bold text-slate-950">Delivery Option</h2>
            </div>

            <div className="relative">
              <select
                value={deliveryOption}
                onChange={(e) => setDeliveryOption(e.target.value as "delivery" | "pickup")}
                className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-4 py-3 pr-10 text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="delivery">Standard Delivery to Address</option>
                <option value="pickup">Pickup from Kumasi Store</option>
              </select>
              <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>

            {/* Distance Info */}
            {deliveryOption === "delivery" && selectedAddress && (
              <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-4">
                {geocodingAddress ? (
                  <div className="flex items-center gap-2 text-sm text-blue-800">
                    <Loader className="h-4 w-4 animate-spin" />
                    Calculating distance...
                  </div>
                ) : calculatedDistance ? (
                  <div className="text-sm text-blue-900">
                    <p className="font-bold mb-2">📍 Distance: {calculatedDistance.toFixed(1)} km</p>
                    <p className="text-xs text-blue-700 mb-2">From: Kumasi Abrepo Junction</p>
                    <p className="text-xs text-blue-700">To: {selectedAddress.address}, {selectedAddress.city}</p>
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p className="font-semibold text-blue-900">
                        Delivery Fee: GHS {deliveryFee.toFixed(2)}
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        = GHS {baseDeliveryFee} (base) + ({calculatedDistance.toFixed(1)} km × GHS {costPerKm}/km)
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {deliveryOption === "pickup" && (
              <div className="mt-4 rounded-lg bg-green-50 border border-green-200 p-3">
                <p className="text-sm font-semibold text-green-900">Free Pickup</p>
                <p className="text-xs text-green-700 mt-1">Pickup from our Kumasi Abrepo Junction store</p>
              </div>
            )}
          </div>

          {/* Continue Button */}
          {selectedAddress && (
            <button
              onClick={handleProceedToPayment}
              disabled={paymentStatus === "verifying"}
              className="w-full rounded-lg bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4 text-lg font-bold text-white transition hover:from-orange-700 hover:to-red-700 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {paymentStatus === "verifying" ? "Processing..." : `Proceed to Payment - GHS ${grandTotal.toFixed(2)}`}
            </button>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-md sticky top-4">
          <h2 className="text-lg font-bold text-slate-950 mb-6">Order Summary</h2>

          {/* Items */}
          <div className="space-y-3 mb-6 border-b border-slate-200 pb-6">
            {items && items.length > 0 ? (
              items.map((item: CartItem) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{item.name || "Product"}</p>
                    <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right ml-2">
                    {item.price && (
                      <>
                        <p className="font-semibold text-slate-900">GHS {(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-xs text-slate-500">@ GHS {item.price.toFixed(2)} each</p>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600 py-4">No items in cart</p>
            )}
          </div>

          {/* Breakdown */}
          <div className="space-y-3 mb-6 border-b border-slate-200 pb-6">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-semibold text-slate-900">GHS {totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">{deliveryOption === "delivery" ? "Delivery" : "Pickup"}</span>
              <span className="font-semibold text-slate-900">GHS {deliveryFee.toFixed(2)}</span>
            </div>
            {deliveryOption === "delivery" && calculatedDistance && (
              <div className="flex justify-between text-xs text-slate-500">
                <span>Distance</span>
                <span>{calculatedDistance.toFixed(1)} km</span>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="flex justify-between items-end mb-6">
            <span className="font-bold text-slate-950">Total Amount</span>
            <span className="text-3xl font-bold text-orange-600">GHS {grandTotal.toFixed(2)}</span>
          </div>

          {/* Google Maps */}
          {deliveryOption === "delivery" && selectedAddress && (
            <div className="rounded-lg overflow-hidden border border-slate-200 mb-6">
              <div className="bg-slate-100 p-4">
                <p className="text-xs font-bold text-slate-700 mb-2">📍 DISTANCE TO DELIVERY ADDRESS</p>
                {geocodingAddress ? (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Loader className="h-4 w-4 animate-spin" />
                    Calculating...
                  </div>
                ) : calculatedDistance ? (
                  <div className="space-y-2">
                    <div className="bg-white rounded p-3">
                      <p className="text-lg font-bold text-slate-950">{calculatedDistance.toFixed(1)} km</p>
                      <p className="text-xs text-slate-500">From Kumasi Abrepo Junction</p>
                    </div>
                    <p className="text-xs text-slate-600">
                      📍 To: {selectedAddress.address}, {selectedAddress.city}
                    </p>
                  </div>
                ) : null}
              </div>
              
          {/* Google Maps Embed */}
          {selectedAddress && calculatedDistance && (
            <DeliveryMap
              startLat={6.6753}
              startLng={-1.6169}
              endLat={selectedAddress.latitude || 6.0}
              endLng={selectedAddress.longitude || -1.5}
              distance={calculatedDistance}
              startLabel="Kumasi Abrepo Junction"
              endLabel={selectedAddress.city}
            />
          )}
            </div>
          )}

          {/* Live Order Tracking */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-center">
            <p className="text-sm font-semibold text-blue-900 mb-2">Order Reference</p>
            <p className="text-lg font-bold text-blue-600">RUFA-1001</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
