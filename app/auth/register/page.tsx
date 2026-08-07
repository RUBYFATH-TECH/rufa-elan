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
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Enter your name")
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });
  const hasSupabaseConfig = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const supabase = hasSupabaseConfig ? createClientComponentSupabaseClient() : null;

  const signUpWithGoogle = async () => {
    if (!supabase) {
      setServerMessage("Missing Supabase configuration. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.");
      return;
    }

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

  const onSubmit = async (values: RegisterFormValues) => {
    if (!supabase) {
      setServerMessage("Missing Supabase configuration. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.");
      return;
    }

    setServerMessage(null);
    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.name
        }
      }
    });

    setIsLoading(false);

    if (error) {
      setServerMessage(error.message);
      return;
    }

    if (data?.user) {
      setServerMessage("Account created successfully. Please verify your email before signing in.");
      router.push("/auth/login");
      return;
    }

    setServerMessage("Check your email for confirmation and complete account setup.");
  };

  return (
    <section className="mx-auto max-w-md px-6 py-20 sm:px-8 lg:px-12">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-soft">
        <h1 className="text-3xl font-semibold text-slate-950">Create account</h1>
        <p className="mt-2 text-sm text-slate-600">Create a secure account to save your address, track orders, and checkout faster.</p>
        <div className="mt-6">
          <GoogleOAuthButton onClick={signUpWithGoogle} disabled={isLoading} label="Sign up with Google" />
          <div className="relative my-6 text-center text-xs uppercase text-slate-400">
            <span className="absolute left-0 top-1/2 h-px w-full bg-slate-200"></span>
            <span className="relative inline-block bg-white px-3">or use email and password</span>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <label className="block text-sm text-slate-700">
            Full name
            <input {...register("name")} className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-300" />
            {errors.name ? <p className="mt-2 text-xs text-red-600">{errors.name.message}</p> : null}
          </label>
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
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        {serverMessage ? <p className="mt-5 text-sm text-slate-700">{serverMessage}</p> : null}

        <p className="mt-6 text-sm text-slate-600">Already have an account? <Link href="/auth/login" className="font-semibold text-brand-700">Sign in</Link></p>
      </div>
    </section>
  );
}
