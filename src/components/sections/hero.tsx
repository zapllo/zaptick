"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { MessageCircle, MessageCircleMore, Play, X } from "lucide-react";

export default function Hero() {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <section className="container mx-auto py-20 px-4 md:px-8">
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
        <motion.div
          className="md:w-1/2 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Badge className="mb-4 px-3 py-1 bg-emerald-100 text-emerald-800 wark:bg-emerald-900 wark:text-emerald-300">WhatsApp Business API</Badge>
          </motion.div>
          <motion.h1
            className="text-4xl md:text-6xl font-bold leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Transform your customer engagement with{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-green-500">WhatsApp</span>
          </motion.h1>
          <motion.p
            className="text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            ZapTick helps businesses connect with customers instantly through WhatsApp. Send notifications, provide support, and drive sales all in one platform.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600">
              Start Free Trial
            </Button>
            <Dialog open={showVideo} onOpenChange={setShowVideo}>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="group">
                  <Play className="mr-2 h-4 w-4" />
                  <span>Watch Demo</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] p-0 bg-transparent border-none">
                <div className="relative aspect-video">
                  <iframe
                    className="w-full h-full rounded-lg"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                    onClick={() => setShowVideo(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
          <motion.div
            className="flex items-center gap-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="flex -space-x-2">

            <img src="/avatars/female1.jpg" alt="User"  className="rounded-full border-2 h-12 w-20 object-cover border-background" />
            <img src="/avatars/man3.jpg" alt="User"  className="rounded-full border-2 h-12 w-16 object-cover border-background" />
            <img src="/avatars/female2.jpg" alt="User"  className="rounded-full border-2 h-12 w-12 object-cover border-background" />
            <img src="/avatars/man1.jpg" alt="User"  className="rounded-full border-2 h-12 w-16 object-cover border-background" />

            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">1,200+ businesses</span> are already growing with ZapTick
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          className="md:w-1/2 relative"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 p-6 rounded-3xl shadow-xl border border-emerald-200/20 wark:border-emerald-900/30">
            <Image
              src="/whatsapp-dashboard.png"
              alt="ZapTick Dashboard"
              width={600}
              height={400}
              className="rounded-xl shadow-lg transform hover:scale-[1.02] transition-transform duration-300"
            />

            {/* Live notification animation */}
            <motion.div
              className="absolute -top-6 -right-6 bg-white wark:bg-gray-800 shadow-lg rounded-full p-3"
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <MessageCircleMore className="text-green-800" />
            </motion.div>

            {/* Interactive notification widget */}
            <motion.div
              className="absolute bottom-4 left-4 bg-white wark:bg-gray-800 shadow-lg rounded-xl p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500 rounded-full w-8 h-8 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                    <path d="M22 11.0857V12.0057C21.9988 14.1621 21.3005 16.2604 20.0093 17.9875C18.7182 19.7147 16.9033 20.9782 14.8354 21.5896C12.7674 22.201 10.5573 22.1276 8.53447 21.3803C6.51168 20.633 4.78465 19.2518 3.61096 17.4428C2.43727 15.6338 1.87979 13.4938 2.02168 11.342C2.16356 9.19029 2.99721 7.14205 4.39828 5.5028C5.79935 3.86354 7.69279 2.72111 9.79619 2.24587C11.8996 1.77063 14.1003 1.98806 16.07 2.86572M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">New lead captured!</p>
                  <p className="font-medium text-sm">Sarah from Acme Corp</p>
                </div>
              </div>
            </motion.div>

            {/* Chat conversation bubble */}
            <motion.div
              className="absolute top-10 right-0 bg-white wark:bg-gray-800 shadow-lg rounded-xl p-4 max-w-[240px]"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-start gap-3">
                <Image src="/avatar-customer.png" alt="Customer" width={32} height={32} className="rounded-full" />
                <div>
                  <p className="text-xs font-semibold mb-1">John (Customer)</p>
                  <div className="bg-gray-100 wark:bg-gray-700 p-2 rounded-lg text-xs">
                    Hi there! I&apos;m interested in your products. Can you help me?
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] text-muted-foreground">2 min ago</span>
                    <Button variant="ghost" size="sm" className="h-6 text-xs text-emerald-500 p-0">Reply</Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Interactive WhatsApp business indicators */}
      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Conversion Rate", value: "+40%", description: "Compared to email" },
          { label: "Message Open Rate", value: "98%", description: "Within 3 minutes" },
          { label: "Customer Satisfaction", value: "94%", description: "Approval rating" },
          { label: "Response Time", value: "45s", description: "Average" }
        ].map((stat, index) => (
          <motion.div
            key={index}
            className="bg-white/50 wark:bg-gray-900/50 rounded-xl p-4 text-center border border-emerald-100 wark:border-emerald-900/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
          >
            <h3 className="text-sm font-medium text-muted-foreground">{stat.label}</h3>
            <p className="text-2xl font-bold text-emerald-500 my-1">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
