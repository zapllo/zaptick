import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black/90 text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Newsletter subscription banner */}
      <div className="relative z-10 border-b border-gray-800">
        <div className="container mx-auto px-4 md:px-8 py-12">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Stay ahead with ZapTick updates</h3>
                <p className="text-gray-300 mb-4 max-w-md">
                  Get the latest product news, WhatsApp insights, and exclusive offers delivered to your inbox.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-grow">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="bg-gray-700 border-gray-600 h-12 w-full text-white placeholder:text-gray-400 focus-visible:ring-green-500"
                  />
                </div>
                <Button className="h-12 px-6 bg-emerald-500 hover:bg-emerald-600 text-white">
                  Subscribe <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="container mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-16">
          <div className="md:col-span-4">
            <div className="flex items-center gap-2 mb-6">
              {/* <div className="bg-gray-800 p-2 rounded-lg"> */}
                <Image src="/zaptick.png" alt="ZapTick Logo" width={100} height={100} />
              {/* </div> */}
              {/* <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-green-300">ZapTick</span> */}
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Transforming WhatsApp into a powerful business tool for growth. We help businesses of all sizes engage, support, and convert customers through the world&apos;s most popular messaging platform.
            </p>
            <div className="flex gap-4 mb-8">
              <Link href="#" className="text-gray-400 hover:text-emerald-400 transition-colors" aria-label="Twitter">
                <Twitter size={20} />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-emerald-400 transition-colors" aria-label="Facebook">
                <Facebook size={20} />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-emerald-400 transition-colors" aria-label="Instagram">
                <Instagram size={20} />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-emerald-400 transition-colors" aria-label="LinkedIn">
                <Linkedin size={20} />
              </Link>
            </div>
          </div>

          <div className="md:col-span-2">
            <h3 className="font-semibold mb-6 text-lg">Product</h3>
            <ul className="space-y-4">
              <li><Link href="#features" className="text-gray-400 hover:text-white transition-colors inline-block">Features</Link></li>
              <li><Link href="#pricing" className="text-gray-400 hover:text-white transition-colors inline-block">Pricing</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors inline-block">WhatsApp API</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors inline-block">Chat Automation</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors inline-block">Analytics</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="font-semibold mb-6 text-lg">Resources</h3>
            <ul className="space-y-4">
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors inline-block">Blog</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors inline-block">Documentation</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors inline-block">Case Studies</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors inline-block">Help Center</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors inline-block">API Reference</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="font-semibold mb-6 text-lg">Company</h3>
            <ul className="space-y-4">
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors inline-block">About Us</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors inline-block">Careers</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors inline-block">Contact</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors inline-block">Partners</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors inline-block">Legal</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="font-semibold mb-6 text-lg">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-emerald-400" />
                <a href="mailto:hello@zaptick.com" className="text-gray-400 hover:text-white transition-colors">hello@zaptick.io</a>
              </li>
              <li>
                <Button variant="outline" className="mt-2 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
              <p className="text-sm text-gray-400">
                © {new Date().getFullYear()} ZapTick. All rights reserved.
              </p>

              <div className="flex gap-6 text-sm">
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">Cookies</Link>
              </div>
            </div>

            <div className="flex items-center">
              <div className="text-sm text-gray-500">
                Made with ❤️ by the ZapTick Team
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
