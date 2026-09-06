"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const resetPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
  otp: z.string().min(6, "Enter the OTP code"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm your password")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [initialEmail, setInitialEmail] = useState("");
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema)
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const emailFromQuery = url.searchParams.get("email") ?? "";
    if (emailFromQuery) {
      setInitialEmail(emailFromQuery);
      reset({ email: emailFromQuery, otp: "", password: "", confirmPassword: "" });
    }
  }, [reset]);

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setIsLoading(true);
    setMessage(null);

    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: values.email, otp: values.otp, newPassword: values.password })
    });

    const data = await res.json().catch(() => ({ message: "Unable to reset password." }));
    setIsLoading(false);

    if (!res.ok) {
      setMessage(data?.message ?? "Unable to reset password.");
      return;
    }

    setMessage(data?.message ?? "Password updated successfully. Redirecting to login...");
    setTimeout(() => router.push("/auth/login"), 2000);
  };

  return (
    <section className="mx-auto max-w-md px-6 py-20 sm:px-8 lg:px-12">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-soft">
        <h1 className="text-3xl font-semibold text-slate-950">Set new password</h1>
        <p className="mt-4 text-slate-600">Enter your email, OTP, and new password.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <label className="block text-sm text-slate-700">
            Email
            <input {...register("email")} className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-300" />
            {errors.email ? <p className="mt-2 text-xs text-red-600">{errors.email.message}</p> : null}
          </label>
          <label className="block text-sm text-slate-700">
            OTP code
            <input {...register("otp")} className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-300" />
            {errors.otp ? <p className="mt-2 text-xs text-red-600">{errors.otp.message}</p> : null}
          </label>
          <label className="block text-sm text-slate-700">
            New password
            <input type="password" {...register("password")} className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-300" />
            {errors.password ? <p className="mt-2 text-xs text-red-600">{errors.password.message}</p> : null}
          </label>
          <label className="block text-sm text-slate-700">
            Confirm password
            <input type="password" {...register("confirmPassword")} className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-300" />
            {errors.confirmPassword ? <p className="mt-2 text-xs text-red-600">{errors.confirmPassword.message}</p> : null}
          </label>
          <button type="submit" disabled={isLoading} className="w-full rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
            {isLoading ? "Updating..." : "Reset password"}
          </button>
        </form>
        {message ? <p className="mt-5 text-sm text-slate-700">{message}</p> : null}
      </div>
    </section>
  );
}
