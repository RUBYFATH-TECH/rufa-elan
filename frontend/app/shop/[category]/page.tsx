"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductCard from "@/components/product-card";
import { fetchProducts } from "@/lib/api/products";

const categoryTitle = (slug?: string) => {
  if (!slug) return "All Products";
  return String(slug).replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  regular_price: number;
  sale_price?: number;
  categories?: { name?: string; slug?: string };
  product_images?: Array<{ url: string; is_primary?: boolean }>;
  stock_quantity?: number;
  in_stock?: boolean;
  low_stock?: boolean;
};

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const [category, setCategory] = useState("");
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const title = categoryTitle(category);

  useEffect(() => {
    let active = true;

    const loadCategoryProducts = async () => {
      try {
        const { category: resolvedCategory } = await params;
        if (!active) return;
        setCategory(resolvedCategory);

        // The API returns category data with each product. Filtering by the
        // category slug makes every landing-page card show only its products.
        const response = await fetchProducts({ limit: 100 });
        const matchingProducts = (response.data || []).filter(
          (product: ApiProduct) => product.categories?.slug === resolvedCategory
        );
        if (active) setProducts(matchingProducts);
      } catch (error) {
        console.error("Failed to load category products:", error);
        if (active) setProducts([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadCategoryProducts();
    return () => { active = false; };
  }, [params]);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
      <div className="mb-10">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-rufaelan-primary transition hover:bg-orange-50 hover:text-rufaelan-primary-dark"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Category</p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-950">{title}</h1>
        <p className="mt-4 max-w-3xl text-slate-600">Explore our curated {title} collection with premium materials, multiple color options, accessories, and easy checkout.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-4">
        {loading ? <p className="col-span-full text-slate-600">Loading products...</p> : null}
        {!loading && products.length === 0 ? <p className="col-span-full text-slate-600">No products are available in this category yet.</p> : null}
        {products.map((product) => <ProductCard
          key={product.id}
          product={{
            id: product.id,
            name: product.name,
            category: product.categories?.name || title,
            price: product.regular_price,
            salePrice: product.sale_price,
            rating: 4.5,
            image: product.product_images?.find((image) => image.is_primary)?.url || product.product_images?.[0]?.url || "/images/placeholder.jpg",
            slug: product.slug,
            stock_quantity: product.stock_quantity,
            in_stock: product.in_stock,
            low_stock: product.low_stock,
          }}
        />)}
      </div>
      <div className="mt-12 rounded-[2rem] border border-slate-200 bg-brand-50 p-8 text-slate-900 shadow-soft">
        <h2 className="text-xl font-semibold">Need help choosing a bag?</h2>
        <p className="mt-3 text-sm text-slate-700">Message our team on WhatsApp for personalized recommendations and express delivery support.</p>
        <Link href="https://wa.me/+905053783510" className="mt-6 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          Chat on WhatsApp
        </Link>
      </div>
    </section>
  );
}
