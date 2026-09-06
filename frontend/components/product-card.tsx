import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Eye, ShoppingBag } from "lucide-react";

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
}

export default function ProductCard({ product }: ProductCardProps) {
  const discountPercent = product.salePrice 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white transition-all duration-500 hover:shadow-xl hover:shadow-slate-200/50"
    >
      {/* Badge */}
      {product.badge && (
        <div className="absolute top-4 left-4 z-10 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
          {product.badge}
        </div>
      )}
      
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <div className="absolute top-4 right-4 z-10 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
          -{discountPercent}%
        </div>
      )}

      {/* Product Image */}
      <div className="aspect-[4/5] overflow-hidden bg-slate-100 relative">
        <Link href={`/products/${product.slug}`}>
          <img 
            src={product.image} 
            alt={product.name} 
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" 
          />
        </Link>
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        {/* Action Buttons */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 transition-all duration-300 group-hover:opacity-100">
          <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 backdrop-blur transition-all hover:bg-white hover:scale-110">
            <Heart className="h-5 w-5 text-slate-700" />
          </button>
          <Link 
            href={`/products/${product.slug}`}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 backdrop-blur transition-all hover:bg-white hover:scale-110"
          >
            <Eye className="h-5 w-5 text-slate-700" />
          </Link>
          <button className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900/90 backdrop-blur transition-all hover:bg-slate-900 hover:scale-110">
            <ShoppingBag className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span className="font-medium">{product.category}</span>
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">★</span>
            <span>{product.rating.toFixed(1)}</span>
          </div>
        </div>
        
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-lg font-semibold text-slate-950 transition-colors hover:text-brand-700 line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-slate-950">
              GHS {product.salePrice ?? product.price}
            </span>
            {product.salePrice && (
              <span className="text-sm text-slate-500 line-through">
                GHS {product.price}
              </span>
            )}
          </div>
          <button className="rounded-full bg-brand-100 p-2 text-brand-700 transition-all hover:bg-brand-200 hover:scale-110">
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
