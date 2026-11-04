"use client";

import { Users } from "lucide-react";
import Link from "next/link";

export default function ReferralBanner() {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="bg-orange-600 p-2 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <p className="text-white text-sm font-medium">
              Refer a friend. Earn 5% of what they spend.
            </p>
          </div>
          <Link
            href="/account/referrals"
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-200 whitespace-nowrap"
          >
            Sign in to Refer →
          </Link>
        </div>
      </div>
    </div>
  );
}
