"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

const categories = [
  { id: "recommended", label: "Recommended", href: "/shop?category=recommended" },
  { id: "home-kitchen", label: "Home & Kitchen", href: "/shop?category=home-kitchen" },
  { id: "beauty", label: "Beauty & Personal Care", href: "/shop?category=beauty" },
  { id: "women-clothing", label: "Women's Clothing", href: "/shop?category=women-clothing" },
  { id: "men-clothing", label: "Men's Clothing", href: "/shop?category=men-clothing" },
  { id: "women-shoes", label: "Women's Shoes", href: "/shop?category=women-shoes" },
  { id: "men-underwear", label: "Men's Underwear & Sleepwear", href: "/shop?category=men-underwear" },
  { id: "sports", label: "Sports & Outdoors", href: "/shop?category=sports" },
  { id: "office", label: "Office & School Supplies", href: "/shop?category=office" },
  { id: "electronics", label: "Electronics", href: "/shop?category=electronics" },
  { id: "automotive", label: "Automotive", href: "/shop?category=automotive" },
  { id: "toys", label: "Toys & Games", href: "/shop?category=toys" }
];

interface CategoryPillsProps {
  activeCategory?: string;
  className?: string;
}

export default function CategoryPills({ activeCategory = "recommended", className }: CategoryPillsProps) {
  const [selectedCategory, setSelectedCategory] = useState(activeCategory);

  return (
    <div className={cn("bg-white border-b border-slate-200 py-3", className)}>
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                "flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                selectedCategory === category.id
                  ? "bg-rufaelan-primary text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
              )}
            >
              {category.label}
            </Link>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}