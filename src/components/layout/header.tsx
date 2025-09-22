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
import { Menu, ChevronDown, Zap, QrCode, Link as LinkIcon, Mail, Phone, ExternalLink } from "lucide-react";

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
      badge: "Pro",
      color: "from-green-500 to-emerald-600"
    },
    {
      name: "QR Code Generator",
      description: "Generate WhatsApp QR codes instantly",
      href: "/qr-generator",
      icon: QrCode,
      badge: "Free",
      color: "from-blue-500 to-cyan-600"
    },
    {
      name: "Link Generator",
      description: "Create WhatsApp chat links easily",
      href: "/link-generator",
      icon: LinkIcon,
      badge: "Free",
      color: "from-purple-500 to-pink-600"
    }
  ];

  return (
    <>
      {/* Top Premium Bar */}
      {/* Top Premium Bar */}
      <div className={`fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50 backdrop-blur-xl border-b border-gray-200/80 shadow-sm transition-all duration-300 ${isScrolled ? 'transform -translate-y-full opacity-0' : 'transform translate-y-0 opacity-100'
        }`}>
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between py-2 text-sm">
            {/* Left - Contact Info */}
            <div className="flex items-center gap-8">
              <Link
                href="mailto:hello@zaptick.io"
                className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-all duration-200 group px-3 py-1.5 rounded-lg hover:bg-green-50/70"
              >
                <div className="w-5 h-5 rounded-full bg-green-100/80 flex items-center justify-center group-hover:bg-green-200/80 transition-colors">
                  <Mail className="h-3 w-3 text-green-600" />
                </div>
                <span className="font-medium">hello@zaptick.io</span>
              </Link>

              <div className="hidden md:block w-px h-4 bg-gray-300/60"></div>

              <Link
                href="tel:+919836630366"
                className="hidden md:flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-all duration-200 group px-3 py-1.5 rounded-lg hover:bg-blue-50/70"
              >
                <div className="w-5 h-5 rounded-full bg-blue-100/80 flex items-center justify-center group-hover:bg-blue-200/80 transition-colors">
                  <Phone className="h-3 w-3 text-blue-600" />
                </div>
                <span className="font-medium">Talk to Sales: +91 9836630366</span>
              </Link>
            </div>

            {/* Right - Branding & Contact */}
            <div className="md:flex hidden items-center gap-4">
              <Link
                href="https://zapllo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-all duration-200 group px-3 py-1.5 rounded-lg hover:bg-gradient-to-r hover:from-blue-50/70 hover:to-purple-50/70"
              >
                <div className="w-7 h-7 round  p-0.5 ">
                  <Image
                    src="/logoonly.png"
                    alt="Zapllo Logo"
                    width={16}
                    height={16}
                    className=" w-full h-full object-contain"
                  />
                </div>
                <span className="text-xs font-medium">A Product of</span>
                <div className="flex items-center gap-1.5">

                  <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Zapllo
                  </span>
                </div>
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all duration-200" />
              </Link>

              <div className="w-px h-4 bg-gray-300/60"></div>

              <Link
                href="https://zapllo.com/contact"
                className="text-gray-600 hover:text-gray-900 transition-all duration-200 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100/70"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <header className={`fixed left-0 right-0 p-1 z-[50] transition-all duration-300 ${isScrolled
        ? "top-0 bg-white/98 backdrop-blur-xl shadow-lg border-b border-gray-200"
        : "top-12 bg-white/95 backdrop-blur-sm"
        }`}>
        <div className="container mx-auto px-6 lg:px-8">
          <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'py-3' : 'py-4'
            }`}>

            {/* Logo */}
            <Link href="/" className="group flex-shrink-0">
              <Image
                src="/zapzap.png"
                alt="Zaptick Logo"
                width={isScrolled ? 150 : 160}
                height={isScrolled ? 54 : 60}
                className="group-hover:scale-105 transition-all duration-200"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex text-lg items-center gap-1">
              {/* Products Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex text-base items-center gap-2 h-10 px-4 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-xl font-medium transition-all duration-200"
                  >
                    Products
                    <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[420px] p-4 mt-2 border border-gray-200 shadow-xl bg-white/98 backdrop-blur-xl rounded-2xl"
                  sideOffset={8}
                >
                  <div className="grid gap-2">
                    {products.map((product, index) => (
                      <DropdownMenuItem key={index} asChild className="p-0 rounded-xl">
                        <Link
                          href={product.href}
                          className="flex items-start gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-green-50/50 transition-all duration-200 cursor-pointer group"
                        >
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${product.color} shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200`}>
                            <product.icon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">{product.name}</span>
                              <span className={`text-xs px-2 py-1 rounded-lg font-medium ${product.badge === 'Free'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-blue-100 text-blue-700'
                                }`}>
                                {product.badge}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Navigation Links */}
              {[
                { label: 'Features', action: () => scrollToSection('features') },
                { label: 'Pricing', href: '/pricing' },
                { label: 'Integrations', action: () => scrollToSection('integrations') },
                { label: 'Testimonials', action: () => scrollToSection('testimonials') },
                { label: 'Partners', href: '/partner-with-zaptick' }
              ].map((item, index) => (
                item.href ? (
                  <Link key={index} href={item.href}>
                    <Button
                      variant="ghost"
                      className="h-10 px-4 text-base text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-xl font-medium transition-all duration-200"
                    >
                      {item.label}
                    </Button>
                  </Link>
                ) : (
                  <Button
                    key={index}
                    variant="ghost"
                    onClick={item.action}
                    className="h-10 px-4 text-base text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-xl font-medium transition-all duration-200"
                  >
                    {item.label}
                  </Button>
                )
              ))}
            </nav>

            {/* Desktop CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Link href='/login'>
                <Button
                  variant="ghost"
                  className="h-10 px-6 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-xl font-medium transition-all duration-200"
                >
                  Sign In
                </Button>
              </Link>
              <Link href='/signup'>
                <Button className="h-10 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md shadow-green-500/25 hover:shadow-lg hover:shadow-green-500/30 rounded-xl font-medium transition-all duration-200">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Menu */}
            <div className="lg:hidden flex items-center gap-3">
              <Link href='/login'>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg font-medium transition-all duration-200"
                >
                  Sign In
                </Button>
              </Link>
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 hover:bg-green-50 hover:text-green-600 rounded-xl transition-all duration-200"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:w-80 bg-white/98 backdrop-blur-xl border-l border-gray-200">
                  <div className="flex flex-col h-full">
                    {/* Mobile Header */}
                    <div className="mb-8 pb-6 border-b border-gray-200">
                      <Image
                        src='/zapzap.png'
                        alt="Zaptick Logo"
                        width={150}
                        height={56}
                        className="mt-4"
                      />
                    </div>

                    {/* Zapllo Branding */}
                    <div className="mb-8 p-4 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-2xl border border-gray-200/50">
                      <Link
                        href="https://zapllo.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 group"
                      >
                        <Image
                          src="/logoonly.png"
                          alt="Zapllo Logo"
                          width={24}
                          height={24}
                          className="rounded shadow-sm"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">A Product of</span>
                            <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              Zapllo
                            </span>
                            <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
                          </div>
                          <p className="text-xs text-gray-500">Enterprise Software Solutions</p>
                        </div>
                      </Link>
                    </div>

                    {/* Mobile Contact */}
                    <div className="mb-8 space-y-3">
                      <Link
                        href="mailto:hello@zaptick.io"
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50/50 transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                          <Mail className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Email Us</p>
                          <p className="text-sm text-gray-600">hello@zaptick.io</p>
                        </div>
                      </Link>
                      <Link
                        href="tel:+919836630366"
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50/50 transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <Phone className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Talk to Sales</p>
                          <p className="text-sm text-gray-600">+91 9836630366</p>
                        </div>
                      </Link>
                    </div>

                    {/* Mobile Products */}
                    <div className="mb-8">
                      <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Products</h3>
                      <div className="space-y-2">
                        {products.map((product, index) => (
                          <Link
                            key={index}
                            href={product.href}
                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-green-50/50 transition-all duration-200 group"
                          >
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r ${product.color} shadow-sm group-hover:scale-105 transition-all duration-200`}>
                              <product.icon className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900">{product.name}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${product.badge === 'Free'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-blue-100 text-blue-700'
                                  }`}>
                                  {product.badge}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{product.description}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="space-y-2 mb-8">
                      {[
                        { label: 'Features', action: () => scrollToSection('features') },
                        { label: 'Pricing', href: '/pricing' },
                        { label: 'Integrations', action: () => scrollToSection('integrations') },
                        { label: 'Testimonials', action: () => scrollToSection('testimonials') }
                      ].map((item, index) => (
                        item.href ? (
                          <Link key={index} href={item.href}>
                            <Button
                              variant="ghost"
                              className="w-full justify-start h-11 px-4 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-xl font-medium transition-all duration-200"
                            >
                              {item.label}
                            </Button>
                          </Link>
                        ) : (
                          <Button
                            key={index}
                            variant="ghost"
                            onClick={item.action}
                            className="w-full justify-start h-11 px-4 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-xl font-medium transition-all duration-200"
                          >
                            {item.label}
                          </Button>
                        )
                      ))}
                    </div>

                    {/* Mobile CTA */}
                    <div className="mt-auto">
                      <Link href="/signup">
                        <Button className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md rounded-xl font-medium transition-all duration-200">
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
