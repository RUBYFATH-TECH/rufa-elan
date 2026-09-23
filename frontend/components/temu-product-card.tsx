"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, Star, ShoppingCart, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { useLanguage } from "@/contexts/language-context";

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

interface TemuProductCardProps {
  product: Product;
  className?: string;
}

export default function TemuProductCard({ product, className }: TemuProductCardProps) {
  const { t } = useLanguage();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const addToCart = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      slug: product.slug || product.id
    });
  };

  const productUrl = `/products/${product.slug || product.id}`;

  return (
    <Link href={productUrl} className={cn("group block h-full", className)}>
      <div className="relative flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-all duration-200 hover:shadow-md">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-slate-100">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className={cn(
              "object-cover transition-all duration-300 group-hover:scale-105",
              imageLoading ? "blur-sm" : "blur-0"
            )}
            onLoad={() => setImageLoading(false)}
          />
          
          {/* Badges */}
          <div className="absolute left-2 top-2 space-y-1">
            {discountPercentage > 0 && (
              <div className="rounded bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white">
                -{discountPercentage}%
              </div>
            )}
            {product.badge && (
              <div className="rounded bg-rufaelan-primary px-1.5 py-0.5 text-xs font-bold text-white">
                {product.badge}
              </div>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className={cn(
              "absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur transition-all",
              isWishlisted 
                ? "text-red-500 hover:bg-red-50" 
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
          </button>

          {/* Quick View */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex gap-2">
              <button 
                onClick={handleAddToCart}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 hover:bg-slate-100"
              >
                <ShoppingCart className="h-4 w-4" />
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 hover:bg-slate-100">
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-1 flex-col p-3">
          {/* Title */}
          <h3 className="text-sm font-medium text-slate-900 line-clamp-2 mb-2 group-hover:text-rufaelan-primary transition-colors">
            {product.name}
          </h3>

          {/* Rating & Reviews */}
          {product.rating && (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3 w-3",
                      i < Math.floor(product.rating!)
                        ? "text-yellow-400 fill-current"
                        : "text-slate-300"
                    )}
                  />
                ))}
              </div>
              {product.reviewCount && (
                <span className="text-xs text-slate-600">({product.reviewCount})</span>
              )}
            </div>
          )}

          {/* Social Proof */}
          <div className="flex items-center gap-2 mb-3 text-xs text-slate-600">
            {product.soldCount && (
              <span>{product.soldCount}K+ sold</span>
            )}
            {product.freeShipping && (
              <span className="text-green-600 font-medium">Free shipping</span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-rufaelan-primary">
              GH₵{product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-slate-500 line-through">
                GH₵{product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="mt-auto w-full rounded-md bg-rufaelan-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-rufaelan-primary-dark"
          >
            {t("addToCart")}
          </button>
        </div>
      </div>
    </Link>
  );
}
