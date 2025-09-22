import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Facebook, Twitter, Instagram, Linkedin, Mail, Zap, QrCode, Link as LinkIcon, MessageSquare, Bot, BarChart2, Users, ExternalLink, Phone } from "lucide-react";
import PartnerBadges from "../partner-badges2";
import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-50 via-gray-50 to-white text-gray-900 relative overflow-hidden border-t border-gray-200">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-500/3 to-pink-500/3 rounded-full blur-3xl"></div>
      </div>

      {/* Main footer content */}
      <div className="container mx-auto px-6 lg:px-8 py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-4">
            <div className="mb-8">
              <Image
                src="/zapzap.png"
                alt="Zaptick Logo"
                width={180}
                height={60}
                className="mb-6"
                priority
              />

              {/* Zapllo Branding */}
              <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-2xl border border-gray-200/50">
                <Image
                  src="/logoonly.png"
                  alt="Zapllo Logo"
                  width={32}
                  height={50}
                  className="r sh"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">A Product of</span>
                    <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Zapllo
                    </span>
                    <Link
                      href="https://zapllo.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                  <p className="text-xs text-gray-500">India's First AI Co-Manager for MSMEs</p>
                </div>
              </div>
            </div>

            <p className="text-gray-600 max-w-md leading-relaxed mb-8">
              Empowering businesses to harness WhatsApp's potential. From automated conversations to enterprise-grade analytics, we're your gateway to WhatsApp success.
            </p>

            {/* Partner Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mb-8"
            >
              <PartnerBadges animated={true} size="md" />
            </motion.div>

            {/* Contact Info */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                  <Mail className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Email Us</p>
                  <Link
                    href="mailto:hello@zaptick.io"
                    className="text-sm text-green-600 hover:text-green-700 transition-colors font-medium"
                  >
                    hello@zaptick.io
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Talk to Sales</p>
                  <Link
                    href="tel:+919836630366"
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium"
                  >
                    +91 9836630366
                  </Link>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              <Link
                href="https://twitter.com/zapllohq"
                className="group relative p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-all duration-300 hover:shadow-md"
              >
                <Twitter className="h-5 w-5 text-gray-600 group-hover:text-blue-500 transition-colors" />
              </Link>
              <Link
                href="https://www.facebook.com/zapllohq"
                className="group relative p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-all duration-300 hover:shadow-md"
              >
                <Facebook className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </Link>
              <Link
                href="https://www.instagram.com/zapllohq"
                className="group relative p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-all duration-300 hover:shadow-md"
              >
                <Instagram className="h-5 w-5 text-gray-600 group-hover:text-pink-600 transition-colors" />
              </Link>
              <Link
                href="https://www.linkedin.com/company/zapllo"
                className="group relative p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-all duration-300 hover:shadow-md"
              >
                <Linkedin className="h-5 w-5 text-gray-600 group-hover:text-blue-700 transition-colors" />
              </Link>
            </div>
          </div>

          {/* Products Section */}
          <div className="lg:col-span-3">
            <h3 className="font-bold mb-6 text-xl text-gray-900">Products</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="group flex items-center gap-3 p-3 rounded-xl hover:bg-green-50/50 transition-all duration-300">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">Zaptick Platform</span>
                    <div className="text-sm text-gray-500">Complete WhatsApp solution</div>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/qr-generator" className="group flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50/50 transition-all duration-300">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                    <QrCode className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">QR Generator</span>
                    <div className="text-sm text-green-600 font-medium">Free Tool</div>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/link-generator" className="group flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50/50 transition-all duration-300">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                    <LinkIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">Link Generator</span>
                    <div className="text-sm text-green-600 font-medium">Free Tool</div>
                  </div>
                </Link>
              </li>
            </ul>
          </div>

          {/* Features Section */}
          <div className="lg:col-span-2">
            <h3 className="font-bold mb-6 text-xl text-gray-900">Features</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors py-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Smart Messaging</span>
                </Link>
              </li>
              <li>
                <Link href="#" className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors py-2">
                  <Bot className="h-4 w-4" />
                  <span>AI Automation</span>
                </Link>
              </li>
              <li>
                <Link href="#" className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors py-2">
                  <BarChart2 className="h-4 w-4" />
                  <span>Analytics</span>
                </Link>
              </li>
              <li>
                <Link href="#" className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors py-2">
                  <Users className="h-4 w-4" />
                  <span>Team Management</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Section */}
          <div className="lg:col-span-3">
            <h3 className="font-bold mb-6 text-xl text-gray-900">Resources & Support</h3>
            <ul className="space-y-3 mb-8">
              <li><Link href="/docs" className="text-gray-600 hover:text-gray-900 transition-colors py-2 inline-block">Documentation</Link></li>
              <li><Link href="/api-docs" className="text-gray-600 hover:text-gray-900 transition-colors py-2 inline-block">API Reference</Link></li>
              <li><Link href="/case-studies" className="text-gray-600 hover:text-gray-900 transition-colors py-2 inline-block">Case Studies</Link></li>
              {/* <li><Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors py-2 inline-block">Help Center</Link></li> */}
              <li><Link href="/whatsapp-guide" className="text-gray-600 hover:text-gray-900 transition-colors py-2 inline-block">WhatsApp Guide</Link></li>
            </ul>

            <Link href="https://forms.gle/QF4nuFBb9WvcwY5S7">
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300 px-6">
                Contact Sales
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} Zaptick. All rights reserved.
              </p>

              <div className="flex gap-6 text-sm">
                <Link href="https://zapllo.com/privacypolicy" className="text-gray-500 hover:text-green-600 transition-colors">Privacy Policy</Link>
                <Link href="https://zapllo.com/terms" className="text-gray-500 hover:text-green-600 transition-colors">Terms of Service</Link>
                <Link href="https://zapllo.com/refundpolicy" className="text-gray-500 hover:text-green-600 transition-colors">Refund Policy</Link>
              </div>
            </div>
            <div className="text-sm text-gray-500 text-right">
              <div>Built with ❤️ for WhatsApp Businesses</div>
            </div>
            <div className="flex items-center gap-3">
              <Image
                src='/india.png'
                alt="Made in India"
                width={32}
                height={32}
                className="rounded"
              />
              <div className="font-medium">Proudly made in India</div>


            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
