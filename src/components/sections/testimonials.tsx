"use client";

import { useState } from "react";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Director",
      company: "RetailGiant",
      image: "/testimonials/sarah.jpg",
      content: "ZapTick transformed our customer engagement strategy. Our response times decreased by 70% and customer satisfaction scores are at an all-time high. The ROI has been incredible.",
      rating: 5,
      metrics: { responses: "+82%", satisfaction: "+45%", conversions: "+38%" }
    },
    {
      name: "David Chen",
      role: "E-commerce Manager",
      company: "FashionTrends",
      image: "/testimonials/david.jpg",
      content: "The ability to sell directly through WhatsApp has been a game-changer. Our abandoned cart recovery rate increased by 55% and the seamless checkout process has boosted our conversion rates dramatically.",
      rating: 5,
      metrics: { recovery: "+55%", aov: "+28%", conversions: "+42%" }
    },
    {
      name: "Maria Rodriguez",
      role: "Customer Support Lead",
      company: "TechSolutions",
      image: "/testimonials/maria.jpg",
      content: "Managing support requests through ZapTick has improved our efficiency by 65%. The automation features have allowed our team to focus on complex issues while routine inquiries are handled automatically.",
      rating: 5,
      metrics: { resolution: "-45%", handling: "+65%", satisfaction: "+41%" }
    },
    {
      name: "James Wilson",
      role: "CEO",
      company: "GrowthStartup",
      image: "/testimonials/james.jpg",
      content: "Implementing ZapTick was one of the best decisions we made. Our sales team now closes deals directly in WhatsApp conversations, and our lead response time dropped from hours to minutes.",
      rating: 5,
      metrics: { leads: "+76%", response: "-82%", closing: "+48%" }
    },
  ];

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  return (
    <section id="testimonials" ref={ref} className="container mx-auto py-20 px-4 md:px-8">
      <div className="text-center mb-16">
        <Badge className="mb-4 px-3 py-1 bg-orange-100 text-orange-800 wark:bg-orange-900 wark:text-orange-300">
          Customer Success
        </Badge>
        <h2 className="text-3xl md:text-5xl font-bold mb-4">Loved by businesses worldwide</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          See how businesses of all sizes are transforming their customer engagement with ZapTick.
        </p>
      </div>

      <div className="relative">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {testimonials.map((testimonial, index) => (
              <div key={index} className="min-w-full px-4">
                <Card className="p-8 md:p-10 bg-white wark:bg-gray-800 shadow-lg border-none">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="md:w-1/3">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 relative rounded-full overflow-hidden">
                          <Image
                            src={testimonial.image}
                            alt={testimonial.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">{testimonial.name}</h3>
                          <p className="text-muted-foreground text-sm">{testimonial.role}</p>
                          <p className="text-sm font-medium">{testimonial.company}</p>
                        </div>
                      </div>
                      <div className="flex mb-6">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <div className="grid grid-cols-1 gap-4 mb-6">
                        {Object.entries(testimonial.metrics).map(([key, value], i) => (
                          <div key={i} className="bg-gray-50 wark:bg-gray-700 rounded-lg p-3">
                            <div className="flex justify-between items-center">
                              <p className="text-sm text-muted-foreground capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </p>
                              <p className={`text-sm font-bold ${
                                value.startsWith('+') ? 'text-green-500' :
                                value.startsWith('-') ? 'text-blue-500' :
                                'text-gray-700 wark:text-gray-300'
                              }`}>
                                {value}
                              </p>
                            </div>
                            <div className="h-1.5 bg-gray-200 wark:bg-gray-600 rounded-full mt-2">
                              <motion.div
                                className={`h-full rounded-full ${
                                  value.startsWith('+') ? 'bg-green-500' :
                                  value.startsWith('-') ? 'bg-blue-500' :
                                  'bg-gray-700'
                                }`}
                                initial={{ width: "0%" }}
                                animate={inView ? { width: `${parseInt(value.replace(/[^0-9]/g, ''))}%` } : { width: "0%" }}
                                transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="md:w-2/3 relative">
                      <Quote className="absolute top-0 left-0 h-10 w-10 text-emerald-100 wark:text-emerald-900/50" />
                      <div className="md:pl-12 pt-12 md:pt-0">
                        <p className="text-lg md:text-xl leading-relaxed mb-6">
                          &quot;{testimonial.content}&quot;
                        </p>
                        <div className="flex gap-4">
                          <Button variant="outline" size="sm">Read Case Study</Button>
                          <Button size="sm" className="bg-emerald-50 text-emerald-700 wark:bg-emerald-900/50 wark:text-emerald-300 hover:bg-emerald-100 wark:hover:bg-emerald-900/70">
                            Watch Video
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-8 gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`w-2.5 h-2.5 rounded-full ${
                index === activeIndex ? 'bg-emerald-500' : 'bg-gray-300 wark:bg-gray-700'
              }`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        <button
          className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 md:-translate-x-0 bg-white wark:bg-gray-800 shadow-lg p-2 rounded-full z-10"
          onClick={prevTestimonial}
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 md:translate-x-0 bg-white wark:bg-gray-800 shadow-lg p-2 rounded-full z-10"
          onClick={nextTestimonial}
          aria-label="Next testimonial"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Brands using the product */}
      <div className="mt-20">
        <h3 className="text-center text-xl font-bold mb-10">Trusted by innovative companies</h3>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
        {[
            "/brands/brand1.svg",
            "/brands/brand2.svg",
            "/brands/brand3.svg",
            "/brands/brand4.svg",
            "/brands/brand5.svg",
            "/brands/brand6.svg",
          ].map((logo, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Image
                src={logo}
                alt="Brand logo"
                width={120}
                height={40}
                className="opacity-70 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
