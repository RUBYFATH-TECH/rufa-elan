import Link from "next/link";
import ProductCard from "@/components/product-card";
import { featuredProducts } from "@/lib/sample-data";

const categories = [
  "Handbags",
  "Shoulder Bags",
  "Tote Bags",
  "Crossbody Bags",
  "Purses",
  "Wallets",
  "Accessories"
];

export default function ShopPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
      <div className="mb-12 grid gap-10 lg:grid-cols-[1fr,0.7fr] lg:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-brand-700">Shop</p>
          <h1 className="mt-4 text-4xl font-semibold text-slate-950">Shop handbags, purses and accessories</h1>
          <p className="mt-4 max-w-2xl text-slate-600">Browse premium handbags built for style and comfort. Filter by category, price, color, availability, and sort by newest or popularity.</p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Popular categories</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {categories.map((category) => (
              <Link key={category} href={`/shop/${category.toLowerCase().replace(/\s+/g, "-")}`} className="rounded-3xl border border-slate-200 px-4 py-3 text-sm text-slate-700 transition hover:border-brand-300 hover:text-brand-900">
                {category}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
