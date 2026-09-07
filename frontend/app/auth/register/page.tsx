"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, ShieldCheck, Sparkles } from "lucide-react";
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
    setServerMessage(null); setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({ email: values.email, password: values.password, options: { data: { full_name: values.name, phone: values.phone } } });
    setIsLoading(false);
    if (error) return setServerMessage(error.message);
    if (data?.user) { setServerMessage("Account created successfully. Please verify your email before signing in."); router.push(`/auth/login?redirect=${encodeURIComponent(getDestination())}`); return; }
    setServerMessage("Check your email for confirmation and complete account setup.");
  };

  const inputClass = "mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#e65100] focus:bg-white focus:ring-2 focus:ring-[#e65100]/10";
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft lg:grid lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="hidden bg-[#e65100] p-12 text-white lg:block">
          <img src="/images/logo.png" alt="RUFA ELAN" className="h-12 w-12 rounded-full" />
          <p className="mt-16 text-xs font-semibold uppercase tracking-[0.28em] text-white/75">Join RUFA ELAN</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">Make every checkout effortless.</h1>
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/85">Create your free account to save your details, track orders, and pick up where you left off.</p>
          <div className="mt-12 space-y-4 text-sm text-white/90"><p className="flex items-center gap-3"><Check className="h-5 w-5" /> Faster checkout</p><p className="flex items-center gap-3"><Check className="h-5 w-5" /> Easy delivery tracking</p><p className="flex items-center gap-3"><ShieldCheck className="h-5 w-5" /> Your account stays secure</p></div>
        </aside>
        <div className="mx-auto w-full max-w-xl p-7 sm:p-10 lg:p-12">
          <div className="flex items-center gap-3 lg:hidden"><img src="/images/logo.png" alt="RUFA ELAN" className="h-10 w-10 rounded-full" /><span className="text-sm font-bold tracking-[0.14em] text-slate-950">RUFA ELAN</span></div>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-[#e65100] lg:mt-0">Create account</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950">Start shopping smarter</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">It only takes a minute. Your account is free and ready for your next find.</p>
          <div className="mt-7"><GoogleOAuthButton onClick={signUpWithGoogle} disabled={isLoading} label="Continue with Google" /><div className="relative my-7 text-center text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400"><span className="absolute left-0 top-1/2 h-px w-full bg-slate-200" /><span className="relative inline-block bg-white px-3">or use email</span></div></div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium text-slate-800">Full name<input autoComplete="name" placeholder="Your full name" {...register("name")} className={inputClass} />{errors.name ? <p className="mt-2 text-xs text-red-600">{errors.name.message}</p> : null}</label><label className="block text-sm font-medium text-slate-800">Phone number<input autoComplete="tel" placeholder="e.g. 024 000 0000" {...register("phone")} className={inputClass} />{errors.phone ? <p className="mt-2 text-xs text-red-600">{errors.phone.message}</p> : null}</label></div>
            <label className="block text-sm font-medium text-slate-800">Email<input type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} className={inputClass} />{errors.email ? <p className="mt-2 text-xs text-red-600">{errors.email.message}</p> : null}</label>
            <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium text-slate-800">Password<input type="password" autoComplete="new-password" placeholder="At least 6 characters" {...register("password")} className={inputClass} />{errors.password ? <p className="mt-2 text-xs text-red-600">{errors.password.message}</p> : null}</label><label className="block text-sm font-medium text-slate-800">Confirm password<input type="password" autoComplete="new-password" placeholder="Re-enter password" {...register("confirmPassword")} className={inputClass} />{errors.confirmPassword ? <p className="mt-2 text-xs text-red-600">{errors.confirmPassword.message}</p> : null}</label></div>
            <button type="submit" disabled={isLoading} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#e65100] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#d84315] disabled:cursor-not-allowed disabled:opacity-50"><Sparkles className="h-4 w-4" />{isLoading ? "Creating account..." : "Create account"}</button>
          </form>
          {serverMessage ? <p className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{serverMessage}</p> : null}
          <p className="mt-7 border-t border-slate-100 pt-6 text-center text-sm text-slate-600">Already have an account? <Link href="/auth/login" className="font-bold text-[#e65100] hover:text-[#d84315]">Sign in</Link></p>
        </div>
      </div>
    </section>
  );
}
