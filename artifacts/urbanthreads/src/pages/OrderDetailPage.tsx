import { Link, useParams } from "wouter";
import { Package, ChevronLeft, Truck, MapPin, CheckCircle2 } from "lucide-react";
import { useGetOrder } from "@workspace/api-client-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const ORDER_STEPS = ["confirmed", "processing", "shipped", "delivered"];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = parseInt(id ?? "0");

  const { data: order, isLoading } = useGetOrder(orderId, {
    query: { enabled: !!orderId, queryKey: ["getOrder", orderId] },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 space-y-4">
          <div className="h-8 bg-muted rounded animate-pulse w-1/3" />
          <div className="h-40 bg-muted rounded-2xl animate-pulse" />
          <div className="h-60 bg-muted rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold mb-4">Order not found</h1>
          <Link href="/orders" className="text-primary font-medium">Back to Orders</Link>
        </div>
      </div>
    );
  }

  const currentStepIndex = ORDER_STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ChevronLeft size={16} /> Back to Orders
        </Link>

        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Order #{order.id}</h1>
            <p className="text-muted-foreground mt-1">
              Placed {new Date(order.createdAt).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <span className={`text-sm font-bold uppercase tracking-wide px-4 py-2 rounded-full ${STATUS_STYLES[order.status] ?? "bg-muted text-muted-foreground"}`} data-testid="status-order-detail">
            {order.status}
          </span>
        </div>

        {/* Tracker */}
        {order.status !== "cancelled" && (
          <div className="bg-white rounded-2xl border border-border p-6 mb-6">
            <h2 className="font-semibold text-foreground mb-6 flex items-center gap-2">
              <Truck size={18} className="text-primary" /> Order Progress
            </h2>
            <div className="relative">
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted" />
              <div
                className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-500"
                style={{ width: `${currentStepIndex >= 0 ? (currentStepIndex / (ORDER_STEPS.length - 1)) * 100 : 0}%` }}
              />
              <div className="relative flex justify-between">
                {ORDER_STEPS.map((step, i) => {
                  const done = i <= currentStepIndex;
                  return (
                    <div key={step} className="flex flex-col items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 transition-all ${done ? "bg-primary border-primary" : "bg-white border-border"}`}>
                        {done ? <CheckCircle2 size={16} className="text-white" /> : <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />}
                      </div>
                      <span className={`text-xs font-medium capitalize ${done ? "text-primary" : "text-muted-foreground"}`}>{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {order.estimatedDelivery && order.status !== "delivered" && (
              <p className="text-sm text-muted-foreground mt-6 text-center">
                Estimated delivery: <span className="font-semibold text-foreground">
                  {new Date(order.estimatedDelivery).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </span>
              </p>
            )}
            {order.trackingNumber && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Tracking: <span className="font-semibold text-foreground">{order.trackingNumber}</span>
              </p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Items */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-border p-6">
            <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
              <Package size={18} className="text-primary" /> Items ({order.items.length})
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4" data-testid={`order-item-${item.id}`}>
                  <Link href={`/product/${item.productId}`}>
                    <div className="w-18 h-20 rounded-xl overflow-hidden bg-muted shrink-0">
                      <img
                        src={item.productImageUrl}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/72x80/f5ede0/d4521a?text=Item`; }}
                      />
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.productId}`}>
                      <p className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">{item.productName}</p>
                    </Link>
                    <p className="text-sm text-muted-foreground mt-0.5">Size {item.size} · Qty {item.quantity}</p>
                    <p className="text-sm font-bold text-foreground mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border mt-6 pt-5 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-medium text-foreground">${order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-bold text-foreground text-base">
                <span>Total</span>
                <span data-testid="text-order-total">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-2xl border border-border p-6 h-fit">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-primary" /> Delivery Address
            </h2>
            {order.shippingAddress ? (
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
                <p className="mt-2">{order.shippingAddress.phone}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No address on file</p>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
