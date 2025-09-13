"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, ChevronDown, Zap, QrCode, Link as LinkIcon } from "lucide-react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const products = [
    {
      name: "Zaptick",
      description: "Complete WhatsApp Business Platform",
      href: "/",
      icon: Zap,
      badge: "Pro"
    },
    {
      name: "QR Code Generator",
      description: "Generate WhatsApp QR codes instantly",
      href: "/qr-generator",
      icon: QrCode,
      badge: "Free"
    },
    {
      name: "Link Generator",
      description: "Create WhatsApp chat links easily",
      href: "/link-generator",
      icon: LinkIcon,
      badge: "Free"
    }
  ];

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-200 ${isScrolled
      ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
      : "bg-transparent"
      }`}>
      <div className="container mx-auto py-4 px-4 md:px-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Image
              src="/zapzap.png"
              alt="ZapTick Logo"
              width={150}
              height={150}
              className="hover:scale-105 transition-transform duration-200"
            />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1 hover:text-green-600 transition-colors">
                Products <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-2">
              {products.map((product, index) => (
                <DropdownMenuItem key={index} asChild className="p-0">
                  <Link
                    href={product.href}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-sm">
                      <product.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{product.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${product.badge === 'Free'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                          }`}>
                          {product.badge}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{product.description}</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={() => scrollToSection('features')}
            className="text-sm hover:text-green-600 transition-colors cursor-pointer"
          >
            Features
          </button>
          <Link href='/pricing'>
            <button
              className="block w-full cursor-pointer text-sm text-left py-2 text-gray-700 hover:text-green-600 transition-colors"
            >
              Pricing
            </button>
          </Link>
          <button
            onClick={() => scrollToSection('integrations')}
            className="text-sm hover:text-green-600 transition-colors cursor-pointer"
          >
            Integrations
          </button>
          <button
            onClick={() => scrollToSection('testimonials')}
            className="text-sm hover:text-green-600 transition-colors cursor-pointer"
          >
            Testimonials
          </button>
           <Link href='/partner-with-zaptick'>
            <button
              className="block w-full cursor-pointer text-sm text-left py-2 text-gray-700 hover:text-green-600 transition-colors"
            >
              Partner with us
            </button>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link href='/login'>
            <Button variant="outline" className='cursor-pointer hover:border-green-300 hover:bg-green-50 transition-colors' size="sm">
              Log in
            </Button>
          </Link>
          <Link href='/signup'>
            <Button size="sm" className="bg-gradient-to-r cursor-pointer from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-lg shadow-green-500/25 transition-all duration-300">
              Get Started
            </Button>
          </Link>
        </div>

        <div className="md:hidden flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-green-50 hover:text-green-600 transition-colors">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-80">
              <div className="mb-6">
                <Image src='/zapzap.png' alt="Zaptick Logo" width={120} height={40} className="mt-4" />
              </div>

              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Products</h3>
                  <div className="space-y-2">
                    {products.map((product, index) => (
                      <Link
                        key={index}
                        href={product.href}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                          <product.icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{product.name}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${product.badge === 'Free'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                              }`}>
                              {product.badge}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <button
                    onClick={() => scrollToSection('features')}
                    className="block w-full text-left py-2 text-gray-700 hover:text-green-600 transition-colors"
                  >
                    Features
                  </button>
                  <button
                    onClick={() => scrollToSection('integrations')}
                    className="block w-full text-left py-2 text-gray-700 hover:text-green-600 transition-colors"
                  >
                    Integrations
                  </button>
                  <Link href='/pricing'>
                    <button
                      className="block w-full text-left py-2 text-gray-700 hover:text-green-600 transition-colors"
                    >
                      Pricing
                    </button>
                  </Link>
                  <button
                    onClick={() => scrollToSection('testimonials')}
                    className="block w-full text-left py-2 text-gray-700 hover:text-green-600 transition-colors"
                  >
                    Testimonials
                  </button>
                </div>

                {/* <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-200">
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="w-full hover:border-green-300 hover:bg-green-50">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600">
                      Get Started
                    </Button>
                  </Link>
                </div> */}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}