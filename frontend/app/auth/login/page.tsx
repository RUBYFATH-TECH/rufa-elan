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
  const getDestination = () => {
    const redirect = new URLSearchParams(window.location.search).get("redirect");
    return redirect?.startsWith("/") && !redirect.startsWith("//") ? redirect : "/account";
  };

  useEffect(() => {
    // Check for error messages from auth callback
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error) {
      setServerMessage(decodeURIComponent(error));
      // Clear the error from URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('error');
      window.history.replaceState({}, '', newUrl.toString());
    }

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      const email = data.session?.user?.email?.trim().toLowerCase();
      if (!data.session || !email) return;
      if (isKnownAdminEmail(email) || (await fetch("/api/admin/check")).ok) {
        router.replace("/admin/dashboard");
        return;
      }
      router.replace(getDestination());
    };
    checkSession();
  }, [router, supabase]);

  const signInWithGoogle = async () => {
    setServerMessage(null);
    setIsLoading(true);
    
    // Use the server-side callback route for proper PKCE handling
    const callbackUrl = `${window.location.origin}/auth/callback`;
    const currentRedirect = getDestination();
    
    // Add redirect parameter to callback URL if it's not the default
    const finalCallbackUrl = currentRedirect !== '/account' 
      ? `${callbackUrl}?next=${encodeURIComponent(currentRedirect)}`
      : callbackUrl;
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { 
        redirectTo: finalCallbackUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    
    setIsLoading(false);
    if (error) return setServerMessage(error.message);
    if (data?.url) window.location.assign(data.url);
  };

  const onSubmit = async (values: LoginFormValues) => {
    setServerMessage(null);
    setIsLoading(true);
    const email = values.email.trim().toLowerCase();
    const { error } = await supabase.auth.signInWithPassword({ email, password: values.password });
    if (error) {
      setIsLoading(false);
      return setServerMessage(error.message);
    }
    const session = await supabase.auth.getSession();
    setIsLoading(false);
    const currentEmail = session.data.session?.user?.email?.trim().toLowerCase() ?? email;
    const isAdmin = isKnownAdminEmail(currentEmail) || (await fetch("/api/admin/check")).ok;
    await sleep(150);
    router.push(isAdmin ? "/admin/dashboard" : getDestination());
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10">
          {/* Logo and Company Name */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <div className="flex justify-center mb-4">
                <img src="/images/logo.png" alt="RUFA ELAN" className="h-16 w-16 rounded-lg hover:opacity-90 transition-opacity" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">RUFA ELAN</h2>
              <p className="text-sm text-blue-600 font-medium mt-1">LIMITED</p>
            </Link>
          </div>

          {/* Welcome Text */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome back</h1>
            <p className="text-sm text-slate-600">Sign in to continue shopping</p>
          </div>

          {/* Google Sign In */}
          <div className="mb-6">
            <GoogleOAuthButton onClick={signInWithGoogle} disabled={isLoading} />
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-slate-500 font-medium">OR</span>
            </div>
          </div>

          {/* Email and Password Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register("email")}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              {errors.email && (
                <p className="mt-2 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("password")}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              {errors.password && (
                <p className="mt-2 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Keep me signed in */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-slate-700">
                Keep me signed in
              </label>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 shadow-md hover:shadow-lg"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Error Message */}
          {serverMessage && (
            <div className="mt-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {serverMessage}
            </div>
          )}

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="font-semibold text-blue-600 hover:text-blue-700">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
