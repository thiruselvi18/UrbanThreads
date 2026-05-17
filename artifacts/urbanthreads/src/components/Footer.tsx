import { Link } from "wouter";
import { Instagram, Twitter, Facebook } from "lucide-react";

export function Footer() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  return (
    <footer className="bg-foreground text-background mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <img src={`${basePath}/logo.svg`} alt="UrbanThreads" className="h-10 brightness-0 invert mb-4" />
            <p className="text-sm text-background/70 leading-relaxed">
              Bold fashion for every body. Plus-size clothing that celebrates you.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-background/70 hover:text-background transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-background/70 hover:text-background transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-background/70 hover:text-background transition-colors"><Facebook size={20} /></a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-widest mb-5 text-background/50">Shop</h4>
            <ul className="space-y-3">
              <li><Link href="/mens" className="text-sm text-background/80 hover:text-background transition-colors">Men's Collection</Link></li>
              <li><Link href="/womens" className="text-sm text-background/80 hover:text-background transition-colors">Women's Collection</Link></li>
              <li><Link href="/mens?featured=true" className="text-sm text-background/80 hover:text-background transition-colors">New Arrivals</Link></li>
              <li><Link href="/womens?featured=true" className="text-sm text-background/80 hover:text-background transition-colors">Best Sellers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-widest mb-5 text-background/50">Support</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-background/80 hover:text-background transition-colors">Size Guide</a></li>
              <li><a href="#" className="text-sm text-background/80 hover:text-background transition-colors">Shipping Info</a></li>
              <li><a href="#" className="text-sm text-background/80 hover:text-background transition-colors">Returns & Exchanges</a></li>
              <li><a href="#" className="text-sm text-background/80 hover:text-background transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-widest mb-5 text-background/50">About</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-background/80 hover:text-background transition-colors">Our Story</a></li>
              <li><a href="#" className="text-sm text-background/80 hover:text-background transition-colors">Sustainability</a></li>
              <li><a href="#" className="text-sm text-background/80 hover:text-background transition-colors">Careers</a></li>
              <li><a href="#" className="text-sm text-background/80 hover:text-background transition-colors">Press</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-background/50">&copy; {new Date().getFullYear()} UrbanThreads. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-background/50 hover:text-background/80 transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-background/50 hover:text-background/80 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
