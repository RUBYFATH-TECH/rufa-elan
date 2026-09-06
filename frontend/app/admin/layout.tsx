"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClientComponentSupabaseClient } from "@/lib/supabase-client";
import { isKnownAdminEmail } from "@/lib/admin-common";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClientComponentSupabaseClient();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [secretVerified, setSecretVerified] = useState(false);
  const [secretCode, setSecretCode] = useState("");
  const [secretError, setSecretError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!session?.user?.email) {
        router.replace("/auth/login");
        return;
      }

      const email = session.user.email?.trim().toLowerCase() ?? "";
      let res = await fetch("/api/admin/check");
      if (!res.ok) {
        if (isKnownAdminEmail(email)) {
          setAuthorized(true);
          const verified = typeof window !== "undefined" && window.sessionStorage.getItem("rufa-admin-secret-verified") === "true";
          setSecretVerified(verified);
          setChecking(false);
          return;
        }

        await sleep(150);
        res = await fetch("/api/admin/check");
      }

      if (!res.ok) {
        router.replace("/account");
        return;
      }

      const data = await res.json();
      if (!data.admin) {
        router.replace("/account");
        return;
      }

      setAuthorized(true);
      const verified = typeof window !== "undefined" && window.sessionStorage.getItem("rufa-admin-secret-verified") === "true";
      setSecretVerified(verified);
      setChecking(false);
    };

    checkAdmin();
  }, [router, supabase]);

  const verifySecret = async () => {
    setSecretError(null);
    const trimmedSecret = secretCode.trim();
    if (trimmedSecret.length === 0) {
      setSecretError("Admin secret code is required.");
      return;
    }

    setIsVerifying(true);

    const res = await fetch("/api/admin/verify-secret", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secretCode: trimmedSecret })
    });

    setIsVerifying(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setSecretError(data?.message ?? "Invalid admin secret code.");
      return;
    }

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("rufa-admin-secret-verified", "true");
    }
    setSecretVerified(true);
  };

  if (checking) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-20 sm:px-8 lg:px-12">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-12 shadow-soft text-center">
          <p className="text-sm text-slate-600">Verifying admin access...</p>
        </div>
      </section>
    );
  }

  if (!authorized) {
    return null;
  }

  if (!secretVerified) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-20 sm:px-8 lg:px-12">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-12 shadow-soft text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Admin secret required</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-950">Enter your admin secret code</h1>
          <p className="mt-4 text-slate-600">Provide the secret code for this administrator session.</p>
          <div className="mt-8 space-y-4">
            <input
              type="password"
              value={secretCode}
              onChange={(event) => setSecretCode(event.target.value)}
              placeholder="Secret code"
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand-300"
            />
            <button
              type="button"
              onClick={verifySecret}
              disabled={isVerifying || secretCode.trim().length === 0}
              className="w-full rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isVerifying ? "Verifying..." : "Verify secret code"}
            </button>
            {secretError ? <p className="text-sm text-red-600">{secretError}</p> : null}
          </div>
        </div>
      </section>
    );
  }

  return <>{children}</>;
}
