import { Link } from "wouter";
import { Star, ShoppingBag } from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: number;
  salePrice: number | null;
  gender: string;
  category: string;
  imageUrl: string;
  rating: number | null;
  reviewCount: number;
  inStock: boolean;
  trending: boolean;
}

interface Props {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: Props) {
  const discount = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-border"
      data-testid={`card-product-${product.id}`}
    >
      <Link href={`/product/${product.id}`}>
        <div className="relative overflow-hidden aspect-[3/4] bg-muted">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://placehold.co/400x533/f5ede0/d4521a?text=${encodeURIComponent(product.name)}`;
            }}
          />
          {product.salePrice && (
            <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full">
              -{discount}% OFF
            </span>
          )}
          {product.trending && !product.salePrice && (
            <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-bold px-2.5 py-1 rounded-full">
              Trending
            </span>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="text-sm font-semibold text-foreground/60">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/product/${product.id}`}>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{product.category}</p>
          <h3 className="font-semibold text-foreground text-sm leading-snug mb-2 hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {product.rating && (
          <div className="flex items-center gap-1.5 mb-3">
            <Star size={13} className="fill-accent text-accent" />
            <span className="text-xs font-semibold text-foreground">{product.rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {product.salePrice ? (
              <>
                <span className="font-bold text-primary text-base" data-testid={`text-price-${product.id}`}>
                  ${product.salePrice.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground line-through">${product.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="font-bold text-foreground text-base" data-testid={`text-price-${product.id}`}>
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          {onAddToCart && product.inStock && (
            <button
              onClick={(e) => { e.preventDefault(); onAddToCart(product); }}
              className="p-2 rounded-xl bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary transition-all duration-200"
              data-testid={`button-add-to-cart-${product.id}`}
            >
              <ShoppingBag size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
