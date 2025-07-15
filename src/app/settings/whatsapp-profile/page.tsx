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
import { Upload, AlertCircle, CheckCircle2, Loader2, Share2, Search } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";

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
  const [selectedWaba, setSelectedWaba] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
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
      formData.append('type', 'image');
      formData.append('wabaId', primaryWaba.wabaId);

      console.log('Uploading profile picture...', {
        fileName: file.name,
        fileSize: file.size,
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

      // Now update the profile with the media ID for all accounts
      const profileUpdateResponse = await fetch("/api/whatsapp/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profilePictureHandle: uploadData.mediaId,
          // Don't send wabaId - update all accounts
        }),
      });

      if (!profileUpdateResponse.ok) {
        const errorData = await profileUpdateResponse.json();
        console.error('Profile update error:', errorData);
        throw new Error(errorData.error || 'Failed to update profile picture');
      }

      // Update local state with the new profile picture
      const previewUrl = uploadData.mediaUrl || URL.createObjectURL(file);
      setProfileData(prev => ({
        ...prev,
        profilePictureUrl: previewUrl
      }));

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

  return (
    <Layout>
      <div className="container mx-auto py-10 px-4 ">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">WhatsApp Business Profile</h1>
            <p className="text-muted-foreground mt-2">Manage how your business appears to customers on WhatsApp</p>
          </div>

        
        </div>

        <Separator className="mb-8" />

        {notification.type && (
          <Alert
            variant={notification.type === "success" ? "default" : "destructive"}
            className="mb-6"
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {notification.type === "success" ? "Success" : "Error"}
            </AlertTitle>
            <AlertDescription>
              {notification.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Card className="shadow-md border-0">
              <CardHeader>
                <CardTitle>Business Profile Settings</CardTitle>
                <CardDescription>
                  Configure your business information that appears to customers
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Business Logo */}
                {/* Business Logo */}
                <div className="space-y-2">
                  <Label htmlFor="businessLogo" className="text-sm font-medium">Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profileData.profilePictureUrl} alt="Business profile" />
                      <AvatarFallback className="bg-primary/10">
                        {profileData.businessDescription?.charAt(0).toUpperCase() || 'B'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <label htmlFor="businessLogo" className="cursor-pointer">
                        <div className="border rounded-md flex items-center justify-center p-4 hover:bg-accent transition-colors">
                          {isUploading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Upload size={18} className="mr-2 text-primary" />
                          )}
                          <span className="text-sm">
                            {isUploading ? 'Uploading...' : 'Upload new picture'}
                          </span>
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
                      <p className="text-xs text-muted-foreground mt-2">
                        JPEG or PNG, square image recommended, max 5MB
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Business Description */}
                <div className="space-y-2">
                  <Label htmlFor="about" className="text-sm font-medium">About Your Business</Label>
                  <Textarea
                    id="about"
                    placeholder="Tell customers about your business, products or services"
                    className="resize-none h-24"
                    value={profileData.about}
                    onChange={(e) => setProfileData(prev => ({ ...prev, about: e.target.value }))}
                    maxLength={256}
                  />
                  <p className="text-xs text-muted-foreground">
                    {profileData.about.length}/256 characters
                  </p>
                </div>

                {/* Business Category */}
                {/* Business Category */}
                <div className="space-y-2">
                  <Label htmlFor="businessCategory" className="text-sm font-medium">Business Category</Label>
                  <Select
                    value={profileData.businessCategory}
                    onValueChange={(value) => setProfileData(prev => ({ ...prev, businessCategory: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your business category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AUTO">Automotive</SelectItem>
                      <SelectItem value="BEAUTY">Beauty, Spa & Salon</SelectItem>
                      <SelectItem value="APPAREL">Clothing & Apparel</SelectItem>
                      <SelectItem value="EDU">Education</SelectItem>
                      <SelectItem value="ENTERTAIN">Entertainment</SelectItem>
                      <SelectItem value="EVENT_PLAN">Event Planning</SelectItem>
                      <SelectItem value="FINANCE">Finance & Banking</SelectItem>
                      <SelectItem value="GROCERY">Food & Grocery</SelectItem>
                      <SelectItem value="GOVT">Government & Public Service</SelectItem>
                      <SelectItem value="HOTEL">Hotel & Lodging</SelectItem>
                      <SelectItem value="HEALTH">Medical & Health</SelectItem>
                      <SelectItem value="NONPROFIT">Non-Profit</SelectItem>
                      <SelectItem value="PROF_SERVICES">Professional Services</SelectItem>
                      <SelectItem value="RETAIL">Shopping & Retail</SelectItem>
                      <SelectItem value="TRAVEL">Travel & Transportation</SelectItem>
                      <SelectItem value="RESTAURANT">Restaurant</SelectItem>
                      <SelectItem value="ALCOHOL">Alcohol</SelectItem>
                      <SelectItem value="ONLINE_GAMBLING">Online Gambling</SelectItem>
                      <SelectItem value="PHYSICAL_GAMBLING">Physical Gambling</SelectItem>
                      <SelectItem value="OTC_DRUGS">Over-the-Counter Drugs</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Contact Information */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Business Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="business@example.com"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-sm font-medium">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://example.com"
                      value={profileData.website}
                      onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium">Business Address</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter your business address"
                      className="resize-none h-20"
                      value={profileData.address}
                      onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Business Description (for verification) */}
                <div className="space-y-2">
                  <Label htmlFor="businessDescription" className="text-sm font-medium">
                    Business Description (for verification)
                  </Label>
                  <Textarea
                    id="businessDescription"
                    placeholder="Detailed description of your business for verification purposes"
                    className="resize-none h-20"
                    value={profileData.businessDescription}
                    onChange={(e) => setProfileData(prev => ({ ...prev, businessDescription: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    This helps WhatsApp verify your business and may not be visible to customers
                  </p>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="button"
                  className="w-full"
                  onClick={updateBusinessProfile}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating Profile...
                    </>
                  ) : (
                    'Update WhatsApp Profile'
                  )}
                </Button>

               
              </CardFooter>
            </Card>
          </div>

          {/* Preview Section */}
          <div className="grid grid-cols-1  -mt-28">
            {/* Settings Card */}
            <div>{/* (unchanged settings form code) */}</div>

            {/* ===== Redesigned Preview Section ===== */}
            <div className="hidden lg:block ">
              <Card className="border-0 shadow-md h-full">
                <CardHeader>
                  <CardTitle className="text-base">Profile Preview</CardTitle>
                  <CardDescription>
                    How customers will see your business
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col items-center justify-center p-6 space-y-6">
                  {/* Phone Mockup */}
                  <div className="w-full max-w-sm mx-auto rounded-2xl p-2 overflow-hidden shadow-lg bg-[#0d0d0d] text-white">
                    {/* Top Section – avatar, name, phone */}
                    <div className="flex flex-col items-center pt-24 pb-6 border-b border-[#1f1f1f]">
                      <Avatar className="h-24 w-24 mb-3 border-2 border-[#2d2d2d]">
                        <AvatarImage
                          src={profileData.profilePictureUrl}
                          alt="Business profile"
                        />
                        <AvatarFallback className="bg-green-800/20 text-green-400 text-2xl">
                          {profileData.businessDescription?.charAt(0).toUpperCase() ||
                            "B"}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="flex items-center gap-1 font-semibold text-lg">
                        {profileData.businessDescription || "Your Business Name"}
                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      </h3>
                   
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex">
                      <button className="flex-1 flex flex-col items-center justify-center py-3 border-r border-[#1f1f1f] hover:bg-[#1a1a1a] transition-colors">
                        <Share2 className="h-4 w-4 mb-0.5" />
                        <span className="text-[11px] font-medium">Share</span>
                      </button>
                      <button className="flex-1 flex flex-col items-center justify-center py-3 hover:bg-[#1a1a1a] transition-colors">
                        <Search className="h-4 w-4 mb-0.5" />
                        <span className="text-[11px] font-medium">Search</span>
                      </button>
                    </div>

                    {/* Info Section */}
                    <div className="space-y-4 px-4 py-5">
                      {profileData.about && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-300">About</p>
                          <p className="text-sm text-gray-400 leading-snug">
                            {profileData.about}
                          </p>
                        </div>
                      )}

                      {profileData.businessCategory && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-300">Category</p>
                          <p className="text-sm text-gray-400 leading-snug">
                            {prettyCategory(profileData.businessCategory)}
                          </p>
                        </div>
                      )}

                      {profileData.email && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-300">Email</p>
                          <p className="text-sm text-blue-400 leading-snug break-all">
                            {profileData.email}
                          </p>
                        </div>
                      )}

                      {profileData.website && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-300">Website</p>
                          <p className="text-sm text-blue-400 leading-snug break-all">
                            {profileData.website}
                          </p>
                        </div>
                      )}

                      {profileData.address && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-300">Address</p>
                          <p className="text-sm text-gray-400 leading-snug whitespace-pre-line">
                            {profileData.address}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    This is how your business profile will appear to customers
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Important Notes</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Profile changes may take a few minutes to appear to customers</li>
                  <li>• Business verification may be required for certain features</li>
                  <li>• Profile picture should be square and at least 640x640 pixels</li>
                  <li>• Some fields may require WhatsApp approval for business accounts</li>
                  <li>• Changes apply to all connected WhatsApp Business accounts</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}