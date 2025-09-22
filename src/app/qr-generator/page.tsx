"use client";

import { useState, useRef } from "react";
import Image from "next/image";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    QrCode,
    Download,
    Copy,
    Check,
    Smartphone,
    MessageSquare,
    Sparkles,
    Zap,
    ArrowRight,
    Phone,
    User,
    Palette,
    Settings
} from "lucide-react";
import QRCode from "qrcode";
import PartnerBadges from "@/components/ui/partner-badges";

export default function QRGenerator() {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [message, setMessage] = useState("");
    const [qrSize, setQrSize] = useState("256");
    const [qrColor, setQrColor] = useState("#000000");
    const [bgColor, setBgColor] = useState("#ffffff");
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const generateQR = async () => {
        if (!phoneNumber) return;

        setIsGenerating(true);

        try {
            // Clean phone number (remove spaces, dashes, etc.)
            const cleanNumber = phoneNumber.replace(/\D/g, '');

            // Create WhatsApp URL
            const whatsappUrl = `https://wa.me/${cleanNumber}${message ? `?text=${encodeURIComponent(message)}` : ''}`;

            // Generate QR code
            const qrDataUrl = await QRCode.toDataURL(whatsappUrl, {
                width: parseInt(qrSize),
                color: {
                    dark: qrColor,
                    light: bgColor,
                },
                margin: 2,
            });

            setQrCodeDataUrl(qrDataUrl);
        } catch (error) {
            console.error('Error generating QR code:', error);
        }

        setIsGenerating(false);
    };

    const downloadQR = () => {
        if (!qrCodeDataUrl) return;

        const link = document.createElement('a');
        link.download = `whatsapp-qr-${phoneNumber}.png`;
        link.href = qrCodeDataUrl;
        link.click();
    };

    const copyToClipboard = async () => {
        if (!qrCodeDataUrl) return;

        try {
            const response = await fetch(qrCodeDataUrl);
            const blob = await response.blob();
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Error copying to clipboard:', error);
        }
    };

    return (
        <div className="bg-white overflow-hidden">
            <Header />

            {/* Hero Section */}
            <section className="relative mt-40 pb-16 overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-green-100/40 via-blue-100/30 to-purple-100/40 rounded-full blur-3xl opacity-60" />
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />
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
                                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-green-50 to-blue-50 px-4 py-2 border border-green-200/50"
                            >
                                <QrCode className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-green-700">Free WhatsApp QR Generator</span>
                            </motion.div>

                            <div className="space-y-6">
                                <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
                                    Generate WhatsApp
                                    <span className="relative inline-block ml-4">
                                        <span className="relative z-10 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                                            QR Codes
                                        </span>
                                        <motion.div
                                            className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-green-200 to-blue-200 rounded-full"
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: 1 }}
                                            transition={{ delay: 0.8, duration: 1 }}
                                        />
                                    </span>
                                    <br />
                                    Instantly
                                </h1>

                                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                                    Create custom QR codes that instantly open WhatsApp conversations with your business. Perfect for marketing materials, business cards, and customer support.
                                </p>
                            </div>

                            <Badge className="px-4 py-2 bg-green-50 text-green-700 border-green-200">
                                <Sparkles className="h-4 w-4 mr-2" />
                                100% Free • No Sign-up Required
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
            {/* QR Generator Tool */}
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
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                                                <Settings className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">Configure Your QR Code</h3>
                                                <p className="text-sm text-gray-600">Customize your WhatsApp QR code</p>
                                            </div>
                                        </div>

                                        {/* Phone Number Input */}
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-green-600" />
                                                WhatsApp Number
                                            </Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                placeholder="e.g., +1234567890"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                className="h-12 border-gray-300 focus-visible:ring-green-500 focus-visible:border-green-500"
                                            />
                                            <p className="text-xs text-gray-500">Include country code (e.g., +1 for US, +91 for India)</p>
                                        </div>

                                        {/* Pre-filled Message */}
                                        <div className="space-y-2">
                                            <Label htmlFor="message" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                <MessageSquare className="h-4 w-4 text-blue-600" />
                                                Pre-filled Message (Optional)
                                            </Label>
                                            <Textarea
                                                id="message"
                                                placeholder="Hi! I'd like to know more about your services..."
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                className="min-h-[100px] border-gray-300 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                                            />
                                            <p className="text-xs text-gray-500">This message will appear when users scan the QR code</p>
                                        </div>

                                        {/* Customization Options */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold text-gray-700">QR Size</Label>
                                                <Select value={qrSize} onValueChange={setQrSize}>
                                                    <SelectTrigger className="h-12">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="128">Small (128px)</SelectItem>
                                                        <SelectItem value="256">Medium (256px)</SelectItem>
                                                        <SelectItem value="512">Large (512px)</SelectItem>
                                                        <SelectItem value="1024">Extra Large (1024px)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <Palette className="h-4 w-4 text-purple-600" />
                                                    QR Color
                                                </Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="color"
                                                        value={qrColor}
                                                        onChange={(e) => setQrColor(e.target.value)}
                                                        className="h-12 w-16 p-1 border-gray-300"
                                                    />
                                                    <Input
                                                        type="text"
                                                        value={qrColor}
                                                        onChange={(e) => setQrColor(e.target.value)}
                                                        className="h-12 flex-1 border-gray-300"
                                                        placeholder="#000000"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={generateQR}
                                            disabled={!phoneNumber || isGenerating}
                                            className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-green-500/25 transition-all duration-300"
                                        >
                                            {isGenerating ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Generating...
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <QrCode className="h-5 w-5" />
                                                    Generate QR Code
                                                </div>
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* QR Code Preview */}
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
                                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                                                    <Smartphone className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900">Your QR Code</h3>
                                                    <p className="text-sm text-gray-600">Ready to download and use</p>
                                                </div>
                                            </div>

                                            {qrCodeDataUrl ? (
                                                <div className="space-y-6">
                                                    <div className="flex justify-center">
                                                        <div className="p-4 bg-white rounded-2xl shadow-lg border-2 border-gray-100">
                                                            <Image
                                                                src={qrCodeDataUrl}
                                                                alt="WhatsApp QR Code"
                                                                width={parseInt(qrSize)}
                                                                height={parseInt(qrSize)}
                                                                className="rounded-lg"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row gap-3">
                                                        <Button
                                                            onClick={downloadQR}
                                                            className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-green-500/25"
                                                        >
                                                            <Download className="mr-2 h-4 w-4" />
                                                            Download PNG
                                                        </Button>
                                                        <Button
                                                            onClick={copyToClipboard}
                                                            variant="outline"
                                                            className="flex-1 h-12 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                                                        >
                                                            {copied ? (
                                                                <>
                                                                    <Check className="mr-2 h-4 w-4 text-green-600" />
                                                                    Copied!
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Copy className="mr-2 h-4 w-4" />
                                                                    Copy Image
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>

                                                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200/50">
                                                        <p className="text-sm text-gray-700 font-medium">
                                                            <span className="text-green-700">✓</span> QR code generated successfully!
                                                            Share it on your marketing materials, business cards, or anywhere customers can scan it.
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="py-16 px-8 border-2 border-dashed border-gray-200 rounded-2xl">
                                                    <div className="text-center space-y-4">
                                                        <div className="flex justify-center">
                                                            <div className="h-24 w-24 bg-gray-100 rounded-2xl flex items-center justify-center">
                                                                <QrCode className="h-12 w-12 text-gray-400" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-gray-900 mb-2">QR Code Preview</h4>
                                                            <p className="text-sm text-gray-500">
                                                                Enter your WhatsApp number and click &quot;Generate QR Code&quot; to see the preview
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
                            <h2 className="text-3xl font-bold mb-4 text-gray-900">Why Use WhatsApp QR Codes?</h2>
                            <p className="text-lg text-gray-600">Make it easier for customers to connect with your business</p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: Zap,
                                    title: "Instant Connection",
                                    description: "Customers can start chatting with one simple scan",
                                    color: "green"
                                },
                                {
                                    icon: MessageSquare,
                                    title: "Pre-filled Messages",
                                    description: "Include custom messages to guide conversations",
                                    color: "blue"
                                },
                                {
                                    icon: Smartphone,
                                    title: "Mobile Optimized",
                                    description: "Works perfectly on all smartphones and devices",
                                    color: "purple"
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

            <Footer />
        </div>
    );
}
