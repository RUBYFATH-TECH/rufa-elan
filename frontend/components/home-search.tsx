"use client";

import { useMemo, useState } from "react";
import { Search, Filter, SortAsc } from "lucide-react";
import { motion } from "framer-motion";
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
    <section className="bg-white pb-20 pt-12">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 shadow-soft"
        >
          <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-brand-700 font-semibold">Search products</p>
              <h2 className="mt-3 text-4xl font-bold text-slate-950">Find your perfect handbag</h2>
              <p className="mt-2 text-slate-600">Discover our curated collection of premium accessories</p>
            </div>
            <div className="flex h-14 w-full max-w-xl items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 shadow-sm transition-shadow focus-within:shadow-md sm:w-auto">
              <Search className="h-5 w-5 text-slate-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, category, or style..."
                className="h-full flex-1 border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Search Results */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            </p>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50">
                <Filter className="h-4 w-4" />
                Filter
              </button>
              <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50">
                <SortAsc className="h-4 w-4" />
                Sort
              </button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="col-span-full rounded-[2rem] border border-slate-200 bg-white p-12 text-center text-slate-600"
              >
                <Search className="mx-auto mb-4 h-16 w-16 text-slate-300" />
                <p className="text-xl font-semibold text-slate-950 mb-2">No matching products found</p>
                <p className="text-slate-600 mb-6">Try a different keyword or browse our full collection.</p>
                <button
                  onClick={() => setQuery("")}
                  className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                >
                  Clear search
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
