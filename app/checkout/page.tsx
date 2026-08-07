"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useCartStore, type CartItem } from "@/store/cart-store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const OrderTrackingMap = dynamic(() => import("@/components/order-tracking-map"), { ssr: false });

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(9, "Enter a phone number"),
  city: z.string().min(2, "Enter your city"),
  address: z.string().min(5, "Enter a delivery address"),
  deliveryOption: z.enum(["delivery", "pickup"])
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const items = useCartStore((state: any) => state.items) as CartItem[];
  const [hasMounted, setHasMounted] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<CheckoutFormValues>({ resolver: zodResolver(checkoutSchema), defaultValues: { deliveryOption: "delivery" } });
  const totalAmount = useMemo(() => items.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0), [items]);
  const selectedDeliveryOption = watch("deliveryOption") ?? "delivery";

  const checkoutStoreLocation = { lat: 5.6037, lng: -0.1870 }; // Accra store coordinates

  const calculateDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return 6371 * c;
  };

  const deliveryRates: Record<string, number> = {
    delivery: 15.0,
    pickup: 0.0
  };

  const getDistanceBasedDeliveryRate = (option: string) => {
    if (option === "pickup") return 0.0;
    const baseRate = deliveryRates.delivery;
    if (!userLocation) return baseRate;

    const distKm = calculateDistanceKm(checkoutStoreLocation.lat, checkoutStoreLocation.lng, userLocation.lat, userLocation.lng);
    const extraDistance = Math.max(0, distKm - 5);
    return parseFloat((baseRate + extraDistance * 2.0).toFixed(2));
  };

  const selectedDeliveryCost = getDistanceBasedDeliveryRate(selectedDeliveryOption);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const onSubmit = async (values: CheckoutFormValues) => {
    setMessage(null);
    if (items.length === 0) {
      setMessage("Your cart is empty.");
      return;
    }

    const orderId = `RUFA-${Math.floor(Date.now() / 1000)}`;
    const deliveryCost = getDistanceBasedDeliveryRate(values.deliveryOption);
    const grandTotal = totalAmount + deliveryCost;

    const response = await fetch("/api/paystack/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: values.email,
        amount: grandTotal,
        orderId,
        metadata: {
          deliveryOption: values.deliveryOption,
          distanceKm: userLocation ? calculateDistanceKm(checkoutStoreLocation.lat, checkoutStoreLocation.lng, userLocation.lat, userLocation.lng).toFixed(2) : null
        }
      })
    });

    const responseText = await response.text();
    let data: any;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (error) {
      data = { message: responseText || "Invalid response from payment service." };
    }

    if (!response.ok) {
      setMessage(data.message || `Payment initialization failed (${response.status}).`);
      return;
    }

    setPaymentUrl(data.data?.authorization_url ?? "");
  };

  if (!hasMounted) {
    return null;
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:px-8 lg:px-12">
      <div className="grid gap-10 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
          <h1 className="text-3xl font-semibold text-slate-950">Checkout</h1>
          <p className="mt-4 text-slate-600">Enter your shipping details and choose your preferred delivery option.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-700">
                Full name
                <input {...register("fullName")} className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-300" />
                {errors.fullName ? <p className="mt-2 text-xs text-red-600">{errors.fullName.message}</p> : null}
              </label>
              <label className="block text-sm text-slate-700">
                Email
                <input {...register("email")} className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-300" />
                {errors.email ? <p className="mt-2 text-xs text-red-600">{errors.email.message}</p> : null}
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-700">
                Phone
                <input {...register("phone")} className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-300" />
                {errors.phone ? <p className="mt-2 text-xs text-red-600">{errors.phone.message}</p> : null}
              </label>
              <label className="block text-sm text-slate-700">
                City
                <input {...register("city")} className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-300" />
                {errors.city ? <p className="mt-2 text-xs text-red-600">{errors.city.message}</p> : null}
              </label>
            </div>
            <label className="block text-sm text-slate-700">
              Delivery address
              <textarea {...register("address")} className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-300" rows={4} />
              {errors.address ? <p className="mt-2 text-xs text-red-600">{errors.address.message}</p> : null}
            </label>
            <div className="mb-4 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-sm font-semibold text-slate-900">Use your location for delivery pricing</p>
              <p className="mt-2 text-sm text-slate-600">Allow location to calculate an accurate delivery fee based on distance from our Accra fulfillment center.</p>
              <button
                type="button"
                onClick={async () => {
                  setIsLocating(true);
                  setLocationMessage(null);
                  if (!navigator.geolocation) {
                    setLocationMessage("Location is not available in this browser.");
                    setIsLocating(false);
                    return;
                  }

                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      const coords = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                      };
                      setUserLocation(coords);
                      const distance = calculateDistanceKm(checkoutStoreLocation.lat, checkoutStoreLocation.lng, coords.lat, coords.lng);
                      setLocationMessage(`Distance to our store: ${distance.toFixed(2)} km. Delivery fee has been updated.`);
                      setIsLocating(false);
                    },
                    (error) => {
                      setLocationMessage(error.message || "Unable to get your location.");
                      setIsLocating(false);
                    },
                    { enableHighAccuracy: true, timeout: 10000 }
                  );
                }}
                className="mt-4 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                {isLocating ? "Getting location..." : "Use my current location"}
              </button>
              {locationMessage ? <p className="mt-3 text-sm text-slate-600">{locationMessage}</p> : null}
            </div>
            <label className="block text-sm text-slate-700">
              Delivery option
              <select {...register("deliveryOption")} className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-300">
                <option value="delivery">Delivery — location-based fee</option>
                <option value="pickup">Pickup (no delivery) — GHS 0.00</option>
              </select>
              {errors.deliveryOption ? <p className="mt-2 text-xs text-red-600">{errors.deliveryOption.message}</p> : null}
            </label>
            <button type="submit" className="w-full rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800">Continue to payment</button>
          </form>
          {message ? <p className="mt-6 text-sm text-red-600">{message}</p> : null}
          {paymentUrl ? (
            <div className="mt-6 rounded-3xl border border-brand-200 bg-brand-50 p-6 text-brand-900">
              <p className="font-semibold">Payment ready</p>
              <a href={paymentUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-full bg-brand-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-800">
                Complete payment on Paystack
              </a>
            </div>
          ) : null}
        </div>
        <aside className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
          <h2 className="text-xl font-semibold text-slate-950">Order summary</h2>
          <div className="mt-6 space-y-4">
            {items.map((item: CartItem) => (
              <div key={item.id} className="flex items-center justify-between gap-4 text-sm text-slate-700">
                <span>{item.name} x{item.quantity}</span>
                <span>GHS {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 border-t border-slate-200 pt-6 text-slate-900">
            <div className="flex items-center justify-between text-sm">
              <span>Subtotal</span>
              <span>GHS {totalAmount.toFixed(2)}</span>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span>{selectedDeliveryOption === "pickup" ? "Pickup" : "Delivery"}</span>
              <span>GHS {selectedDeliveryCost.toFixed(2)}</span>
            </div>
            {selectedDeliveryOption === "delivery" ? (
              <div className="mt-2 rounded-3xl bg-brand-50 p-3 text-sm text-brand-700">
                {userLocation
                  ? `Distance: ${calculateDistanceKm(checkoutStoreLocation.lat, checkoutStoreLocation.lng, userLocation.lat, userLocation.lng).toFixed(2)} km`
                  : "Enable location to calculate the delivery fee."}
              </div>
            ) : null}
            <div className="mt-4 flex items-center justify-between text-sm font-semibold">
              <span>Total</span>
              <span>GHS {(totalAmount + selectedDeliveryCost).toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-6">
            <OrderTrackingMap orderNumber={"RUFA-1001"} pollIntervalMs={5000} />
          </div>
        </aside>
      </div>
    </section>
  );
}
