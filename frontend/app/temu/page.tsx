"use client";

import TemuLayout from "@/components/temu-layout";
import TemuDealsSection from "@/components/temu-deals-section";
import { temuProducts } from "@/lib/sample-data";

export default function TemuPage() {
  // Transform our products to match the expected format
  const formattedProducts = temuProducts.map(product => ({
    id: product.id,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice,
    image: product.image,
    rating: product.rating,
    reviewCount: product.reviewCount,
    soldCount: product.soldCount,
    badge: product.badge,
    freeShipping: product.freeShipping,
    slug: product.slug
  }));

  return (
    <TemuLayout 
      products={formattedProducts}
      totalProducts={formattedProducts.length}
      activeCategory="recommended"
    >
      <div className="space-y-8">
        <TemuDealsSection />
        
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">All Products</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {formattedProducts.map((product) => (
              <div key={product.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-square bg-slate-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-slate-900 line-clamp-2 mb-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-rufaelan-primary">
                      GH₵{product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-slate-500 line-through">
                        GH₵{product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {product.badge && (
                    <span className="inline-block bg-rufaelan-primary text-white text-xs px-2 py-1 rounded">
                      {product.badge}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TemuLayout>
  );
}