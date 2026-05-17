import { Link, useLocation } from "wouter";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useGetCart, useUpdateCartItem, useRemoveCartItem, useClearCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { Show } from "@clerk/react";

export default function CartPage() {
  const [, setLocation] = useLocation();
  const { data: cart, isLoading } = useGetCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
  }

  function handleQuantity(itemId: number, quantity: number) {
    updateItem.mutate({ itemId, data: { quantity } }, { onSuccess: invalidate });
  }

  function handleRemove(itemId: number) {
    removeItem.mutate({ itemId }, {
      onSuccess: () => {
        invalidate();
        toast({ title: "Item removed from cart" });
      }
    });
  }

  function handleClear() {
    clearCart.mutate(undefined, { onSuccess: invalidate });
  }

  const shipping = (cart?.subtotal ?? 0) >= 75 ? 0 : 7.99;
  const total = (cart?.subtotal ?? 0) + shipping;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-8">Your Cart</h1>

        <Show when="signed-out">
          <div className="text-center py-24">
            <ShoppingBag size={56} className="mx-auto mb-6 text-muted-foreground" />
            <h2 className="font-serif text-2xl font-bold mb-3">Sign in to view your cart</h2>
            <p className="text-muted-foreground mb-8">Your cart items are saved to your account.</p>
            <Link href="/sign-in" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-xl hover:bg-primary/90 transition-colors">
              Sign In <ArrowRight size={16} />
            </Link>
          </div>
        </Show>

        <Show when="signed-in">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 bg-muted rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : !cart?.items?.length ? (
            <div className="text-center py-24">
              <ShoppingBag size={56} className="mx-auto mb-6 text-muted-foreground" />
              <h2 className="font-serif text-2xl font-bold mb-3">Your cart is empty</h2>
              <p className="text-muted-foreground mb-8">Start shopping to add items to your cart.</p>
              <div className="flex justify-center gap-4">
                <Link href="/womens" className="bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors text-sm">
                  Shop Women
                </Link>
                <Link href="/mens" className="border border-border text-foreground font-semibold px-6 py-3 rounded-xl hover:bg-muted transition-colors text-sm">
                  Shop Men
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-10">
              {/* Items */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{cart.itemCount} {cart.itemCount === 1 ? "item" : "items"}</span>
                  <button onClick={handleClear} className="text-xs text-destructive font-medium hover:opacity-80 transition-opacity">
                    Clear all
                  </button>
                </div>

                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-5 bg-white p-5 rounded-2xl border border-border" data-testid={`cart-item-${item.id}`}>
                    <Link href={`/product/${item.productId}`}>
                      <div className="w-24 h-28 rounded-xl overflow-hidden bg-muted shrink-0">
                        <img
                          src={item.productImageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/96x112/f5ede0/d4521a?text=Item`; }}
                        />
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${item.productId}`}>
                        <h3 className="font-semibold text-foreground leading-snug hover:text-primary transition-colors mb-1 line-clamp-2">
                          {item.productName}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mb-4">Size: <span className="font-medium text-foreground">{item.size}</span></p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 border border-border rounded-xl overflow-hidden">
                          <button
                            onClick={() => handleQuantity(item.id, item.quantity - 1)}
                            className="w-9 h-9 flex items-center justify-center hover:bg-muted transition-colors"
                            data-testid={`button-decrease-${item.id}`}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-9 text-center text-sm font-semibold" data-testid={`text-quantity-${item.id}`}>{item.quantity}</span>
                          <button
                            onClick={() => handleQuantity(item.id, item.quantity + 1)}
                            className="w-9 h-9 flex items-center justify-center hover:bg-muted transition-colors"
                            data-testid={`button-increase-${item.id}`}
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="font-bold text-foreground" data-testid={`text-item-total-${item.id}`}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            data-testid={`button-remove-${item.id}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-border p-6 sticky top-24">
                  <h2 className="font-semibold text-lg text-foreground mb-6">Order Summary</h2>
                  <div className="space-y-4 text-sm mb-6">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="font-medium text-foreground" data-testid="text-subtotal">${cart.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span className={`font-medium ${shipping === 0 ? "text-green-600" : "text-foreground"}`}>
                        {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    {shipping > 0 && (
                      <p className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
                        Add ${(75 - cart.subtotal).toFixed(2)} more for free shipping
                      </p>
                    )}
                    <div className="border-t border-border pt-4 flex justify-between font-bold text-foreground text-base">
                      <span>Total</span>
                      <span data-testid="text-total">${total.toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setLocation("/checkout")}
                    className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    data-testid="button-checkout"
                  >
                    Proceed to Checkout <ArrowRight size={16} />
                  </button>
                  <Link href="/" className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors mt-4">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </Show>
      </div>

      <Footer />
    </div>
  );
}
