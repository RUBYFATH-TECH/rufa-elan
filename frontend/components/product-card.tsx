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
    stock_quantity?: number;
    in_stock?: boolean;
    low_stock?: boolean;
  };
  layout?: "grid" | "list";
}

export default function ProductCard({ product, layout = "grid" }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addItem);
  const cartError = useCartStore((state) => state.error);
  const [showError, setShowError] = useState(false);
  
  // Debug: Log what category ProductCard received
  console.log(`🎴 ProductCard rendering "${product.name}" with category:`, product.category);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent adding out of stock items
    if (!product.in_stock) {
      return;
    }
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.salePrice ?? product.price,
      image: product.image,
      quantity: 1,
      stock_quantity: product.stock_quantity
    });
    
    // Show error if there is one
    if (cartError) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };
  if (layout === "list") {
    return (
      <Link href={`/products/${product.slug}`} className="group flex flex-col sm:flex-row gap-4 sm:gap-6 overflow-hidden rounded-lg border border-gray-200 bg-white p-4 sm:p-6 transition-shadow hover:shadow-md relative">
        {/* Error notification */}
        {showError && cartError && (
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 bg-red-100 border border-red-400 text-red-700 px-2 sm:px-3 py-1.5 sm:py-2 rounded text-xs sm:text-sm shadow-lg">
            {cartError}
          </div>
        )}
        <div className="h-40 w-full sm:h-32 sm:w-32 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 relative">
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
          {!product.in_stock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                OUT OF STOCK
              </span>
            </div>
          )}
          {product.in_stock && product.low_stock && (
            <div className="absolute bottom-1 left-1 bg-yellow-500 text-white px-2 py-0.5 rounded text-xs font-bold">
              Low Stock
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-gray-500">{product.category}</span>
              <span className="text-xs sm:text-sm text-gray-500">{product.rating.toFixed(1)} ★</span>
            </div>
            <h3 className="text-base sm:text-xl font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
            <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">Premium quality handbag with elegant design and durable materials.</p>
            {product.stock_quantity !== undefined && (
              <p className="text-xs sm:text-sm text-gray-600 mt-2">
                <span className="font-medium">Available:</span> {product.stock_quantity} {product.stock_quantity === 1 ? 'unit' : 'units'}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-3 sm:mt-4 gap-2 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-base sm:text-lg font-semibold text-gray-900">GHS {product.salePrice ?? product.price}</span>
              {product.salePrice && (
                <span className="text-xs sm:text-sm text-gray-500 line-through">GHS {product.price}</span>
              )}
            </div>
            <button 
              onClick={handleAddToCart}
              disabled={!product.in_stock}
              className={`px-3 sm:px-4 py-2 rounded-md transition-colors text-xs sm:text-sm font-medium ${
                product.in_stock
                  ? 'bg-orange-600 text-white hover:bg-orange-700 active:bg-orange-800'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/products/${product.slug}`} className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md relative flex flex-col">
      {/* Error notification */}
      {showError && cartError && (
        <div className="absolute top-2 left-2 right-2 z-10 bg-red-100 border border-red-400 text-red-700 px-2 sm:px-3 py-1.5 sm:py-2 rounded text-xs shadow-lg">
          {cartError}
        </div>
      )}
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
        {!product.in_stock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
              OUT OF STOCK
            </span>
          </div>
        )}
        {product.in_stock && product.low_stock && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold shadow-sm">
            Low Stock
          </div>
        )}
      </div>
      <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 lg:p-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
          <span className="truncate mr-2">{product.category}</span>
          <span className="flex-shrink-0">{product.rating.toFixed(1)} ★</span>
        </div>
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 line-clamp-2 flex-grow">{product.name}</h3>
        {product.stock_quantity !== undefined && (
          <p className="text-xs text-gray-600">
            <span className="font-medium">Stock:</span> {product.stock_quantity} available
          </p>
        )}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="text-sm sm:text-base font-semibold text-gray-900">GHS {product.salePrice ?? product.price}</span>
          {product.salePrice && (
            <span className="text-xs sm:text-sm text-gray-500 line-through">GHS {product.price}</span>
          )}
        </div>
        <button 
          onClick={handleAddToCart}
          disabled={!product.in_stock}
          className={`w-full py-1.5 sm:py-2 rounded-md transition-colors font-medium text-xs sm:text-sm ${
            product.in_stock
              ? 'bg-orange-600 text-white hover:bg-orange-700 active:bg-orange-800'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </Link>
  );
}
