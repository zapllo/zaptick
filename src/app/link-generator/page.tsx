"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Zap,
  Phone,
  Settings,
  Globe,
  Share2,
  Link as LinkIcon,
  Smartphone,
  ArrowRight
} from "lucide-react";
import PartnerBadges from "@/components/ui/partner-badges";

export default function LinkGenerator() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);

  const generateLink = () => {
    if (!phoneNumber) return;

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanNumber = phoneNumber.replace(/\D/g, '');

    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${cleanNumber}${message ? `?text=${encodeURIComponent(message)}` : ''}`;

    setGeneratedLink(whatsappUrl);
  };

  const copyToClipboard = async () => {
    if (!generatedLink) return;

    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const openLink = () => {
    if (!generatedLink) return;
    window.open(generatedLink, '_blank');
  };

  return (
    <div className="bg-white overflow-hidden">
      <Header />

      {/* Hero Section */}
      <section className="relative mt-40 pb-16 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-100/40 via-purple-100/30 to-pink-100/40 rounded-full blur-3xl opacity-60" />
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 border border-blue-200/50"
              >
                <LinkIcon className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Free WhatsApp Link Generator</span>
              </motion.div>

              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
                  Create WhatsApp
                  <span className="relative inline-block ml-4">
                    <span className="relative z-10 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Chat Links
                    </span>
                    <motion.div
                      className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.8, duration: 1 }}
                    />
                  </span>
                  <br />
                  Effortlessly
                </h1>

                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                  Generate direct WhatsApp chat links with pre-filled messages. Perfect for customer support, marketing campaigns, and social media.
                </p>
              </div>

              <Badge className="px-4 py-2 bg-blue-50 text-blue-700 border-blue-200">
                <Sparkles className="h-4 w-4 mr-2" />
                100% Free • No Registration Required
              </Badge>
            </motion.div>
          </div>
        </div>
      </section>
 {/* Partner Badges */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="pt-6 flex justify-center"
            >
                <PartnerBadges animated={true} size="md" />
            </motion.div>
      {/* Link Generator Tool */}
      <section className="py-16 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="container mx-auto px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Input Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <Card className="p-8 shadow-xl border-0 bg-white">
                  <CardContent className="p-0 space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                        <Settings className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Configure Your Link</h3>
                        <p className="text-sm text-gray-600">Create your WhatsApp chat link</p>
                      </div>
                    </div>

                    {/* Phone Number Input */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-blue-600" />
                        WhatsApp Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="e.g., +1234567890"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="h-12 border-gray-300 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                      />
                      <p className="text-xs text-gray-500">Include country code (e.g., +1 for US, +91 for India)</p>
                    </div>

                    {/* Pre-filled Message */}
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                        Pre-filled Message (Optional)
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="Hello! I'm interested in your services..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="min-h-[120px] border-gray-300 focus-visible:ring-purple-500 focus-visible:border-purple-500"
                      />
                      <p className="text-xs text-gray-500">This message will appear when users click the link</p>
                    </div>

                    <Button
                      onClick={generateLink}
                      disabled={!phoneNumber}
                      className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all duration-300"
                    >
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-5 w-5" />
                        Generate WhatsApp Link
                      </div>
                    </Button>
                  </CardContent>
                </Card>

                {/* Use Cases */}
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200/50">
                  <CardContent className="p-0">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-600" />
                      Perfect For:
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        Customer support and helpdesk
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                        Marketing campaigns and promotions
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-pink-500 rounded-full"></div>
                        Social media bio links
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                        Website contact buttons
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Link Preview */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6"
              >
                <Card className="p-8 shadow-xl border-0 bg-white">
                  <CardContent className="p-0">
                    <div className="text-center space-y-6">
                      <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                          <Globe className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Your WhatsApp Link</h3>
                          <p className="text-sm text-gray-600">Ready to share and use</p>
                        </div>
                      </div>

                      {generatedLink ? (
                        <div className="space-y-6">
                          <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-100">
                            <div className="break-all text-sm text-gray-700 font-mono bg-white rounded-lg p-3 border">
                              {generatedLink}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                              onClick={copyToClipboard}
                              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/25"
                            >
                              {copied ? (
                                <>
                                  <Check className="mr-2 h-4 w-4" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Copy Link
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={openLink}
                              variant="outline"
                              className="flex-1 h-12 border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Test Link
                            </Button>
                          </div>

                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200/50">
                            <p className="text-sm text-gray-700 font-medium">
                              <span className="text-blue-700">✓</span> Link generated successfully!
                              Share it on your website, social media, or anywhere you want customers to reach you.
                            </p>
                          </div>

                          {/* Preview */}
                          <div className="border-t border-gray-200 pt-6">
                            <h4 className="font-semibold text-gray-900 mb-3 text-left">Link Preview:</h4>
                            <div className="bg-white border-2 border-gray-100 rounded-xl p-4 shadow-sm">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                    <MessageSquare className="h-6 w-6 text-white" />
                                  </div>
                                </div>
                                <div className="flex-1 text-left">
                                  <h5 className="font-semibold text-gray-900 mb-1">WhatsApp Chat</h5>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {phoneNumber ? `Chat with ${phoneNumber}` : 'Start a WhatsApp conversation'}
                                  </p>
                                  {message && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-sm text-gray-700">
                                      <span className="font-medium">Pre-filled message:</span> &quot;{message}&quot;
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-16 px-8 border-2 border-dashed border-gray-200 rounded-2xl">
                          <div className="text-center space-y-4">
                            <div className="flex justify-center">
                              <div className="h-24 w-24 bg-gray-100 rounded-2xl flex items-center justify-center">
                                <LinkIcon className="h-12 w-12 text-gray-400" />
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2">Link Preview</h4>
                              <p className="text-sm text-gray-500">
                                Enter your WhatsApp number and click &quot;Generate WhatsApp Link&quot; to see the preview
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Why Use WhatsApp Chat Links?</h2>
              <p className="text-lg text-gray-600">Streamline customer communication with direct links</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  title: "One-Click Access",
                  description: "Customers reach you instantly without saving numbers",
                  color: "blue"
                },
                {
                  icon: Share2,
                  title: "Easy Sharing",
                  description: "Share links on websites, social media, or emails",
                  color: "purple"
                },
                {
                  icon: MessageSquare,
                  title: "Custom Messages",
                  description: "Pre-fill conversations to guide customer interactions",
                  color: "pink"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="text-center p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50/30 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-${feature.color}-500 to-${feature.color}-600 shadow-lg mb-4`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-4 text-gray-900">How It Works</h2>
              <p className="text-lg text-gray-600">Create your WhatsApp link in three simple steps</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: 1,
                  title: "Enter Details",
                  description: "Add your WhatsApp number and optional message",
                  icon: Phone,
                  color: "blue"
                },
                {
                  step: 2,
                  title: "Generate Link",
                  description: "Click generate to create your custom WhatsApp link",
                  icon: LinkIcon,
                  color: "purple"
                },
                {
                  step: 3,
                  title: "Share & Use",
                  description: "Copy and share your link anywhere customers can find you",
                  icon: Share2,
                  color: "pink"
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  className="text-center relative"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                >
                  <div className="relative">
                    <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-${step.color}-500 to-${step.color}-600 shadow-lg text-white font-bold text-xl mb-6`}>
                      {step.step}
                    </div>

                    {index < 2 && (
                      <div className="hidden md:block absolute top-8 left-full w-full">
                        <ArrowRight className="h-6 w-6 text-gray-300 mx-auto" />
                      </div>
                    )}
                  </div>

                  <div className={`bg-gradient-to-br from-white to-${step.color}-50/30 rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300`}>
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-${step.color}-500 to-${step.color}-600 shadow-sm mb-4`}>
                      <step.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-8">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-4">Ready to Connect with Customers?</h2>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                  Need more advanced WhatsApp features? Explore Zaptick for complete business automation, analytics, and customer management.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="h-14 px-8 bg-white text-blue-700 hover:bg-gray-50 shadow-lg font-semibold"
                  >
                    Explore Zaptick Platform
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 border-white/30 text-black hover:bg-white/10"
                  >
                    Try QR Generator
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
