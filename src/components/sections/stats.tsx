"use client";

import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import CountUp from "react-countup";

export default function StatsSection() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const stats = [
    {
      value: 98,
      suffix: "%",
      title: "Open Rate on WhatsApp",
      description: "Compared to 20% for email marketing",
      color: "bg-emerald-50 wark:bg-emerald-950/30",
      textColor: "text-emerald-600 wark:text-emerald-400",
    },
    {
      value: 40,
      suffix: "%",
      title: "Higher Conversion Rate",
      description: "Than traditional communication channels",
      color: "bg-blue-50 wark:bg-blue-950/30",
      textColor: "text-blue-600 wark:text-blue-400",
    },
    {
      value: 2,
      suffix: "B+",
      title: "WhatsApp Users Worldwide",
      description: "Reach your customers where they are",
      color: "bg-purple-50 wark:bg-purple-950/30",
      textColor: "text-purple-600 wark:text-purple-400",
    },
    {
      value: 65,
      suffix: "%",
      title: "Cost Reduction",
      description: "Compared to traditional support channels",
      color: "bg-orange-50 wark:bg-orange-950/30",
      textColor: "text-orange-600 wark:text-orange-400",
    },
  ];

  return (
    <section ref={ref} className="container mx-auto py-16 px-4 md:px-8">
      <div className="text-center mb-12">
        <Badge className="mb-4 px-3 py-1 bg-blue-100 text-blue-800 wark:bg-blue-900 wark:text-blue-300">Business Impact</Badge>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Transform your business metrics</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          See the real impact WhatsApp Business API can have on your customer engagement and business performance.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            className={`${stat.color} rounded-xl p-6 text-center transition-all duration-300 hover:shadow-lg`}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className={`${stat.textColor} text-4xl font-bold mb-2`}>
              {inView ? (
                <CountUp end={stat.value} duration={2} suffix={stat.suffix} />
              ) : (
                0
              )}
            </div>
            <h3 className="text-lg font-semibold mb-2">{stat.title}</h3>
            <p className="text-sm text-muted-foreground">{stat.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 p-8 rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-2xl font-bold mb-4">Real-time business impact</h3>
            <p className="text-muted-foreground mb-6">
              Our customers typically see a 3x ROI within the first 30 days of implementing ZapTick&apos;s WhatsApp Business solution.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Increased engagement", value: "157%" },
                { label: "Faster resolution times", value: "64%" },
                { label: "Customer satisfaction", value: "89%" },
                { label: "Sales conversion", value: "42%" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="bg-white/50 wark:bg-gray-900/50 p-3 rounded-lg"
                  initial={{ opacity: 0, x: -10 }}
                  animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                  transition={{ delay: 0.5 + (index * 0.1), duration: 0.3 }}
                >
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-lg font-bold text-emerald-500">{item.value}</p>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="bg-white wark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <h4 className="text-lg font-semibold mb-4">Monthly Growth</h4>
              <div className="h-[200px] w-full bg-gray-100 wark:bg-gray-700 rounded-lg relative overflow-hidden">
                {/* Simplified chart representation */}
                {[30, 45, 25, 60, 35, 80].map((height, index) => (
                  <motion.div
                    key={index}
                    className="absolute bottom-0 bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-t-sm w-[12%]"
                    style={{ left: `${index * 16 + 4}%` }}
                    initial={{ height: 0 }}
                    animate={inView ? { height: `${height}%` } : { height: 0 }}
                    transition={{ delay: 0.8 + (index * 0.1), duration: 0.5 }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
              </div>
            </div>
            <motion.div
              className="absolute -top-4 -right-4 bg-emerald-500 text-white p-3 rounded-lg text-sm font-semibold"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ delay: 1.2, duration: 0.3 }}
            >
              +127% YOY Growth
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
