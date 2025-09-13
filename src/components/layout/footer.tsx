import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Facebook, Twitter, Instagram, Linkedin, Mail, Zap, QrCode, Link as LinkIcon, MessageSquare, Bot, BarChart2, Users } from "lucide-react";
import PartnerBadges from "../ui/partner-badges";
import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Newsletter subscription banner */}
      {/* <div className="relative z-10 border-b border-gray-700/50">
        <div className="container mx-auto px-4 md:px-8 py-16">
          <div className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-600/20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-4 py-2 border border-green-500/30 mb-4">
                  <MessageSquare className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium text-green-300">Stay Connected</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Transform your WhatsApp game
                </h3>
                <p className="text-gray-300 mb-4 max-w-md leading-relaxed">
                  Get exclusive WhatsApp marketing insights, product updates, and growth strategies delivered weekly.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-grow">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    className="bg-gray-700/50 border-gray-600/50 h-14 w-full text-white placeholder:text-gray-400 focus-visible:ring-green-500 focus-visible:border-green-500 rounded-xl backdrop-blur-sm"
                  />
                </div>
                <Button className="h-14 px-8 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold rounded-xl shadow-lg shadow-green-500/25 transition-all duration-300">
                  Subscribe <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Main footer content */}
      <div className="container mx-auto px-4 md:px-8 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand Section */}
          <div className="md:col-span-4">
            <div className="flex items-center  gap-3 mb-6">
              <img
                src="/zaptick.png"
                alt="ZapTick Logo"

                className="brightness-0  w-56 invert"
              />
            </div>
            <p className="text-gray-400  max-w-md leading-relaxed">
              Empowering businesses to harness WhatsApp&apos;s potential. From automated conversations to enterprise-grade analytics, we&apos;re your gateway to WhatsApp success.
            </p>
            {/* Partner Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="pt-6 flex mb-8 flex justify-center"
            >
              <PartnerBadges animated={true} size="md" />
            </motion.div>
            <div className="flex gap-4 mb-8">
              <Link href="#" className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                <div className="relative bg-gray-800 hover:bg-gray-700 p-3 rounded-lg border border-gray-700 transition-all duration-300">
                  <Twitter size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                </div>
              </Link>
              <Link href="#" className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                <div className="relative bg-gray-800 hover:bg-gray-700 p-3 rounded-lg border border-gray-700 transition-all duration-300">
                  <Facebook size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                </div>
              </Link>
              <Link href="#" className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                <div className="relative bg-gray-800 hover:bg-gray-700 p-3 rounded-lg border border-gray-700 transition-all duration-300">
                  <Instagram size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                </div>
              </Link>
              <Link href="#" className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                <div className="relative bg-gray-800 hover:bg-gray-700 p-3 rounded-lg border border-gray-700 transition-all duration-300">
                  <Linkedin size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                </div>
              </Link>
            </div>
          </div>

          {/* Products Section */}
          <div className="md:col-span-3">
            <h3 className="font-bold mb-6 text-xl bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Products</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="group flex items-center gap-3 text-gray-400 hover:text-white transition-all duration-300">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <span className="font-medium">Zaptick Platform</span>
                    <div className="text-xs text-gray-500">Complete WhatsApp solution</div>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/qr-generator" className="group flex items-center gap-3 text-gray-400 hover:text-white transition-all duration-300">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 group-hover:scale-110 transition-transform duration-300">
                    <QrCode className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <span className="font-medium">QR Generator</span>
                    <div className="text-xs text-green-400 font-medium">Free Tool</div>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/link-generator" className="group flex items-center gap-3 text-gray-400 hover:text-white transition-all duration-300">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 group-hover:scale-110 transition-transform duration-300">
                    <LinkIcon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <span className="font-medium">Link Generator</span>
                    <div className="text-xs text-green-400 font-medium">Free Tool</div>
                  </div>
                </Link>
              </li>
            </ul>
          </div>

          {/* Features Section */}
          <div className="md:col-span-2">
            <h3 className="font-bold mb-6 text-xl text-white">Features</h3>
            <ul className="space-y-4">
              <li><Link href="#" className="text-gray-400 hover:text-green-400 transition-colors inline-flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Smart Messaging</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-green-400 transition-colors inline-flex items-center gap-2"><Bot className="h-4 w-4" /> AI Automation</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-green-400 transition-colors inline-flex items-center gap-2"><BarChart2 className="h-4 w-4" /> Analytics</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-green-400 transition-colors inline-flex items-center gap-2"><Users className="h-4 w-4" /> Team Management</Link></li>
            </ul>
          </div>

          {/* Resources Section */}
          <div className="md:col-span-3">
            <h3 className="font-bold mb-6 text-xl text-white">Resources & Support</h3>
            <ul className="space-y-4">
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors inline-block">Documentation</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors inline-block">API Reference</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors inline-block">Case Studies</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors inline-block">Help Center</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors inline-block">WhatsApp Guide</Link></li>
              <li>
                <div className="flex items-center gap-3 mt-6">
                  <Mail size={16} className="text-green-400" />
                  <a href="mailto:hello@zaptick.io" className="text-gray-400 hover:text-white transition-colors">hello@zaptick.io</a>
                </div>
              </li>
              <li>
                <Button variant="outline" className="mt-4 border-gray-600 text-black -300 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all duration-300">
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </li>
            </ul>
          </div>
        </div>
        {/* Bottom Section */}
        <div className="border-t border-gray-700/50 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
              <p className="text-sm text-gray-400">
                © {new Date().getFullYear()} ZapTick. All rights reserved.
              </p>

              <div className="flex gap-6 text-sm">
                <Link href="#" className="text-gray-400 hover:text-green-400 transition-colors">Privacy Policy</Link>
                <Link href="#" className="text-gray-400 hover:text-green-400 transition-colors">Terms of Service</Link>
                <Link href="#" className="text-gray-400 hover:text-green-400 transition-colors">Cookie Policy</Link>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div>
                <div className="text-sm flex items-center gap-1 text-gray-500">
                  <img src='/india.png' className="h-12" />

                  Proudly made in India
                </div>
                <div className="text-sm text-gray-500">
                  Built with ❤️ for WhatsApp Businesses
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-xs text-gray-600">Powered by</span>
                <a
                  href="https://zapllo.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:opacity-80 transition-opacity"
                >
                  <img
                    src="https://zapllo.com/logo.png"
                    alt="Zapllo"
                    className="h-4 w-auto"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}