"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu } from "lucide-react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-200 ${
      isScrolled ? "bg-background/95 backdrop-blur-md shadow-sm" : "bg-transparent"
    }`}>
      <div className="container mx-auto py-4 px-4 md:px-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image src="/icons/zapllo.png" alt="ZapTick Logo" width={40} height={40} />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-green-500">ZapTick</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm hover:text-primary transition-colors">Features</Link>
          <Link href="#integrations" className="text-sm hover:text-primary transition-colors">Integrations</Link>
          <Link href="#testimonials" className="text-sm hover:text-primary transition-colors">Testimonials</Link>
          <Link href="#pricing" className="text-sm hover:text-primary transition-colors">Pricing</Link>
          <Link href="#support" className="text-sm hover:text-primary transition-colors">Support</Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button variant="outline" size="sm">Log in</Button>
          <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600">
            Get Started
          </Button>
        </div>

        <div className="md:hidden flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-6 mt-8">
                <Link href="#features" className="text-lg hover:text-primary transition-colors">Features</Link>
                <Link href="#integrations" className="text-lg hover:text-primary transition-colors">Integrations</Link>
                <Link href="#testimonials" className="text-lg hover:text-primary transition-colors">Testimonials</Link>
                <Link href="#pricing" className="text-lg hover:text-primary transition-colors">Pricing</Link>
                <Link href="#support" className="text-lg hover:text-primary transition-colors">Support</Link>
                <div className="flex flex-col gap-3 mt-4">
                  <Button variant="outline" size="sm">Log in</Button>
                  <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600">
                    Get Started
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
