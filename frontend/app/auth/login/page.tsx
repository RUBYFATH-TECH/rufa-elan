"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LockKeyhole, PackageCheck, ShieldCheck } from "lucide-react";
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
    
    // Determine the redirect URL after OAuth success
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
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft lg:grid lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="hidden bg-[#e65100] p-12 text-white lg:block">
          <img src="/images/logo.png" alt="RUFA ELAN" className="h-12 w-12 rounded-full" />
          <p className="mt-16 text-xs font-semibold uppercase tracking-[0.28em] text-white/75">Welcome back</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">Your favourites are waiting.</h1>
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/85">Sign in to manage your orders and enjoy a faster checkout.</p>
          <div className="mt-12 space-y-4 text-sm text-white/90">
            <p className="flex items-center gap-3"><PackageCheck className="h-5 w-5" /> Track every delivery</p>
            <p className="flex items-center gap-3"><ShieldCheck className="h-5 w-5" /> Secure account access</p>
          </div>
        </aside>
        <div className="mx-auto w-full max-w-xl p-7 sm:p-10 lg:p-12">
          <div className="flex items-center gap-3 lg:hidden"><img src="/images/logo.png" alt="RUFA ELAN" className="h-10 w-10 rounded-full" /><span className="text-sm font-bold tracking-[0.14em] text-slate-950">RUFA ELAN</span></div>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-[#e65100] lg:mt-0">Sign in</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950">Welcome back</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Enter your details to view your orders, saved items, and delivery updates.</p>
          <div className="mt-7">
            <GoogleOAuthButton onClick={signInWithGoogle} disabled={isLoading} />
            <div className="relative my-7 text-center text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400"><span className="absolute left-0 top-1/2 h-px w-full bg-slate-200" /><span className="relative inline-block bg-white px-3">or continue with email</span></div>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <label className="block text-sm font-medium text-slate-800">Email<input type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#e65100] focus:bg-white focus:ring-2 focus:ring-[#e65100]/10" />{errors.email ? <p className="mt-2 text-xs text-red-600">{errors.email.message}</p> : null}</label>
            <label className="block text-sm font-medium text-slate-800"><span className="flex items-center justify-between">Password <Link href="/auth/forgot-password" className="font-semibold text-[#e65100] hover:text-[#d84315]">Forgot password?</Link></span><input type="password" autoComplete="current-password" placeholder="Enter your password" {...register("password")} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#e65100] focus:bg-white focus:ring-2 focus:ring-[#e65100]/10" />{errors.password ? <p className="mt-2 text-xs text-red-600">{errors.password.message}</p> : null}</label>
            <button type="submit" disabled={isLoading} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#e65100] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#d84315] disabled:cursor-not-allowed disabled:opacity-50"><LockKeyhole className="h-4 w-4" />{isLoading ? "Signing in..." : "Sign in"}</button>
          </form>
          {serverMessage ? <p className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{serverMessage}</p> : null}
          <p className="mt-7 border-t border-slate-100 pt-6 text-center text-sm text-slate-600">Don&apos;t have an account? <Link href="/auth/register" className="font-bold text-[#e65100] hover:text-[#d84315]">Create one</Link></p>
        </div>
      </div>
    </section>
  );
}
