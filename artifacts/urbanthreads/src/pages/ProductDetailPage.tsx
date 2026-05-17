import { useState } from "react";
import { Link, useParams } from "wouter";
import { ChevronLeft, Star, ShoppingBag, Truck, RotateCcw, Shield, Check } from "lucide-react";
import { useGetProduct, useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { Show } from "@clerk/react";
import { useLocation } from "wouter";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id ?? "0");
  const [, setLocation] = useLocation();

  const { data: product, isLoading } = useGetProduct(productId, {
    query: { enabled: !!productId, queryKey: ["getProduct", productId] },
  });

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);

  const addToCart = useAddToCart();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  function handleAddToCart() {
    if (!selectedSize) {
      toast({ title: "Please select a size", variant: "destructive" });
      return;
    }
    addToCart.mutate(
      { data: { productId, size: selectedSize, quantity: 1 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          setAdded(true);
          toast({ title: "Added to cart!", description: `${product?.name} - Size ${selectedSize}` });
          setTimeout(() => setAdded(false), 2000);
        },
      }
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="aspect-[3/4] bg-muted rounded-2xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded animate-pulse w-3/4" />
              <div className="h-5 bg-muted rounded animate-pulse w-1/2" />
              <div className="h-10 bg-muted rounded animate-pulse w-1/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold mb-4">Product not found</h1>
          <Link href="/" className="text-primary font-medium">Back to Home</Link>
        </div>
      </div>
    );
  }

  const allImages = product.imageUrls?.length ? product.imageUrls : [product.imageUrl];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href={`/${product.gender}`} className="hover:text-foreground transition-colors capitalize">
            {product.gender === "mens" ? "Men" : product.gender === "womens" ? "Women" : "Unisex"}
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-muted">
              <img
                src={allImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://placehold.co/600x800/f5ede0/d4521a?text=${encodeURIComponent(product.name)}`;
                }}
              />
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-3">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === i ? "border-primary" : "border-border"}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="py-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">{product.category}</p>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">{product.name}</h1>

            {product.rating && (
              <div className="flex items-center gap-2 mb-5">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} className={i < Math.round(product.rating!) ? "fill-accent text-accent" : "text-muted"} />
                  ))}
                </div>
                <span className="text-sm font-semibold text-foreground">{product.rating?.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
              </div>
            )}

            <div className="flex items-center gap-3 mb-6">
              {product.salePrice ? (
                <>
                  <span className="text-3xl font-bold text-primary">${product.salePrice.toFixed(2)}</span>
                  <span className="text-xl text-muted-foreground line-through">${product.price.toFixed(2)}</span>
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full">
                    SALE
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-foreground">${product.price.toFixed(2)}</span>
              )}
            </div>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed mb-8">{product.description}</p>
            )}

            {/* Size Selection */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Select Size</h3>
                <button className="text-xs text-primary font-medium">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes?.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                      selectedSize === size
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-foreground hover:border-primary"
                    }`}
                    data-testid={`button-size-${size}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart */}
            <Show when="signed-in">
              <button
                onClick={handleAddToCart}
                disabled={addToCart.isPending}
                className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-base transition-all ${
                  added
                    ? "bg-green-500 text-white"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
                data-testid="button-add-to-cart"
              >
                {added ? <><Check size={20} /> Added to Cart!</> : <><ShoppingBag size={20} /> Add to Cart</>}
              </button>
            </Show>
            <Show when="signed-out">
              <Link
                href="/sign-in"
                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-base bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Sign In to Purchase
              </Link>
            </Show>

            {!product.inStock && (
              <p className="text-center text-muted-foreground text-sm mt-3">This item is currently out of stock</p>
            )}

            {/* Trust */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-border">
              {[
                { icon: Truck, text: "Free shipping over $75" },
                { icon: RotateCcw, text: "30-day returns" },
                { icon: Shield, text: "Secure checkout" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="text-center">
                  <Icon size={20} className="mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
