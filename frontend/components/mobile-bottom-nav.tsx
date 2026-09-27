"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid2x2, ShoppingCart, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart-store";

const tabs = [
  { href: "/",       label: "Home",    icon: Home       },
  { href: "/shop",   label: "Browse",  icon: Grid2x2    },
  { href: "/cart",   label: "Cart",    icon: ShoppingCart },
  { href: "/account", label: "Account", icon: User      },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const hydrateCart = useCartStore((state) => state.hydrate);
  const cartCount = cartItems.length;

  useEffect(() => {
    hydrateCart();
    setMounted(true);
  }, [hydrateCart]);

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white
                 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-2px_10px_rgba(0,0,0,0.07)]
                 md:hidden"
    >
      <div className="grid grid-cols-4">
        {tabs.map(({ href, label, icon: Icon }) => {
          // "/account" is active for any sub-path; "/" is active only on exact match
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={href}
              href={href as any}
              className="flex flex-col items-center gap-0.5 py-1 text-[11px] font-medium transition-colors"
            >
              <span className="relative flex items-center justify-center">
                <Icon
                  className={`h-6 w-6 transition-colors ${
                    isActive ? "text-orange-500" : "text-gray-500"
                  }`}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                {/* Cart badge */}
                {label === "Cart" && mounted && cartCount > 0 && (
                  <span className="absolute -right-2.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </span>
              <span className={isActive ? "text-orange-500" : "text-gray-500"}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
