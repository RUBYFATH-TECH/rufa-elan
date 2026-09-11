"use client";

import Link from "next/link";
import { useState } from "react";
import { useCartStore } from "@/store/cart-store";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    category: string;
    price: number;
    salePrice?: number;
    rating: number;
    image: string;
    slug: string;
    badge?: string;
  };
  layout?: "grid" | "list";
}

export default function ProductCard({ product, layout = "grid" }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.salePrice ?? product.price,
      image: product.image,
      quantity: 1
    });
  };
  if (layout === "list") {
    return (
      <Link href={`/products/${product.slug}`} className="group flex gap-6 overflow-hidden rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
        <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 relative">
          <img 
            src={product.image} 
            alt={product.name} 
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = `
                <div class="h-full w-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-600">
                  <svg class="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 2L3 7v11a2 2 0 002 2h10a2 2 0 002-2V7l-7-5zM6 9.5a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5zM6 12a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7A.5.5 0 016 12z"/>
                  </svg>
                </div>
              `;
            }}
          />
          {product.badge && (
            <div className="absolute top-1 left-1 bg-orange-600 text-white px-1 py-0.5 rounded text-xs font-bold">
              {product.badge}
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">{product.category}</span>
              <span className="text-sm text-gray-500">{product.rating.toFixed(1)} ★</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
            <p className="text-gray-600 text-sm">Premium quality handbag with elegant design and durable materials.</p>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold text-gray-900">GHS {product.salePrice ?? product.price}</span>
              {product.salePrice && (
                <span className="text-sm text-gray-500 line-through">GHS {product.price}</span>
              )}
            </div>
            <button 
              onClick={handleAddToCart}
              className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/products/${product.slug}`} className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md">
      <div className="aspect-[4/5] overflow-hidden bg-gray-100 relative">
        <img 
          src={product.image} 
          alt={product.name} 
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            // Create a better placeholder with product info
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement!.innerHTML = `
              <div class="h-full w-full bg-gradient-to-br from-orange-100 to-orange-200 flex flex-col items-center justify-center text-orange-800 p-4">
                <svg class="h-12 w-12 mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 2L3 7v11a2 2 0 002 2h10a2 2 0 002-2V7l-7-5zM6 9.5a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5zM6 12a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7A.5.5 0 016 12z"/>
                </svg>
                <span class="text-xs text-center font-medium">${product.name}</span>
              </div>
            `;
          }}
        />
        {product.badge && (
          <div className="absolute top-2 left-2 bg-orange-600 text-white px-2 py-1 rounded text-xs font-bold">
            {product.badge}
          </div>
        )}
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{product.category}</span>
          <span>{product.rating.toFixed(1)} ★</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold text-gray-900">GHS {product.salePrice ?? product.price}</span>
          {product.salePrice && (
            <span className="text-sm text-gray-500 line-through">GHS {product.price}</span>
          )}
        </div>
        <button 
          onClick={handleAddToCart}
          className="w-full bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </Link>
  );
}
