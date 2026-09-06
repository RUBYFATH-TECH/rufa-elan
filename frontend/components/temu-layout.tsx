"use client";

import { useState } from "react";
import TemuHeader from "./temu-header";
import CategoryPills from "./category-pills";
import FilterBar from "./filter-bar";
import TemuProductCard from "./temu-product-card";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
  badge?: string;
  freeShipping?: boolean;
  slug?: string;
}

interface TemuLayoutProps {
  products: Product[];
  totalProducts?: number;
  activeCategory?: string;
  children?: React.ReactNode;
}

export default function TemuLayout({ 
  products, 
  totalProducts, 
  activeCategory,
  children 
}: TemuLayoutProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="min-h-screen bg-rufaelan-gray">
      <TemuHeader />
      <CategoryPills activeCategory={activeCategory} />
      
      <div className="mx-auto max-w-7xl px-4 py-6">
        <FilterBar
          totalItems={totalProducts || products.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {children ? (
          children
        ) : (
          <div className="mt-6">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {products.map((product) => (
                  <TemuProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product) => (
                  <div key={product.id} className="flex gap-4 rounded-lg bg-white p-4 shadow-sm">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-slate-900">{product.name}</h3>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-lg font-bold text-rufaelan-primary">
                          GH₵{product.price.toFixed(2)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-slate-500 line-through">
                            GH₵{product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}