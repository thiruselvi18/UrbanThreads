import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Show, useClerk, useUser } from "@clerk/react";
import { ShoppingBag, Menu, X, ChevronDown, User, LogOut, Package } from "lucide-react";
import { useGetCart } from "@workspace/api-client-react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  const { data: cart } = useGetCart();
  const cartCount = cart?.itemCount ?? 0;

  const navLinks = [
    { href: "/mens", label: "Men" },
    { href: "/womens", label: "Women" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src={`${basePath}/logo.svg`} alt="UrbanThreads" className="h-9" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold tracking-wide uppercase transition-colors hover:text-primary ${location === link.href ? "text-primary" : "text-foreground"}`}
                data-testid={`nav-link-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Show when="signed-out">
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                  data-testid="nav-sign-in"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="text-sm font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                  data-testid="nav-sign-up"
                >
                  Join Now
                </Link>
              </div>
            </Show>

            <Show when="signed-in">
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                  data-testid="nav-user-menu"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User size={16} className="text-primary" />
                  </div>
                  <span className="hidden lg:block">{user?.firstName ?? "Account"}</span>
                  <ChevronDown size={14} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-border py-2 z-50">
                    <Link
                      href="/orders"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Package size={15} /> My Orders
                    </Link>
                    <button
                      onClick={() => { signOut({ redirectUrl: basePath || "/" }); setUserMenuOpen(false); }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted w-full transition-colors"
                      data-testid="nav-sign-out"
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </Show>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 rounded-lg hover:bg-muted transition-colors"
              data-testid="nav-cart"
            >
              <ShoppingBag size={22} className="text-foreground" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              data-testid="nav-mobile-menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-border px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-base font-semibold uppercase tracking-wide text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Show when="signed-out">
            <div className="flex gap-2 pt-2 border-t border-border">
              <Link href="/sign-in" className="flex-1 text-center py-2 border border-border rounded-lg text-sm font-medium" onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link href="/sign-up" className="flex-1 text-center py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold" onClick={() => setMobileOpen(false)}>Join Now</Link>
            </div>
          </Show>
          <Show when="signed-in">
            <div className="pt-2 border-t border-border space-y-2">
              <Link href="/orders" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>My Orders</Link>
              <button
                onClick={() => { signOut({ redirectUrl: basePath || "/" }); setMobileOpen(false); }}
                className="block text-sm font-medium text-destructive py-2"
              >
                Sign Out
              </button>
            </div>
          </Show>
        </div>
      )}
    </nav>
  );
}
