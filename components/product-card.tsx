import Link from "next/link";

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
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`} className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white transition-shadow hover:shadow-soft soft-glow">
      <div className="aspect-[4/5] overflow-hidden bg-slate-100">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-hover:rotate-0" />
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>{product.category}</span>
          <span>{product.rating.toFixed(1)} ★</span>
        </div>
        <h3 className="text-lg font-semibold text-slate-950">{product.name}</h3>
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold text-slate-950">GHS {product.salePrice ?? product.price}</span>
          {product.salePrice ? <span className="text-sm text-slate-500 line-through">GHS {product.price}</span> : null}
        </div>
      </div>
    </Link>
  );
}
