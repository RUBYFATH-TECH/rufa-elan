"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import { GoogleOAuthButton } from "@/components/google-oauth-button";

const registerSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Enter a valid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm your password")
}).refine((data) => data.password === data.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });
  const hasSupabaseConfig = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const supabase = hasSupabaseConfig ? createClientComponentSupabaseClient() : null;
  const missingConfig = () => setServerMessage("Missing Supabase configuration. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.");
  const getDestination = () => {
    const redirect = new URLSearchParams(window.location.search).get("redirect");
    return redirect?.startsWith("/") && !redirect.startsWith("//") ? redirect : "/account";
  };

  const signUpWithGoogle = async () => {
    if (!supabase) return missingConfig();
    setServerMessage(null); 
    setIsLoading(true);
    
    // Use the new callback URL for OAuth
    const callbackUrl = `${window.location.origin}/auth/callback`;
    const currentRedirect = getDestination();
    
    // Add redirect parameter to callback URL if it's not the default
    const finalCallbackUrl = currentRedirect !== '/account' 
      ? `${callbackUrl}?redirect=${encodeURIComponent(currentRedirect)}`
      : callbackUrl;
    
    const { data, error } = await supabase.auth.signInWithOAuth({ 
      provider: "google", 
      options: { 
        redirectTo: finalCallbackUrl
      } 
    });
    
    setIsLoading(false);
    if (error) return setServerMessage(error.message);
    if (data?.url) window.location.assign(data.url);
  };

  const onSubmit = async (values: RegisterFormValues) => {
    if (!supabase) return missingConfig();
    setServerMessage(null); 
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email: values.email, 
        password: values.password, 
        options: { 
          data: { 
            full_name: values.name, 
            phone: values.phone 
          },
          emailRedirectTo: undefined // Disable email confirmation redirect
        } 
      });
      
      setIsLoading(false);
      
      if (error) {
        console.error('Signup error:', error);
        return setServerMessage(error.message);
      }
      
      if (data?.user) {
        // Check if user is immediately confirmed (no email verification required)
        if (data.user.email_confirmed_at || !data.user.confirmation_sent_at) {
          setServerMessage("Account created successfully! You can now sign in.");
          // Auto-redirect to login after 2 seconds
          setTimeout(() => {
            router.push(`/auth/login?redirect=${encodeURIComponent(getDestination())}`);
          }, 2000);
        } else {
          setServerMessage("Account created! Please check your email to verify your account before signing in.");
          setTimeout(() => {
            router.push(`/auth/login?redirect=${encodeURIComponent(getDestination())}`);
          }, 3000);
        }
        return;
      }
      
      setServerMessage("Account created successfully! You can now sign in.");
    } catch (err) {
      setIsLoading(false);
      console.error('Registration error:', err);
      setServerMessage("Registration failed. Please try again.");
    }
  };

  const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";
  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
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
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Create your account</h1>
            <p className="text-sm text-slate-600">Start shopping smarter today</p>
          </div>

          {/* Google Sign Up */}
          <div className="mb-6">
            <GoogleOAuthButton onClick={signUpWithGoogle} disabled={isLoading} label="Continue with Google" />
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

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name and Phone in a row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  autoComplete="name"
                  placeholder="Your full name"
                  {...register("name")}
                  className={inputClass}
                />
                {errors.name && (
                  <p className="mt-2 text-xs text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number
                </label>
                <input
                  id="phone"
                  autoComplete="tel"
                  placeholder="024 000 0000"
                  {...register("phone")}
                  className={inputClass}
                />
                {errors.phone && (
                  <p className="mt-2 text-xs text-red-600">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
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
                className={inputClass}
              />
              {errors.email && (
                <p className="mt-2 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password and Confirm Password in a row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Min. 6 characters"
                  {...register("password")}
                  className={inputClass}
                />
                {errors.password && (
                  <p className="mt-2 text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  {...register("confirmPassword")}
                  className={inputClass}
                />
                {errors.confirmPassword && (
                  <p className="mt-2 text-xs text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 shadow-md hover:shadow-lg mt-6"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>

          {/* Success/Error Message */}
          {serverMessage && (
            <div className="mt-5 rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
              {serverMessage}
            </div>
          )}

          {/* Sign In Link */}
          <p className="mt-8 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-blue-600 hover:text-blue-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
