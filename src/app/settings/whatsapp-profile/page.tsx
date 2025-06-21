"use client";

import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function BusinessSettings() {
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const updateBusinessProfile = async () => {
    setIsLoading(true);
    setNotification({ type: null, message: "" });

    try {
      // Add "Powered by Zatick" to the description if not already present
      const finalDescription = description.includes("- Powered by Zaptick")
        ? description
        : `${description} Powered by Zaptick`.trim();

      // Make API call to update WhatsApp business profile
      const response = await fetch("/api/whatsapp/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          about: finalDescription,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update business profile");
      }

      await response.json();

      // Show success notification
      setNotification({
        type: "success",
        message: "Your WhatsApp business profile has been updated successfully."
      });

      // Update the description state with the finalized version
      setDescription(finalDescription);
    } catch (error) {
      console.error("Error updating profile:", error);
      // Show error notification
      setNotification({
        type: "error",
        message: "There was an error updating your business profile."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-10 px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Manage WhatsApp Business Profile</h1>
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
                <CardDescription>Manage how your business appears to customers on WhatsApp</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Business Logo */}
                <div className="space-y-2">
                  <Label htmlFor="businessLogo" className="text-sm font-medium">Business Logo</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="/placeholder-logo.jpg" alt="Business logo" />
                      <AvatarFallback className="bg-primary/10">ZAP</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="border rounded-md flex items-center justify-center p-4 hover:bg-accent cursor-pointer transition-colors">
                        <Upload size={18} className="mr-2 text-primary" />
                        <span className="text-sm">Upload new logo</span>
                        <Input id="businessLogo" type="file" accept="image/*" className="hidden" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">Recommended: Square image, at least 640x640px</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Business Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell customers about your business, products or services"
                    className="resize-none h-24"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={256}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum 256 characters | Your description will include "Powered by Zatick"
                  </p>
                </div>

                {/* Contact Information */}
                <div className="space-y-2">
                  <Label htmlFor="contactInfo" className="text-sm font-medium">Contact Information</Label>
                  <Input id="contactInfo" type="text" placeholder="Email, website or additional phone number" />
                </div>

                {/* Compliance Info */}
                <div className="space-y-2">
                  <Label htmlFor="complianceInfo" className="text-sm font-medium">Compliance Information</Label>
                  <Input id="complianceInfo" type="text" placeholder="Business registration or license number" />
                  <p className="text-xs text-muted-foreground">Required for catalog messaging and business verification</p>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  type="button"
                  className="w-full"
                  onClick={updateBusinessProfile}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="hidden lg:block">
            <Card className="border-0 shadow-md h-full">
              <CardHeader>
                <CardTitle className="text-base">Profile Preview</CardTitle>
                <CardDescription>How customers see your business</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center p-6">
                <div className="w-full">
                  <img
                    src='/waprofile.png'
                    alt="WhatsApp Profile Preview"
                    className="object-contain rounded-lg"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
