import { Link } from "wouter";
import { Package, ChevronRight, ShoppingBag } from "lucide-react";
import { useListOrders } from "@workspace/api-client-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Show } from "@clerk/react";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  const { data: orders = [], isLoading } = useListOrders();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">My Orders</h1>
        <p className="text-muted-foreground mb-10">Track and manage your orders</p>

        <Show when="signed-out">
          <div className="text-center py-20">
            <Package size={56} className="mx-auto mb-6 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-4">Sign in to view your orders</h2>
            <Link href="/sign-in" className="bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-xl hover:bg-primary/90 transition-colors inline-flex">
              Sign In
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
          ) : orders.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag size={56} className="mx-auto mb-6 text-muted-foreground" />
              <h2 className="font-serif text-2xl font-bold mb-3">No orders yet</h2>
              <p className="text-muted-foreground mb-8">Start shopping to place your first order.</p>
              <div className="flex justify-center gap-4">
                <Link href="/womens" className="bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors text-sm">
                  Shop Women
                </Link>
                <Link href="/mens" className="border border-border font-semibold px-6 py-3 rounded-xl hover:bg-muted transition-colors text-sm">
                  Shop Men
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link key={order.id} href={`/orders/${order.id}`}>
                  <div className="bg-white rounded-2xl border border-border p-6 hover:shadow-md transition-all cursor-pointer" data-testid={`order-card-${order.id}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center shrink-0">
                          <Package size={24} className="text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">Order #{order.id}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                          </p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {order.items.length} {order.items.length === 1 ? "item" : "items"} · <span className="font-semibold text-foreground">${order.total.toFixed(2)}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full ${STATUS_STYLES[order.status] ?? "bg-muted text-muted-foreground"}`} data-testid={`status-order-${order.id}`}>
                          {order.status}
                        </span>
                        <ChevronRight size={18} className="text-muted-foreground" />
                      </div>
                    </div>

                    {/* Item thumbnails */}
                    <div className="flex gap-2 mt-4">
                      {order.items.slice(0, 4).map((item) => (
                        <div key={item.id} className="w-14 h-16 rounded-lg overflow-hidden bg-muted">
                          <img
                            src={item.productImageUrl}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/56x64/f5ede0/d4521a?text=Item`; }}
                          />
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="w-14 h-16 rounded-lg bg-muted flex items-center justify-center">
                          <span className="text-xs text-muted-foreground font-medium">+{order.items.length - 4}</span>
                        </div>
                      )}
                    </div>

                    {order.estimatedDelivery && order.status !== "delivered" && order.status !== "cancelled" && (
                      <p className="text-xs text-muted-foreground mt-4">
                        Estimated delivery: <span className="font-medium text-foreground">{new Date(order.estimatedDelivery).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Show>
      </div>

      <Footer />
    </div>
  );
}
