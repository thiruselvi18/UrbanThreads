import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Plus } from "lucide-react";
import {
  useGetCart,
  useListAddresses,
  useCreateAddress,
  useCreateOrder,
  getGetCartQueryKey,
  getListOrdersQueryKey,
  getListAddressesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { Show } from "@clerk/react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const addressSchema = z.object({
  fullName: z.string().min(2, "Full name required"),
  line1: z.string().min(3, "Address required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City required"),
  state: z.string().min(2, "State required"),
  postalCode: z.string().min(3, "Postal code required"),
  country: z.string().min(2, "Country required"),
  phone: z.string().min(7, "Phone required"),
});

type AddressForm = z.infer<typeof addressSchema>;

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [step, setStep] = useState<"address" | "payment" | "confirm">("address");

  const { data: cart } = useGetCart();
  const { data: addresses = [], isLoading: addressesLoading } = useListAddresses();
  const createAddress = useCreateAddress();
  const createOrder = useCreateOrder();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: { fullName: "", line1: "", line2: "", city: "", state: "", postalCode: "", country: "United States", phone: "" },
  });

  function onAddAddress(data: AddressForm) {
    createAddress.mutate(
      { data: { ...data, line2: data.line2 || null, isDefault: addresses.length === 0 } },
      {
        onSuccess: (addr) => {
          queryClient.invalidateQueries({ queryKey: getListAddressesQueryKey() });
          setSelectedAddressId(addr.id);
          setShowAddressForm(false);
          toast({ title: "Address saved!" });
        },
      }
    );
  }

  function handlePlaceOrder() {
    if (!selectedAddressId) {
      toast({ title: "Please select a delivery address", variant: "destructive" });
      return;
    }
    createOrder.mutate(
      { data: { addressId: selectedAddressId, paymentMethod: "card" } },
      {
        onSuccess: (order) => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
          toast({ title: "Order placed!", description: `Order #${order.id} confirmed` });
          setLocation(`/orders/${order.id}`);
        },
        onError: () => {
          toast({ title: "Failed to place order", variant: "destructive" });
        },
      }
    );
  }

  const shipping = (cart?.subtotal ?? 0) >= 75 ? 0 : 7.99;
  const total = (cart?.subtotal ?? 0) + shipping;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Checkout</h1>
        <p className="text-muted-foreground mb-10">Complete your order</p>

        <Show when="signed-out">
          <div className="text-center py-20">
            <h2 className="text-xl font-semibold mb-4">Sign in to checkout</h2>
            <Link href="/sign-in" className="bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-xl hover:bg-primary/90 transition-colors inline-flex">
              Sign In
            </Link>
          </div>
        </Show>

        <Show when="signed-in">
          {!cart?.items?.length ? (
            <div className="text-center py-20">
              <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
              <Link href="/" className="text-primary font-medium">Start Shopping</Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-10">
              {/* Left: Delivery */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl border border-border p-6">
                  <h2 className="font-semibold text-lg text-foreground mb-6">Delivery Address</h2>

                  {addressesLoading ? (
                    <div className="space-y-3">
                      {[1, 2].map((i) => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}
                    </div>
                  ) : (
                    <>
                      {addresses.length > 0 && (
                        <div className="space-y-3 mb-4">
                          {addresses.map((addr) => (
                            <button
                              key={addr.id}
                              onClick={() => setSelectedAddressId(addr.id)}
                              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedAddressId === addr.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                              data-testid={`button-address-${addr.id}`}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-semibold text-foreground text-sm">{addr.fullName}</p>
                                  <p className="text-sm text-muted-foreground mt-0.5">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                                  <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.postalCode}</p>
                                  <p className="text-sm text-muted-foreground">{addr.country} · {addr.phone}</p>
                                </div>
                                {selectedAddressId === addr.id && (
                                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1">
                                    <Check size={13} className="text-white" />
                                  </div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => setShowAddressForm((v) => !v)}
                        className="flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80 transition-opacity"
                        data-testid="button-add-address"
                      >
                        <Plus size={16} /> Add New Address
                      </button>

                      {showAddressForm && (
                        <div className="mt-5 p-5 bg-muted/50 rounded-xl border border-border">
                          <h3 className="font-semibold text-foreground mb-5">New Address</h3>
                          <Form {...form}>
                            <form onSubmit={form.handleSubmit(onAddAddress)} className="space-y-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormField control={form.control} name="fullName" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl><Input placeholder="Jane Smith" {...field} data-testid="input-full-name" /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )} />
                                <FormField control={form.control} name="phone" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl><Input placeholder="+1 555 000 0000" {...field} data-testid="input-phone" /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )} />
                              </div>
                              <FormField control={form.control} name="line1" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Address Line 1</FormLabel>
                                  <FormControl><Input placeholder="123 Main St" {...field} data-testid="input-address-line1" /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                              <FormField control={form.control} name="line2" render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Address Line 2 (optional)</FormLabel>
                                  <FormControl><Input placeholder="Apt 4B" {...field} data-testid="input-address-line2" /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                              <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="city" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl><Input placeholder="New York" {...field} data-testid="input-city" /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )} />
                                <FormField control={form.control} name="state" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>State</FormLabel>
                                    <FormControl><Input placeholder="NY" {...field} data-testid="input-state" /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )} />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="postalCode" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Postal Code</FormLabel>
                                    <FormControl><Input placeholder="10001" {...field} data-testid="input-postal-code" /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )} />
                                <FormField control={form.control} name="country" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Country</FormLabel>
                                    <FormControl><Input placeholder="United States" {...field} data-testid="input-country" /></FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )} />
                              </div>
                              <div className="flex gap-3">
                                <button
                                  type="submit"
                                  disabled={createAddress.isPending}
                                  className="bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
                                  data-testid="button-save-address"
                                >
                                  {createAddress.isPending ? "Saving..." : "Save Address"}
                                </button>
                                <button type="button" onClick={() => setShowAddressForm(false)} className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4">Cancel</button>
                              </div>
                            </form>
                          </Form>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Payment */}
                <div className="bg-white rounded-2xl border border-border p-6">
                  <h2 className="font-semibold text-lg text-foreground mb-4">Payment</h2>
                  <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-primary bg-primary/5">
                    <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                      <Check size={15} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Demo Mode</p>
                      <p className="text-xs text-muted-foreground">No payment required for this demo</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-border p-6 sticky top-24">
                  <h2 className="font-semibold text-lg text-foreground mb-5">Order Summary</h2>
                  <div className="space-y-3 mb-5 max-h-48 overflow-y-auto">
                    {cart.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-12 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                          <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/48x56/f5ede0/d4521a?text=Item`; }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground line-clamp-1">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">Size {item.size} × {item.quantity}</p>
                        </div>
                        <span className="text-xs font-bold text-foreground shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border pt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span><span className="font-medium text-foreground">${cart.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span className={`font-medium ${shipping === 0 ? "text-green-600" : "text-foreground"}`}>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="border-t border-border pt-3 flex justify-between font-bold text-foreground text-base">
                      <span>Total</span><span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={!selectedAddressId || createOrder.isPending}
                    className="w-full mt-5 bg-primary text-primary-foreground font-bold py-4 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="button-place-order"
                  >
                    {createOrder.isPending ? "Placing Order..." : "Place Order"}
                  </button>
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    {!selectedAddressId ? "Select a delivery address to continue" : "Click to confirm your order"}
                  </p>
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
