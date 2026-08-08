"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ChangeEvent } from "react";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import { isKnownAdminEmail } from "@/lib/admin-common";

type OrderHistory = {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  shipping_address: { full_name: string; city: string; deliveryOption: string };
};

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClientComponentSupabaseClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [user, setUser] = useState<{ id?: string; avatar_url?: string | null } | null>(null);
  const [orders, setOrders] = useState<OrderHistory[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersMessage, setOrdersMessage] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user;
      if (!sessionUser) {
        setIsLoading(false);
        return;
      }

      const email = sessionUser.email?.trim().toLowerCase();
      if (email) {
        if (isKnownAdminEmail(email)) {
          router.replace("/admin/dashboard");
          return;
        }

        const { data: adminUser } = await supabase
          .from("admin_users")
          .select("id")
          .ilike("email", email)
          .maybeSingle();

        if (adminUser) {
          router.replace("/admin/dashboard");
          return;
        }
      }

      setUser({
        id: sessionUser.id,
        avatar_url: sessionUser.user_metadata?.avatar_url ?? null
      });
      setIsLoading(false);
    };

    loadSession();
  }, [router, supabase]);

  useEffect(() => {
    const loadOrders = async () => {
      if (!user?.id) return;
      setOrdersLoading(true);
      setOrdersMessage(null);

      const res = await fetch(`/api/account/orders`);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setOrdersMessage(data?.message ?? "Unable to load your orders.");
        setOrdersLoading(false);
        return;
      }

      const data = await res.json();
      setOrders(data ?? []);
      setOrdersLoading(false);
    };

    loadOrders();
  }, [user?.id]);

  const handleSignOut = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    setIsLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    router.push("/auth/login");
  };

  const STORAGE_BUCKET = "avatars";

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    setMessage(null);
    setIsUploading(true);

    const filePath = `${STORAGE_BUCKET}/${user.id}/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, { cacheControl: "3600", upsert: true });

    if (uploadError) {
      const bucketError = uploadError.message.includes("Bucket not found")
        ? `Bucket not found. Create a Storage bucket named "${STORAGE_BUCKET}" in your Supabase project.`
        : uploadError.message;
      setMessage(bucketError);
      setIsUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(uploadData.path);

    if (!publicUrlData?.publicUrl) {
      setMessage("Unable to generate avatar URL.");
      setIsUploading(false);
      return;
    }

    const avatarUrl = publicUrlData.publicUrl;
    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: avatarUrl }
    });

    setIsUploading(false);
    if (updateError) {
      setMessage(updateError.message);
      return;
    }

    setUser((current) => current ? { ...current, avatar_url: avatarUrl } : current);
    setMessage("Profile photo updated successfully.");
  };

  if (isLoading) {
    return (
      <section className="mx-auto max-w-5xl px-6 py-20 sm:px-8 lg:px-12">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-12 shadow-soft">
          <p className="text-sm text-slate-600">Loading your account...</p>
        </div>
      </section>
    );
  }

  if (!user?.id) {
    return (
      <section className="mx-auto max-w-5xl px-6 py-20 sm:px-8 lg:px-12">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-12 shadow-soft">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Account</p>
            <h1 className="mt-4 text-4xl font-semibold text-slate-950">Welcome back</h1>
            <p className="mt-4 text-slate-600">Please sign in or create an account to view your dashboard.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Link href="/auth/login" className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 text-center text-slate-900 transition hover:border-brand-300">
              <p className="text-xl font-semibold">Login</p>
              <p className="mt-3 text-slate-600">Access existing account and order history.</p>
            </Link>
            <Link href="/auth/register" className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 text-center text-slate-900 transition hover:border-brand-300">
              <p className="text-xl font-semibold">Register</p>
              <p className="mt-3 text-slate-600">Create a new account for fast checkout and tracking.</p>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-20 sm:px-8 lg:px-12">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-12 shadow-soft">
        <div className="mb-8 flex flex-col items-center gap-5 text-center">
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-brand-100 bg-slate-100 shadow-sm">
            <img
              src={user?.avatar_url ?? "/images/avatar.svg"}
              alt="User avatar"
              className="h-full w-full object-cover"
            />
          </div>
          <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Account dashboard</p>
          <h1 className="text-4xl font-semibold text-slate-950">Welcome back</h1>
          <p className="max-w-xl text-slate-600">Manage your account, orders, wishlist, and saved information.</p>
        </div>

        {message ? <p className="mb-6 rounded-3xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p> : null}

        <div className="grid gap-6 md:grid-cols-2">
          <button onClick={handleSignOut} className="rounded-[2rem] border border-slate-200 bg-slate-950 px-6 py-6 text-sm font-semibold text-white transition hover:bg-slate-800">
            Sign out
          </button>
          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Account</p>
            <p className="mt-3 text-lg font-semibold text-slate-950">Profile is secured</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-6 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Upload profile photo</p>
          <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-100">
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            {isUploading ? "Uploading photo..." : "Choose photo"}
          </label>
          <p className="text-sm text-slate-600">Supported formats: JPG, PNG, GIF. Your photo will be saved to your account profile.</p>
        </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Link href="/wishlist" className="rounded-[2rem] border border-slate-200 bg-white p-6 text-slate-900 transition hover:border-brand-300">
            <p className="text-lg font-semibold">Wishlist</p>
            <p className="mt-2 text-sm text-slate-600">View saved products and favorites.</p>
          </Link>
          <Link href="/cart" className="rounded-[2rem] border border-slate-200 bg-white p-6 text-slate-900 transition hover:border-brand-300">
            <p className="text-lg font-semibold">Cart</p>
            <p className="mt-2 text-sm text-slate-600">Review your saved items and proceed to checkout.</p>
          </Link>
        </div>

        <div className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Order history</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">Your purchases</h2>
            </div>
            <p className="text-sm text-slate-600">Recent orders from your account</p>
          </div>

          {ordersLoading ? (
            <div className="mt-8 space-y-3">
              <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          ) : ordersMessage ? (
            <p className="mt-8 text-sm text-red-600">{ordersMessage}</p>
          ) : orders.length === 0 ? (
            <p className="mt-8 text-sm text-slate-600">You have no purchased orders yet.</p>
          ) : (
            <div className="mt-8 space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Order #{order.order_number}</p>
                      <p className="mt-1 text-xl font-semibold text-slate-950">GHS {order.total_amount.toFixed(2)}</p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <span className="rounded-3xl bg-white px-4 py-2 text-sm text-slate-700">{order.status}</span>
                      <span className="rounded-3xl bg-white px-4 py-2 text-sm text-slate-700">{order.payment_status}</span>
                      <span className="rounded-3xl bg-white px-4 py-2 text-sm text-slate-700">{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl border border-slate-200 bg-white p-4">
                      <p className="text-sm font-semibold text-slate-900">Shipping</p>
                      <p className="mt-2 text-sm text-slate-600">{order.shipping_address.full_name}</p>
                      <p className="text-sm text-slate-600">{order.shipping_address.city}</p>
                      <p className="text-sm text-slate-600">{order.shipping_address.deliveryOption}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white p-4">
                      <p className="text-sm font-semibold text-slate-900">Items</p>
                      <div className="mt-3 space-y-3">
                        {order.items.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex items-center justify-between gap-3 text-sm text-slate-700">
                            <span>{item.name} x{item.quantity}</span>
                            <span>GHS {(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        {order.items.length > 3 ? <p className="text-xs text-slate-500">+{order.items.length - 3} more items</p> : null}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
