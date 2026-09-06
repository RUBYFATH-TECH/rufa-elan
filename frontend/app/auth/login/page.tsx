"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import { isKnownAdminEmail } from "@/lib/admin-common";
import { GoogleOAuthButton } from "@/components/google-oauth-button";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

type LoginFormValues = z.infer<typeof loginSchema>;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClientComponentSupabaseClient();
  const [isLoading, setIsLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      const email = data.session?.user?.email?.trim().toLowerCase();
      if (!data.session || !email) {
        return;
      }

      if (isKnownAdminEmail(email)) {
        router.replace("/admin/dashboard");
        return;
      }

      const res = await fetch("/api/admin/check");
      if (res.ok) {
        router.replace("/admin/dashboard");
        return;
      }

      router.replace("/account");
    };

    checkSession();
  }, [router, supabase]);

  const signInWithGoogle = async () => {
    setServerMessage(null);
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/account` }
    });

    setIsLoading(false);

    if (error) {
      setServerMessage(error.message);
      return;
    }

    if (data?.url) {
      window.location.assign(data.url);
    }
  };

  const checkAdminSession = async () => {
    try {
      const res = await fetch("/api/admin/check");
      return res.ok;
    } catch {
      return false;
    }
  };

  const checkAdminEmail = async (email: string) => {
    try {
      const { data: adminUser, error: adminError } = await supabase
        .from("admin_users")
        .select("id")
        .ilike("email", email)
        .maybeSingle();

      return !!adminUser && !adminError;
    } catch {
      return false;
    }
  };

  const onSubmit = async (values: LoginFormValues) => {
    setServerMessage(null);
    setIsLoading(true);

    const email = values.email.trim().toLowerCase();
    const password = values.password;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setIsLoading(false);
      setServerMessage(error.message);
      return;
    }

    const sessionResponse = await supabase.auth.getSession();
    setIsLoading(false);

    const currentEmail = sessionResponse.data.session?.user?.email?.trim().toLowerCase() ?? email;
    const isAdmin = await checkAdminSession() || isKnownAdminEmail(currentEmail) || await checkAdminEmail(currentEmail);

    await sleep(150);
    router.push(isAdmin ? "/admin/dashboard" : "/account");
    return;
  };

  return (
    <section className="mx-auto max-w-md px-6 py-20 sm:px-8 lg:px-12">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-soft">
        <div className="mb-6 flex items-center justify-center">
          <img src="/images/logo.png" alt="RUFA ELAN" className="h-12 w-auto" />
        </div>
        <h1 className="text-3xl font-semibold text-slate-950">Login</h1>
        <p className="mt-2 text-sm text-slate-600">Sign in to access your orders, wishlist, and delivery tracking.</p>
        <div className="mt-6">
          <GoogleOAuthButton onClick={signInWithGoogle} disabled={isLoading} />
          <div className="relative my-6 text-center text-xs uppercase text-slate-400">
            <span className="absolute left-0 top-1/2 h-px w-full bg-slate-200"></span>
            <span className="relative inline-block bg-white px-3">or continue with email</span>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <label className="block text-sm text-slate-700">
            Email
            <input {...register("email")} className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-300" />
            {errors.email ? <p className="mt-2 text-xs text-red-600">{errors.email.message}</p> : null}
          </label>
          <label className="block text-sm text-slate-700">
            Password
            <input type="password" {...register("password")} className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-300" />
            {errors.password ? <p className="mt-2 text-xs text-red-600">{errors.password.message}</p> : null}
          </label>
          <button type="submit" disabled={isLoading} className="w-full rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {serverMessage ? <p className="mt-5 text-sm text-slate-700">{serverMessage}</p> : null}

        <p className="mt-6 text-sm text-slate-600">Don’t have an account? <Link href="/auth/register" className="font-semibold text-brand-700">Create one</Link></p>
        <p className="mt-3 text-sm text-slate-600"><Link href="/auth/forgot-password" className="font-semibold text-brand-700">Forgot password?</Link></p>
      </div>
    </section>
  );
}
