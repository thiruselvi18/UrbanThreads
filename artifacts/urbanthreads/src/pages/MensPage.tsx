import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useListProducts, useAddToCart, getGetCartQueryKey, useListCategories } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

export default function MensPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: products = [], isLoading } = useListProducts({ gender: "mens", category: selectedCategory || undefined, maxPrice: maxPrice ? Number(maxPrice) : undefined });
  const { data: allCategories = [] } = useListCategories();
  const categories = allCategories.filter((c) => c.gender === "mens" || c.gender === "unisex");

  const addToCart = useAddToCart();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  function handleAddToCart(product: { id: number; name: string; sizes: string[] }) {
    const size = product.sizes?.[0] ?? "2X";
    addToCart.mutate(
      { data: { productId: product.id, size, quantity: 1 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast({ title: "Added to cart!", description: `${product.name} - Size ${size}` });
        },
      }
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="py-12" style={{ background: "linear-gradient(135deg, hsl(20,55%,20%) 0%, hsl(20,50%,32%) 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-white/60 text-sm uppercase tracking-widest mb-2">Collections</p>
          <h1 className="font-serif text-4xl font-bold text-white">Men's Collection</h1>
          <p className="text-white/75 mt-2">Bold styles in sizes 1X–5X</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-8">
          {/* Desktop Filters */}
          <aside className="hidden md:block w-56 shrink-0">
            <FilterPanel
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
            />
          </aside>

          <div className="flex-1">
            {/* Mobile filter toggle */}
            <div className="flex items-center justify-between mb-6 md:hidden">
              <span className="text-sm text-muted-foreground">{products.length} products</span>
              <button
                onClick={() => setShowFilters((v) => !v)}
                className="flex items-center gap-2 text-sm font-medium border border-border rounded-lg px-3 py-2"
              >
                <SlidersHorizontal size={16} /> Filters
              </button>
            </div>

            {showFilters && (
              <div className="md:hidden mb-6 p-4 bg-white rounded-2xl border border-border">
                <FilterPanel
                  categories={categories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  maxPrice={maxPrice}
                  setMaxPrice={setMaxPrice}
                />
              </div>
            )}

            <div className="hidden md:flex items-center justify-between mb-6">
              <span className="text-sm text-muted-foreground">{products.length} products</span>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory("")}
                  className="flex items-center gap-1 text-xs text-primary font-medium"
                >
                  <X size={12} /> Clear filter
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-muted rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-muted-foreground text-lg">No products found</p>
                <button onClick={() => { setSelectedCategory(""); setMaxPrice(""); }} className="mt-4 text-primary font-medium text-sm">Clear filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product as any}
                    onAddToCart={() => handleAddToCart(product as any)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function FilterPanel({ categories, selectedCategory, setSelectedCategory, maxPrice, setMaxPrice }: {
  categories: { id: number; name: string; gender: string; slug: string; productCount: number }[];
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  maxPrice: string;
  setMaxPrice: (v: string) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground mb-4">Category</h3>
        <div className="space-y-2">
          <button
            onClick={() => setSelectedCategory("")}
            className={`block text-sm w-full text-left px-3 py-2 rounded-lg transition-colors ${!selectedCategory ? "bg-primary text-primary-foreground font-semibold" : "text-foreground hover:bg-muted"}`}
          >
            All Styles
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`block text-sm w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === cat.name ? "bg-primary text-primary-foreground font-semibold" : "text-foreground hover:bg-muted"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground mb-4">Max Price</h3>
        <div className="space-y-2">
          {["", "50", "75", "100", "150"].map((price) => (
            <button
              key={price}
              onClick={() => setMaxPrice(price)}
              className={`block text-sm w-full text-left px-3 py-2 rounded-lg transition-colors ${maxPrice === price ? "bg-primary text-primary-foreground font-semibold" : "text-foreground hover:bg-muted"}`}
            >
              {price ? `Under $${price}` : "Any Price"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
