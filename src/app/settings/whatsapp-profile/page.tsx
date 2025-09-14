"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Upload,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Share2,
  Search,
  Phone,
  Mail,
  Globe,
  MapPin,
  Building2,
  Camera,
  Info,
  Sparkles,
  Zap,
  Check,
  ArrowRight,
  Settings,
  User,
  MessageCircle,
  Video,
  MoreVertical,
  ExternalLink,
  CheckCircle,
  Crown,
  Star
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { FaWhatsapp } from "react-icons/fa";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ProfileData {
  about: string;
  profilePictureUrl: string;
  email: string;
  website: string;
  address: string;
  businessCategory: string;
  businessDescription: string;
  wabaAccounts: Array<{
    wabaId: string;
    businessName: string;
    phoneNumberId: string;
    phoneNumber: string;
    lastSyncAt: string;
  }>;
}

export default function WhatsAppProfileSettings() {
  const [profileData, setProfileData] = useState<ProfileData>({
    about: '',
    profilePictureUrl: '',
    email: '',
    website: '',
    address: '',
    businessCategory: '',
    businessDescription: '',
    wabaAccounts: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [activeField, setActiveField] = useState<string | null>(null);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const { toast } = useToast();


  // Load profile data and user's WABA accounts on mount
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      // Get user's WABA accounts
      const userResponse = await fetch('/api/auth/me');
      if (!userResponse.ok) {
        throw new Error('Failed to load user data');
      }
      const userData = await userResponse.json();

      // Get profile data
      const profileResponse = await fetch('/api/whatsapp/profile');
      if (!profileResponse.ok) {
        throw new Error('Failed to load profile data');
      }
      const profileData = await profileResponse.json();

      // Combine user's WABA accounts with profile data
      setProfileData({
        ...profileData.profile,
        wabaAccounts: userData.user.wabaAccounts || []
      });

      console.log('Loaded profile data:', {
        wabaAccounts: userData.user.wabaAccounts?.length || 0,
        profileData: profileData.profile
      });

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    }
  };

  const updateBusinessProfile = async () => {
    if (!profileData.wabaAccounts || profileData.wabaAccounts.length === 0) {
      toast({
        title: "No WhatsApp Account",
        description: "Please connect a WhatsApp Business account first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setNotification({ type: null, message: "" });

    try {
      // Add "Powered by Zaptick" to the description if not already present
      const finalDescription = profileData.about.includes("Powered by Zaptick")
        ? profileData.about
        : `${profileData.about} - Powered by Zaptick`.trim();

      const response = await fetch("/api/whatsapp/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...profileData,
          about: finalDescription,
          // Don't send wabaId - let the backend handle all user's accounts
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update business profile");
      }

      const result = await response.json();

      // Update local state
      setProfileData(prev => ({
        ...prev,
        about: finalDescription
      }));

      setNotification({
        type: "success",
        message: `Your WhatsApp business profile has been updated successfully across ${profileData.wabaAccounts.length} account(s).`
      });

      toast({
        title: "Success",
        description: `Profile updated for ${profileData.wabaAccounts.length} WhatsApp account(s)`,
      });

    } catch (error) {
      console.error("Error updating profile:", error);
      setNotification({
        type: "error",
        message: error instanceof Error ? error.message : "There was an error updating your business profile."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset the input value so the same file can be selected again
    event.target.value = '';

    if (!profileData.wabaAccounts || profileData.wabaAccounts.length === 0) {
      toast({
        title: "No WhatsApp Account",
        description: "Please connect a WhatsApp Business account first",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      toast({
        title: "Invalid file type",
        description: "Please select a JPEG or PNG image",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Use the first WABA account for upload
      const primaryWaba = profileData.wabaAccounts[0];

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'profile_picture');
      formData.append('wabaId', primaryWaba.wabaId);

      console.log('Uploading profile picture...', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        wabaId: primaryWaba.wabaId
      });

      const uploadResponse = await fetch('/api/upload-profile', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        console.error('Upload error:', errorData);
        throw new Error(errorData.error || 'Failed to upload profile picture');
      }

      const uploadData = await uploadResponse.json();
      console.log('Media uploaded successfully:', uploadData);

      // Update local state with the S3 URL immediately
      setProfileData(prev => ({
        ...prev,
        profilePictureUrl: uploadData.s3Url
      }));

      // Now update the WhatsApp profile with the media handle for all accounts
      const profileUpdateResponse = await fetch("/api/whatsapp/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profilePictureHandle: uploadData.mediaHandle,
          // Don't send wabaId - update all accounts
        }),
      });

      if (!profileUpdateResponse.ok) {
        const errorData = await profileUpdateResponse.json();
        console.error('Profile update error:', errorData);
        throw new Error(errorData.error || 'Failed to update profile picture');
      }

      toast({
        title: "Success",
        description: `Profile picture updated for ${profileData.wabaAccounts.length} WhatsApp account(s)`,
      });

    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Utility to prettify the category
  const prettyCategory = (raw: string) =>
    raw
      .replace(/_/g, " ")
      .toLowerCase()
      .split(" ")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const businessCategories = [
    { value: "AUTO", label: "🚗 Automotive" },
    { value: "BEAUTY", label: "💄 Beauty, Spa & Salon" },
    { value: "APPAREL", label: "👔 Clothing & Apparel" },
    { value: "EDU", label: "📚 Education" },
    { value: "ENTERTAIN", label: "🎭 Entertainment" },
    { value: "EVENT_PLAN", label: "🎉 Event Planning" },
    { value: "FINANCE", label: "💰 Finance & Banking" },
    { value: "GROCERY", label: "🛒 Food & Grocery" },
    { value: "GOVT", label: "🏛️ Government & Public Service" },
    { value: "HOTEL", label: "🏨 Hotel & Lodging" },
    { value: "HEALTH", label: "🏥 Medical & Health" },
    { value: "NONPROFIT", label: "❤️ Non-Profit" },
    { value: "PROF_SERVICES", label: "💼 Professional Services" },
    { value: "RETAIL", label: "🛍️ Shopping & Retail" },
    { value: "TRAVEL", label: "✈️ Travel & Transportation" },
    { value: "RESTAURANT", label: "🍽️ Restaurant" },
    { value: "OTHER", label: "📦 Other" },
  ];
  // Add this function to handle verification payment
  const handleVerificationPayment = async () => {
    setShowVerificationDialog(false);
    setVerificationLoading(true);
    try {
      const amount = 25000; // ₹25,000

      // Create Razorpay order
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Razorpay expects amount in paise
          currency: 'INR',
          receipt: `verification_${Date.now()}`,
          notes: {
            service: 'whatsapp_verification',
            amount: amount,
            description: 'WhatsApp Business Account Verification Service'
          }
        }),
      });

      const { orderId } = await orderResponse.json();

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: 'INR',
        name: 'Zaptick',
        description: 'WhatsApp Business Account Verification Service',
        order_id: orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyResult = await verifyResponse.json();

            if (verifyResult.success) {
              // Record the verification purchase
              await fetch('/api/verification/purchase', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  payment_id: response.razorpay_payment_id,
                  order_id: response.razorpay_order_id,
                  amount: amount,
                  service: 'whatsapp_verification'
                }),
              });

              toast({
                title: "Payment Successful!",
                description: "Your verification request has been submitted. Our team will contact you within 24 hours.",
              });

              setShowVerificationDialog(false);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast({
              title: "Payment Error",
              description: "There was an issue verifying your payment. Please contact support.",
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: 'Customer',
          email: 'customer@example.com',
        },
        theme: {
          color: '#1D4B3E',
        },
        modal: {
          ondismiss: function () {
            setVerificationLoading(false);
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Verification payment error:', error);
      toast({
        title: "Error",
        description: "Failed to initiate verification payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setVerificationLoading(false);
    }
  };
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 wark:from-gray-900 wark:via-gray-800 wark:to-gray-900">
        <div className=" mx-auto p-6">
          {/* Header Section */}
          <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-r from-green-50 via-white to-emerald-50 p-8 shadow-sm mb-8 wark:from-green-900/10 wark:via-gray-800 wark:to-emerald-900/10">
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                  <FaWhatsapp className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 wark:text-white mb-2">
                    WhatsApp Business Profile
                  </h1>
                  <p className="text-gray-600 wark:text-gray-300">
                    Manage how your business appears to customers on WhatsApp
                  </p>
                  {profileData.wabaAccounts.length > 0 && (
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="secondary" className="bg-green-100 text-green-800 wark:bg-green-900/30 wark:text-green-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2 animate-pulse" />
                        {profileData.wabaAccounts.length} account(s) connected
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-600 wark:text-gray-300">Live Preview</span>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-green-500/5" />
            <div className="absolute -right-4 -bottom-4 h-20 w-20 rounded-full bg-green-500/10" />
          </div>
 {/* Connected Accounts Section */}
          {profileData.wabaAccounts.length > 0 && (
            <Card className="mt-8 mb-8 border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 wark:from-green-900/20 wark:to-emerald-900/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                    <FaWhatsapp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-green-900 wark:text-green-200">
                      Connected WhatsApp Accounts
                    </CardTitle>
                    <CardDescription className="text-green-700 wark:text-green-300">
                      Profile updates will apply to all connected accounts
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profileData.wabaAccounts.map((account, index) => (
                    <div
                      key={account.wabaId}
                      className="flex items-center justify-between p-4 bg-white/60 wark:bg-gray-800/60 rounded-xl border border-green-200/50 wark:border-green-700/50 transition-all duration-200 hover:bg-white/80 wark:hover:bg-gray-800/80"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10">
                          <Phone className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-green-900 wark:text-green-200">
                            {account.businessName || `Business Account ${index + 1}`}
                          </p>
                          <p className="text-sm text-green-700 wark:text-green-300 font-mono">
                            {account.phoneNumber}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 wark:bg-green-900/30 wark:text-green-400 wark:border-green-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                        Active
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {/* Notification */}
          {notification.type && (
            <div className="mb-6 animate-in slide-in-from-top-2 duration-300">
              <Alert
                variant={notification.type === "success" ? "default" : "destructive"}
                className="border-l-4 border-l-green-500 bg-green-50 wark:bg-green-900/20"
              >
                {notification.type === "success" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <AlertTitle className="text-green-800 wark:text-green-200">
                  {notification.type === "success" ? "Success!" : "Error"}
                </AlertTitle>
                <AlertDescription className="text-green-700 wark:text-green-300">
                  {notification.message}
                </AlertDescription>
              </Alert>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Settings Form */}
            <div className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm wark:bg-gray-800/80">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10">
                      <Settings className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Profile Settings</CardTitle>
                      <CardDescription>
                        Configure your business information
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-8">
                  {/* Profile Picture Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-primary" />
                      <Label className="text-sm font-semibold">Profile Picture</Label>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="relative group">
                        <Avatar className="h-24 w-24 border-4 border-white shadow-lg transition-all duration-300 group-hover:scale-105">
                          <AvatarImage src={profileData.profilePictureUrl} alt="Business profile" />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-2xl font-bold">
                            {profileData.businessDescription?.charAt(0).toUpperCase() || 'B'}
                          </AvatarFallback>
                        </Avatar>
                        {isUploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-3">
                        <label htmlFor="businessLogo" className="cursor-pointer">
                          <div className="group relative overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-4 transition-all duration-300 hover:border-primary hover:bg-primary/5 wark:border-gray-700 wark:bg-gray-800">
                            <div className="flex items-center justify-center gap-3 text-gray-600 wark:text-gray-300">
                              {isUploading ? (
                                <>
                                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                  <span className="font-medium">Uploading...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="h-5 w-5 text-primary" />
                                  <span className="font-medium">Upload new picture</span>
                                </>
                              )}
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                        </label>
                        <Input
                          id="businessLogo"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          className="hidden"
                          onChange={handleProfilePictureUpload}
                          disabled={isUploading}
                        />
                        <p className="text-xs text-gray-500 wark:text-gray-400">
                          JPEG or PNG, square image recommended, max 5MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                  {/* Business About */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-primary" />
                      <Label className="text-sm font-semibold">About Your Business</Label>
                    </div>
                    <div className="relative">
                      <Textarea
                        placeholder="Tell customers about your business, products or services..."
                        className={`resize-none h-24 transition-all duration-300 ${activeField === 'about' ? 'ring-2 ring-primary/20 border-primary' : ''
                          }`}
                        value={profileData.about}
                        onChange={(e) => setProfileData(prev => ({ ...prev, about: e.target.value }))}
                        onFocus={() => setActiveField('about')}
                        onBlur={() => setActiveField(null)}
                        maxLength={256}
                      />
                      <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                        {profileData.about.length}/256
                      </div>
                    </div>
                  </div>

                  {/* Business Category */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <Label className="text-sm font-semibold">Business Category</Label>
                    </div>
                    <Select
                      value={profileData.businessCategory}
                      onValueChange={(value) => setProfileData(prev => ({ ...prev, businessCategory: value }))}
                    >
                      <SelectTrigger className="h-12 transition-all duration-300 hover:border-primary/50">
                        <SelectValue placeholder="Select your business category" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {businessCategories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Contact Information Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        <Label className="text-sm font-semibold">Business Email</Label>
                      </div>
                      <Input
                        type="email"
                        placeholder="business@example.com"
                        className={`h-12 transition-all duration-300 ${activeField === 'email' ? 'ring-2 ring-primary/20 border-primary' : ''
                          }`}
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        onFocus={() => setActiveField('email')}
                        onBlur={() => setActiveField(null)}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" />
                        <Label className="text-sm font-semibold">Website</Label>
                      </div>
                      <Input
                        type="url"
                        placeholder="https://example.com"
                        className={`h-12 transition-all duration-300 ${activeField === 'website' ? 'ring-2 ring-primary/20 border-primary' : ''
                          }`}
                        value={profileData.website}
                        onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                        onFocus={() => setActiveField('website')}
                        onBlur={() => setActiveField(null)}
                      />
                    </div>
                  </div>

                  {/* Business Address */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <Label className="text-sm font-semibold">Business Address</Label>
                    </div>
                    <Textarea
                      placeholder="Enter your business address"
                      className={`resize-none h-20 transition-all duration-300 ${activeField === 'address' ? 'ring-2 ring-primary/20 border-primary' : ''
                        }`}
                      value={profileData.address}
                      onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                      onFocus={() => setActiveField('address')}
                      onBlur={() => setActiveField(null)}
                    />
                  </div>

                  {/* Business Description */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <Label className="text-sm font-semibold">Business Name</Label>
                    </div>
                    <Input
                      placeholder="Your business name"
                      className={`h-12 transition-all duration-300 ${activeField === 'businessDescription' ? 'ring-2 ring-primary/20 border-primary' : ''
                        }`}
                      value={profileData.businessDescription}
                      onChange={(e) => setProfileData(prev => ({ ...prev, businessDescription: e.target.value }))}
                      onFocus={() => setActiveField('businessDescription')}
                      onBlur={() => setActiveField(null)}
                    />
                  </div>
                </CardContent>

                <CardFooter className="pt-6">
                  <Button
                    onClick={updateBusinessProfile}
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Updating Profile...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-5 w-5" />
                        Update WhatsApp Profile
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Enhanced WhatsApp Preview */}
            <div className="relative">
              <div className="sticky top-8">
                <Card className="border-0 shadow-2xl h-full bg-white/80 backdrop-blur-sm wark:bg-gray-800/80 overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/10">
                        <FaWhatsapp className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Live Preview</CardTitle>
                        <CardDescription>
                          How customers will see your business
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex justify-center p-6">
                    {/* Enhanced Phone Mockup */}
                    <div className="relative">
                      {/* Phone Frame */}
                      <div className="relative w-80 h-[620px] bg-black rounded-[2.5rem] p-2 shadow-2xl">
                        {/* Screen */}
                        <div className="w-full h-full bg-[#ffffff] rounded-[2rem] overflow-hidden relative">
                          {/* Status Bar */}
                          <div className="flex items-center justify-between px-6 py-3 text-black text-sm">
                            <div className="flex items-center gap-1">
                              <div className="w-1 h-1 bg-black rounded-full"></div>
                              <div className="w-1 h-1 bg-black rounded-full"></div>
                              <div className="w-1 h-1 bg-black/50 rounded-full"></div>
                            </div>

                            <div className="text-xs">
                              {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-6 h-3 border border-black rounded-sm">
                                <div className="w-4 h-1 bg-black rounded-full mt-0.5 ml-0.5"></div>
                              </div>
                              <div className="text-xs">100%</div>
                            </div>
                          </div>

                          {/* Header */}
                          <div className="flex items-center justify-between px-4 py-3 bg-[#ffffff] border-b border-gray-600">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                              <span className="text-green-600 text-sm font-medium">Business Info</span>
                            </div>
                            <MoreVertical className="h-5 w-5 text-gray-600" />
                          </div>

                          {/* Profile Content */}
                          <div className="px-4 py-6 space-y-6">
                            {/* Avatar and Name */}
                            <div className="flex flex-col items-center text-center space-y-4">
                              <div className="relative">
                                <Avatar className="h-20 w-20 border-3 border-green-600/30 shadow-lg">
                                  <AvatarImage
                                    src={profileData.profilePictureUrl}
                                    alt="Business profile"
                                  />
                                  <AvatarFallback className="bg-gradient-to-br from-green-600/20 to-green-600/20 text-green-600 text-2xl font-bold">
                                    {profileData.businessDescription?.charAt(0).toUpperCase() || "B"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6  rounded-full flex cursor-pointer items-center justify-center" onClick={() => setShowVerificationDialog(true)}>

                                  <img src='/icons/verified.png' className="object-fill w-full h-full animate-pulse 00" />
                                </div>
                                <div className="absolute top-[75px] -right-8 w-8 h-8 rounded-full flex cursor-pointer items-center justify-center" onClick={() => setShowVerificationDialog(true)}>
                                  <img
                                    src='/icons/finger.png'
                                    className="object-fill w-full h-full -rotate-[30deg] scale-125 animate-bounce"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <h3 className="text-black font-semibold text-lg">
                                  {profileData.businessDescription || "Your Business Name"}
                                </h3>
                                {profileData.wabaAccounts.length > 0 && (
                                  <p className="text-gray-400 text-sm font-mono">
                                    {profileData.wabaAccounts[0].phoneNumber || "+1 (555) 123-4567"}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                              <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white h-10 rounded-lg transition-all duration-200 hover:scale-105">
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Message
                              </Button>

                              <Button variant="outline" className="flex-1  h-10 rounded-lg transition-all duration-200 hover:scale-105">
                                <Phone className="h-4 w-4 mr-2" />
                                Call
                              </Button>
                              <Button variant="outline" className=" h-10 w-10 rounded-lg transition-all duration-200 hover:scale-105">
                                <Video className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Business Info */}
                            <div className="space-y-4">
                              {profileData.about && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Info className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-gray-800">About</span>
                                  </div>
                                  <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg">
                                    {profileData.about}
                                  </p>
                                </div>
                              )}

                              {profileData.businessCategory && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-gray-800">Category</span>
                                  </div>
                                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                    {businessCategories.find(c => c.value === profileData.businessCategory)?.label || prettyCategory(profileData.businessCategory)}
                                  </p>
                                </div>
                              )}

                              {profileData.email && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-gray-800">Email</span>
                                  </div>
                                  <p className="text-sm text-blue-600 bg-gray-50 p-3 rounded-lg break-all">
                                    {profileData.email}
                                  </p>
                                </div>
                              )}

                              {profileData.website && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-gray-800">Website</span>
                                  </div>
                                  <p className="text-sm text-blue-600 bg-gray-50 p-3 rounded-lg break-all">
                                    {profileData.website}
                                  </p>
                                </div>
                              )}

                              {profileData.address && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-gray-800">Address</span>
                                  </div>
                                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg whitespace-pre-line">
                                    {profileData.address}
                                  </p>
                                </div>
                              )}

                              {/* Empty State */}
                              {!profileData.about && !profileData.businessCategory && !profileData.email && !profileData.website && !profileData.address && (
                                <div className="text-center py-8 space-y-3">
                                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                                    <User className="h-8 w-8 text-gray-600" />
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-gray-600 text-sm">Complete your profile</p>
                                    <p className="text-gray-400 text-xs">Add business information to get started</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Phone Shadow */}
                      <div className="absolute inset-0 bg-black/20 rounded-[2.5rem] -z-10 transform translate-y-1"></div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-4 pb-6">
                    <div className="w-full text-center">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 wark:bg-green-900/20 wark:text-green-400 wark:border-green-800">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Real-time Preview
                      </Badge>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>

          <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
            <DialogContent className="m-auto h-fit max-h-screen overflow-y-scroll max-w-3xl w-full">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Crown className="h-6 w-6 text-amber-500" />
                  Get Your Business Verified
                </DialogTitle>
                <DialogDescription>
                  Professional WhatsApp Business verification service by our experts
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Pricing Section */}
                <div className="relative overflow-hidden rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-amber-500" />
                        <span className="font-semibold text-lg">Professional Verification Service</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">₹25,000</div>
                        <div className="text-sm text-gray-600">One-time fee</div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Complete documentation assistance</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Direct submission to Meta</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Expert guidance throughout the process</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>24/7 support until verification</span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <strong>Note:</strong> This is a professional service fee. The actual verification is done by Meta and typically takes 1-3 business days.
                    </div>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/10" />
                  <div className="absolute -left-4 -bottom-4 h-16 w-16 rounded-full bg-amber-500/10" />
                </div>

                {/* Benefits Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                      <h4 className="font-medium text-blue-900">Why get verified?</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Build customer trust with a verified badge</li>
                        <li>• Increase message delivery rates</li>
                        <li>• Access to advanced business features</li>
                        <li>• Professional appearance in chats</li>
                        <li>• Higher customer engagement rates</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Process Section */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Our verification process:</h4>
                  <ol className="text-sm text-gray-600 space-y-2">
                    <li className="flex gap-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">1</span>
                      <span>Payment confirmation and document collection</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">2</span>
                      <span>Expert review and preparation of your application</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">3</span>
                      <span>Direct submission to Meta for verification</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">4</span>
                      <span>Follow-up and status updates until completion</span>
                    </li>
                  </ol>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowVerificationDialog(false)}
                    className="flex-1"
                    disabled={verificationLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleVerificationPayment}
                    disabled={verificationLoading}
                    className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {verificationLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Pay ₹25,000 & Get Verified
                      </>
                    )}
                  </Button>
                </div>

                {/* Additional Info */}
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Secure payment powered by Razorpay • Money-back guarantee if verification fails due to our service
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Enhanced Help Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tips Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 wark:from-blue-900/20 wark:to-indigo-900/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                    <Info className="h-6 w-6 text-white" />
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-blue-900 wark:text-blue-200">
                      Profile Optimization Tips
                    </h4>
                    <ul className="text-sm text-blue-800 wark:text-blue-300 space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Use a clear, professional profile picture</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Write a compelling business description</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Include your website and contact information</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>Select the most relevant business category</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Notes Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 wark:from-amber-900/20 wark:to-orange-900/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg">
                    <AlertCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-amber-900 wark:text-amber-200">
                      Important Notes
                    </h4>
                    <ul className="text-sm text-amber-800 wark:text-amber-300 space-y-2">
                      <li className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <span>Profile changes may take a few minutes to appear</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <span>Business verification may be required for certain features</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <span>Changes apply to all connected WhatsApp accounts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ArrowRight className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <span>Profile picture should be square and at least 640x640px</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>


        </div>
      </div>
    </Layout>
  );
}
