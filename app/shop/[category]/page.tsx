import React from "react";
import Link from "next/link";
import ProductCard from "@/components/product-card";
import { featuredProducts } from "@/lib/sample-data";

const categoryTitle = (slug?: string) => {
  if (!slug) return "All Products";
  return String(slug).replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = React.use(params);
  const title = categoryTitle(resolvedParams?.category);
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Category</p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-950">{title}</h1>
        <p className="mt-4 max-w-3xl text-slate-600">Explore our curated {title} collection with premium materials, multiple color options, accessories, and easy checkout.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-4">
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <div className="mt-12 rounded-[2rem] border border-slate-200 bg-brand-50 p-8 text-slate-900 shadow-soft">
        <h2 className="text-xl font-semibold">Need help choosing a bag?</h2>
        <p className="mt-3 text-sm text-slate-700">Message our team on WhatsApp for personalized recommendations and express delivery support.</p>
        <Link href="https://wa.me/233000000000" className="mt-6 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          Chat on WhatsApp
        </Link>
      </div>
    </section>
  );
}
