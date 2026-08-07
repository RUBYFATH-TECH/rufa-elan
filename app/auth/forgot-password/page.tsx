"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email")
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const supabase = createClientComponentSupabaseClient();
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });

    setIsLoading(false);

    if (error) {
      setMessage(`Error: ${error.message}`);
      return;
    }

    setMessage("Check your email for a password reset link.");
  };

  return (
    <section className="mx-auto max-w-md px-6 py-20 sm:px-8 lg:px-12">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-soft">
        <h1 className="text-3xl font-semibold text-slate-950">Reset password</h1>
        <p className="mt-4 text-slate-600">Enter your email and we’ll send you a secure reset link.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <label className="block text-sm text-slate-700">
            Email
            <input {...register("email")} className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-300" />
            {errors.email ? <p className="mt-2 text-xs text-red-600">{errors.email.message}</p> : null}
          </label>
          <button type="submit" disabled={isLoading} className="w-full rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
            {isLoading ? "Sending..." : "Send reset link"}
          </button>
        </form>
        {message ? <p className="mt-5 text-sm text-slate-700">{message}</p> : null}
        <p className="mt-6 text-sm text-slate-600">Remember your password? <Link href="/auth/login" className="font-semibold text-brand-700">Sign in</Link></p>
      </div>
    </section>
  );
}
