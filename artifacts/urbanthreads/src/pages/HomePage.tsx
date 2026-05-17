import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Truck, RotateCcw, Shield, Star } from "lucide-react";
import { useGetStorefrontSummary, useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ProductCard } from "@/components/ProductCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { Show } from "@clerk/react";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { data: summary, isLoading } = useGetStorefrontSummary();
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

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(20,60%,20%) 0%, hsl(20,55%,30%) 50%, hsl(38,70%,35%) 100%)" }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-0 left-10 w-96 h-96 rounded-full bg-primary blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 text-white/90 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-accent"></span>
              Plus Size Fashion That Fits Your Life
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
              Fashion For Every<br />
              <span style={{ color: "hsl(38,90%,60%)" }}>Bold Body</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl leading-relaxed mb-10 max-w-xl">
              Sizes 1X–5X in men's and women's styles. Modern cuts, vibrant colors, designed to celebrate you.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/womens"
                className="inline-flex items-center gap-2 bg-white text-foreground font-semibold px-7 py-3.5 rounded-xl hover:bg-white/90 transition-colors text-sm"
                data-testid="hero-shop-womens"
              >
                Shop Women <ArrowRight size={16} />
              </Link>
              <Link
                href="/mens"
                className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/10 transition-colors text-sm"
                data-testid="hero-shop-mens"
              >
                Shop Men <ArrowRight size={16} />
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 mt-12">
              {[
                { label: `${summary?.mensProducts ?? "100"}+ Men's Styles` },
                { label: `${summary?.womensProducts ?? "150"}+ Women's Styles` },
                { label: "Sizes 1X–5X" },
              ].map((stat) => (
                <div key={stat.label} className="text-white/80 text-sm font-medium border-l-2 border-white/20 pl-4">
                  {stat.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-serif text-3xl font-bold text-foreground mb-3">Shop by Category</h2>
        <p className="text-muted-foreground mb-10">Find your style across our curated collections</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/mens">
            <div className="relative rounded-2xl overflow-hidden h-72 group cursor-pointer" style={{ background: "linear-gradient(135deg, hsl(20,55%,25%) 0%, hsl(20,50%,35%) 100%)" }}>
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <div className="inline-block bg-white/15 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full w-fit mb-3">
                  {summary?.mensProducts ?? "–"} Styles
                </div>
                <h3 className="font-serif text-3xl font-bold text-white mb-2">Men's Collection</h3>
                <p className="text-white/75 text-sm mb-5">Shirts, pants, jackets, and more</p>
                <span className="inline-flex items-center gap-2 text-white font-semibold text-sm group-hover:gap-3 transition-all">
                  Explore Men <ArrowRight size={16} />
                </span>
              </div>
            </div>
          </Link>
          <Link href="/womens">
            <div className="relative rounded-2xl overflow-hidden h-72 group cursor-pointer" style={{ background: "linear-gradient(135deg, hsl(340,55%,30%) 0%, hsl(20,60%,40%) 100%)" }}>
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <div className="inline-block bg-white/15 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full w-fit mb-3">
                  {summary?.womensProducts ?? "–"} Styles
                </div>
                <h3 className="font-serif text-3xl font-bold text-white mb-2">Women's Collection</h3>
                <p className="text-white/75 text-sm mb-5">Dresses, tops, jeans, and more</p>
                <span className="inline-flex items-center gap-2 text-white font-semibold text-sm group-hover:gap-3 transition-all">
                  Explore Women <ArrowRight size={16} />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16" style={{ backgroundColor: "hsl(36,30%,97%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-serif text-3xl font-bold text-foreground mb-2">Featured Styles</h2>
              <p className="text-muted-foreground">Hand-picked looks for every occasion</p>
            </div>
            <Link href="/womens" className="text-sm font-semibold text-primary hover:opacity-80 transition-opacity flex items-center gap-1 hidden md:flex">
              View All <ArrowRight size={15} />
            </Link>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-muted rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {(summary?.featuredProducts ?? []).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product as any}
                  onAddToCart={() => handleAddToCart(product as any)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trending */}
      {(summary?.trendingProducts?.length ?? 0) > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary mb-3">
                <Star size={13} className="fill-primary" /> Trending Now
              </div>
              <h2 className="font-serif text-3xl font-bold text-foreground">Best Sellers</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {(summary?.trendingProducts ?? []).slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={product as any}
                onAddToCart={() => handleAddToCart(product as any)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Trust Badges */}
      <section className="py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Truck, title: "Free Shipping", desc: "On orders over $75. Delivered to your door." },
              { icon: RotateCcw, title: "Easy Returns", desc: "30-day hassle-free return policy." },
              { icon: Shield, title: "Secure Checkout", desc: "Your data is always safe with us." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-5 p-6 rounded-2xl bg-secondary">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon size={22} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20" style={{ background: "linear-gradient(135deg, hsl(38,90%,50%) 0%, hsl(20,80%,45%) 100%)" }}>
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
            Your Size. Your Style. Your Rules.
          </h2>
          <p className="text-white/85 text-lg mb-8">
            Join thousands of shoppers who found their perfect fit at UrbanThreads.
          </p>
          <Show when="signed-out">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-4 rounded-xl text-base hover:bg-white/90 transition-colors"
            >
              Create Free Account <ArrowRight size={18} />
            </Link>
          </Show>
          <Show when="signed-in">
            <Link
              href="/womens"
              className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-4 rounded-xl text-base hover:bg-white/90 transition-colors"
            >
              Shop Now <ArrowRight size={18} />
            </Link>
          </Show>
        </div>
      </section>

      <Footer />
    </div>
  );
}
