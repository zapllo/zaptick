"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Phone,
  Clock,
  CheckCircle2,
  ArrowRight,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const quickActions = [
    {
      title: "💬 Start WhatsApp Chat",
      description: "Chat with our team instantly",
      action: "chat",
      primary: true
    },
    {
      title: "🎯 Book a Demo",
      description: "See Zaptick in action",
      action: "demo",
      primary: false
    },
    {
      title: "📞 Call Us",
      description: "Speak directly with our experts",
      action: "call",
      primary: false
    },
    {
      title: "💡 Learn More",
      description: "Explore our features",
      action: "features",
      primary: false
    }
  ];

  const handleAction = (action: string) => {
    setShowSuccess(true);

    setTimeout(() => {
      let url = '';
      let message = '';

      switch (action) {
        case 'chat':
          message = "Hi Zaptick team! I'm interested in learning more about your WhatsApp Business solutions. Can you help me get started?";
          url = `https://wa.me/919836630366?text=${encodeURIComponent(message)}`;
          break;
        case 'demo':
          message = "Hi! I'd like to schedule a demo of Zaptick. What's the best time to connect?";
          url = `https://wa.me/919836630366?text=${encodeURIComponent(message)}`;
          break;
        case 'call':
          url = 'tel:+919836630366';
          break;
        case 'features':
          message = "Hi! I want to learn more about Zaptick's features and pricing. Can you share more details?";
          url = `https://wa.me/919836630366?text=${encodeURIComponent(message)}`;
          break;
        default:
          message = "Hi! I'm interested in Zaptick. Can you help me?";
          url = `https://wa.me/919836630366?text=${encodeURIComponent(message)}`;
      }

      window.open(url, '_blank');
      setShowSuccess(false);
      setIsOpen(false);
    }, 1500);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: "spring", stiffness: 260, damping: 20 }}
      >
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Pulse animation rings */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-ping opacity-20"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse opacity-30"></div>

          {/* Main button */}
          <div className="relative w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-2xl flex items-center justify-center group-hover:shadow-green-500/50 transition-all duration-300">
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 0 }}
                  exit={{ rotate: 180 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-7 h-7 text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="message"
                  initial={{ rotate: -180 }}
                  animate={{ rotate: 0 }}
                  exit={{ rotate: 180 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <FaWhatsapp className="w-7 h-7 text-white fill-current" />

                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Online Badge */}
          {/* <motion.div
            className="absolute -top-2 -left-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5 }}
          >
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1 font-medium shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
              Online
            </Badge>
          </motion.div> */}
        </motion.button>

        {/* Tooltip */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              transition={{ delay: 0.5 }}
              className="absolute right-20 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-xl"
            >
              Need help? Chat with us!
              <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-l-[6px] border-l-gray-900 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Chat Options Window */}
      <AnimatePresence>
        {isOpen && !showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed max-h-80 bottom-24 right-6 w-80 bg-white rounded-2xl shadow-2xl z-40 overflow-y-scroll border border-gray-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <FaWhatsapp className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-">Get in Touch</h3>
                    <div className="flex items-center gap-1 text-green-100 text-sm">
                      {/* <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" /> */}
                      {/* <span>Our team is online</span> */}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 space-y-3">
              {quickActions.map((item, index) => (
                <motion.div
                  key={item.action}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    variant={item.primary ? "default" : "outline"}
                    className={`w-full justify-between h-auto p-4 ${item.primary
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-md'
                        : 'hover:bg-green-50 hover:border-green-300'
                      }`}
                    onClick={() => handleAction(item.action)}
                  >
                    <div className="text-left">
                      <div className={`font-medium ${item.primary ? 'text-white' : 'text-gray-900'}`}>
                        {item.title}
                      </div>
                      <div className={`text-sm ${item.primary ? 'text-green-100' : 'text-gray-500'}`}>
                        {item.description}
                      </div>
                    </div>
                    <ArrowRight className={`w-4 h-4 ${item.primary ? 'text-white' : 'text-gray-400'}`} />
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 pb-4">
              <div className="bg-gradient-to-r from-gray-50 to-green-50/50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Response Time</p>
                    <p className="text-xs text-gray-600">
                      Average response: <span className="font-medium text-green-600">Under 5 minutes</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center mt-3">
                <p className="text-xs text-gray-500">
                  <Zap className="w-3 h-3 inline mr-1" />
                  Powered by Zaptick • Available 24/7
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Success Animation */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-24 right-6 w-80 bg-white rounded-2xl shadow-2xl z-40 overflow-hidden border border-gray-200"
          >
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle2 className="w-8 h-8 text-white" />
              </motion.div>

              <h3 className="font-bold text-lg text-gray-900 mb-2">Connecting...</h3>
              <p className="text-gray-600 text-sm">
                Opening WhatsApp chat with our team
              </p>

              <div className="flex items-center justify-center gap-1 mt-4">
                <motion.div
                  className="w-2 h-2 bg-green-500 rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 bg-green-500 rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 bg-green-500 rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WhatsAppWidget;
