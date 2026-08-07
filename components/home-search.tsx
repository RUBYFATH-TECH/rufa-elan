"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import ProductCard from "@/components/product-card";
import type { Product } from "@/lib/sample-data";

interface HomeSearchProps {
  products: Product[];
}

export default function HomeSearch({ products }: HomeSearchProps) {
  const [query, setQuery] = useState("");

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return products;

    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(normalized) ||
        product.category.toLowerCase().includes(normalized) ||
        product.slug.toLowerCase().includes(normalized)
      );
    });
  }, [products, query]);

  return (
    <section className="bg-white pb-20">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-soft">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Search products</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-950">Find your perfect handbag</h2>
            </div>
            <div className="flex h-14 w-full max-w-xl items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 shadow-sm sm:w-auto">
              <Search className="h-5 w-5 text-slate-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, category, or style"
                className="h-full flex-1 border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)
            ) : (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center text-slate-600">
                <p className="text-lg font-semibold text-slate-950">No matching products found.</p>
                <p className="mt-3 text-sm">Try a different keyword or browse our full collection.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
