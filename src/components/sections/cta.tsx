"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, MessageSquare, ArrowRight } from "lucide-react";

export default function CtaSection() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      // In a real implementation, you would submit the form to your backend
    }
  };

  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-white to-gray-50 wark:from-gray-900 wark:to-gray-950">
      <div className="container mx-auto px-4 md:px-8">
        <div className="bg-gradient-to-r from-emerald-500 to-blue-500 rounded-3xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 p-8 md:p-12 text-white">
              <motion.h2
                className="text-3xl md:text-4xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
              >
                Ready to transform your customer communication?
              </motion.h2>
              <motion.p
                className="text-white/90 mb-8 text-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                Join thousands of businesses already using ZapTick to engage with customers on WhatsApp.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-8">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-white/20 text-white placeholder:text-white/70 border-white/20 focus-visible:ring-white"
                    />
                    <Button type="submit" className="bg-white text-emerald-600 hover:bg-white/90">
                      Get Started
                    </Button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2 bg-white/20 p-3 rounded-lg mb-8">
                    <CheckCircle className="h-5 w-5 text-white" />
                    <p className="text-white">Thanks! We&apos;ll be in touch soon.</p>
                  </div>
                )}
              </motion.div>

              <motion.div
                className="flex flex-col sm:flex-row items-center gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="flex -space-x-2">
                  <Image src="/avatar-1.png" alt="User" width={40} height={40} className="rounded-full border-2 border-emerald-500" />
                  <Image src="/avatar-2.png" alt="User" width={40} height={40} className="rounded-full border-2 border-emerald-500" />
                  <Image src="/avatar-3.png" alt="User" width={40} height={40} className="rounded-full border-2 border-emerald-500" />
                </div>
                <p className="text-sm text-white">
                  Trusted by <span className="font-semibold">1,200+</span> businesses worldwide
                </p>
              </motion.div>
            </div>

            <div className="md:w-1/2 relative min-h-[300px] md:min-h-0">
              <Image
                src="/cta-illustration.png"
                alt="WhatsApp Business Platform"
                fill
                className="object-cover"
              />

              {/* Interactive elements */}
              <motion.div
                className="absolute top-1/4 left-1/4 bg-white rounded-xl shadow-lg p-4 max-w-[200px]"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-100 rounded-full p-2">
                    <MessageSquare className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Start chatting now</p>
                    <p className="text-[10px] text-muted-foreground">Connect with customers instantly</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute bottom-1/4 right-1/4 bg-white rounded-xl shadow-lg p-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <p className="text-xs font-semibold">Ready to get started?</p>
                <Button size="sm" className="mt-2 bg-emerald-500 hover:bg-emerald-600 text-xs h-7 w-full">
                  <span>Start Free Trial</span>
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-bold mb-6">Trusted by businesses worldwide</h3>
          <div className="flex flex-wrap justify-center gap-8 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-100 wark:bg-emerald-900/30 p-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-emerald-600 wark:text-emerald-400" />
              </div>
              <div className="text-sm">
                <p className="font-medium">GDPR Compliant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-emerald-100 wark:bg-emerald-900/30 p-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-emerald-600 wark:text-emerald-400" />
              </div>
              <div className="text-sm">
                <p className="font-medium">SOC 2 Certified</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-emerald-100 wark:bg-emerald-900/30 p-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-emerald-600 wark:text-emerald-400" />
              </div>
              <div className="text-sm">
                <p className="font-medium">99.9% Uptime SLA</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-emerald-100 wark:bg-emerald-900/30 p-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-emerald-600 wark:text-emerald-400" />
              </div>
              <div className="text-sm">
                <p className="font-medium">24/7 Support</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
