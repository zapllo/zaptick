"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link, Loader2 } from "lucide-react";

export default function ManualWabaConnect() {
  const [wabaId, setWabaId] = useState('');
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const { user } = useAuth();

  const handleConnect = async () => {
    if (!wabaId || !phoneNumberId || !user?.id) {
      alert('Please fill in WABA ID and Phone Number ID');
      return;
    }

    setIsConnecting(true);

    try {
      console.log('🔗 Connecting existing WABA manually...');

      const wabaData = {
        wabaId: wabaId.trim(),
        phoneNumberId: phoneNumberId.trim(),
        businessName: businessName.trim() || 'Manual Connection',
        userId: user.id
      };

      console.log('📤 Sending WABA data to Interakt:', wabaData);

      const response = await fetch('/api/interakt/tp-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wabaData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Manual WABA connection successful:', result);

        alert('WABA connection initiated! Interakt will process your account and send confirmation shortly.');

        // Clear form
        setWabaId('');
        setPhoneNumberId('');
        setBusinessName('');

        // Notify dashboard to refresh
        window.dispatchEvent(new CustomEvent('wabaSignupCompleted'));

        // Set pending state in localStorage
        localStorage.setItem(`waba_pending_${user.id}`, 'true');
        localStorage.setItem(`waba_pending_timestamp_${user.id}`, Date.now().toString());

        // Trigger signup started event for dashboard
        window.dispatchEvent(new CustomEvent('wabaSignupStarted'));

      } else {
        const error = await response.json();
        console.error('❌ Manual WABA connection failed:', error);
        alert(`Connection failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error connecting manual WABA:', error);
      alert('Connection failed. Please check your details and try again.');
    }

    setIsConnecting(false);
  };


  return (
    <Card className="group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-white to-blue-50/30  transition-all duration-300 hover:shadow-lg dark:from-muted/40 dark:to-blue-900/10">
      {/* Header */}
      <CardHeader className="text- pb-4 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/10">
        <div className="flex items-center justify-start gap-3 mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Link className="h-6 w-6 text-white" />
          </div>
          <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            Manual setup
          </div>
        </div>
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
          Connect Existing WABA
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300 text-sm">
          Already have a WhatsApp Business Account? Connect it directly using your existing credentials
        </CardDescription>
      </CardHeader>

      {/* Content */}
      <CardContent className="space-y-6 px-6">
        {/* Form Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wabaId" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              WABA ID <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="wabaId"
                placeholder="e.g., 123456789012345"
                value={wabaId}
                onChange={(e) => setWabaId(e.target.value)}
                className="pl-4 pr-10 h-11 border-2 focus:border-blue-500 rounded-lg transition-colors"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className={`h-2 w-2 rounded-full ${wabaId ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumberId" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone Number ID <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="phoneNumberId"
                placeholder="e.g., 987654321098765"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                className="pl-4 pr-10 h-11 border-2 focus:border-blue-500 rounded-lg transition-colors"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className={`h-2 w-2 rounded-full ${phoneNumberId ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Business Name <span className="text-gray-400">(Optional)</span>
            </Label>
            <div className="relative">
              <Input
                id="businessName"
                placeholder="Your Business Name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="pl-4 pr-10 h-11 border-2 focus:border-blue-500 rounded-lg transition-colors"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className={`h-2 w-2 rounded-full ${businessName ? 'bg-blue-500' : 'bg-gray-300'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="rounded-xl bg-blue-50/50 border border-blue-200 p-4 dark:bg-blue-900/10 dark:border-blue-800/50">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
              <span className="text-blue-600 dark:text-blue-400 text-sm">💡</span>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Where to find these IDs:
              </p>
              <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <p>1. Open <strong>Facebook Business Manager</strong></p>
                <p>2. Go to <strong>WhatsApp Accounts</strong></p>
                <p>3. Select your account</p>
                <p>4. View the WABA ID and Phone Number ID in account details</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 h-8 text-xs border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400"
                asChild
              >
                <a href="https://business.facebook.com/wa/manage/" target="_blank" rel="noopener noreferrer">
                  Open Business Manager
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Form validation status */}
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            <div className={`h-2 w-2 rounded-full ${wabaId && phoneNumberId ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className={`text-xs ${wabaId && phoneNumberId ? 'text-green-600' : 'text-gray-500'}`}>
              {wabaId && phoneNumberId ? 'Ready to connect' : 'Fill required fields'}
            </span>
          </div>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="pt-4 bg-gradient-to-r from-gray-50/50 to-transparent dark:from-gray-900/50">
        <div className="w-full space-y-3">
          <Button
            disabled={!wabaId || !phoneNumberId || !user?.id || isConnecting}
            onClick={handleConnect}
            className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            {isConnecting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Link className="h-4 w-4 mr-2" />
                <span>Connect WABA Account</span>
              </>
            )}
          </Button>
          
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-green-500/20 flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
              </div>
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-blue-500/20 flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              </div>
              <span>Instant</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-purple-500/20 flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
              </div>
              <span>Existing account</span>
            </div>
          </div>
        </div>
      </CardFooter>

      {/* Decorative elements */}
      <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-blue-500/10 transition-all duration-300 group-hover:scale-110" />
      <div className="absolute -left-4 -bottom-4 h-12 w-12 rounded-full bg-blue-500/5" />
      
      {/* Hover overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </Card>
  );

}
