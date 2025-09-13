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
import { Link, Loader2, ExternalLink, CheckCircle, AlertCircle, Info } from "lucide-react";

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

  const isFormValid = wabaId && phoneNumberId && user?.id;

  return (
    <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-white to-blue-50/30 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200 wark:from-muted/40 wark:to-blue-900/10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
          <Link className="h-6 w-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-medium text-blue-600 wark:text-blue-400">Manual Setup</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 wark:text-white">
            Connect Existing WABA
          </h3>
          <p className="text-sm text-slate-600 wark:text-slate-300">
            Use your existing WhatsApp Business Account credentials
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4 mb-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="wabaId" className="text-sm font-medium text-slate-700 wark:text-slate-200">
              WABA ID <span className="text-red-500">*</span>
            </Label>
            {wabaId && (
              <div className="flex items-center gap-1 text-xs text-green-600 wark:text-green-400">
                <CheckCircle className="h-3 w-3" />
                <span>Valid format</span>
              </div>
            )}
          </div>
          <div className="relative">
            <Input
              id="wabaId"
              placeholder="e.g., 123456789012345"
              value={wabaId}
              onChange={(e) => setWabaId(e.target.value)}
              className="bg-white wark:bg-slate-800 border-slate-300 wark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className={`h-2 w-2 rounded-full transition-colors ${wabaId ? 'bg-green-500' : 'bg-slate-300'}`} />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="phoneNumberId" className="text-sm font-medium text-slate-700 wark:text-slate-200">
              Phone Number ID <span className="text-red-500">*</span>
            </Label>
            {phoneNumberId && (
              <div className="flex items-center gap-1 text-xs text-green-600 wark:text-green-400">
                <CheckCircle className="h-3 w-3" />
                <span>Valid format</span>
              </div>
            )}
          </div>
          <div className="relative">
            <Input
              id="phoneNumberId"
              placeholder="e.g., 987654321098765"
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value)}
              className="bg-white wark:bg-slate-800 border-slate-300 wark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className={`h-2 w-2 rounded-full transition-colors ${phoneNumberId ? 'bg-green-500' : 'bg-slate-300'}`} />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="businessName" className="text-sm font-medium text-slate-700 wark:text-slate-200">
              Business Name <span className="text-slate-400 text-xs">(Optional)</span>
            </Label>
            {businessName && (
              <div className="flex items-center gap-1 text-xs text-blue-600 wark:text-blue-400">
                <CheckCircle className="h-3 w-3" />
                <span>Added</span>
              </div>
            )}
          </div>
          <div className="relative">
            <Input
              id="businessName"
              placeholder="Your Business Name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="bg-white wark:bg-slate-800 border-slate-300 wark:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20 transition-colors"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className={`h-2 w-2 rounded-full transition-colors ${businessName ? 'bg-blue-500' : 'bg-slate-300'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="group/help relative overflow-hidden rounded-lg border bg-gradient-to-br from-white to-slate-50/30 p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300 wark:from-slate-800/50 wark:to-slate-700/30 mb-6">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 wark:bg-blue-900/30 flex-shrink-0 group-hover/help:scale-110 transition-transform duration-200">
            <Info className="h-4 w-4 text-blue-600 wark:text-blue-400" />
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-900 wark:text-white">
              Where to find these IDs:
            </p>
            <ol className="text-sm text-slate-600 wark:text-slate-300 space-y-1 list-decimal pl-4">
              <li>Open <span className="font-medium text-slate-900 wark:text-white">Facebook Business Manager</span></li>
              <li>Navigate to <span className="font-medium text-slate-900 wark:text-white">WhatsApp Accounts</span></li>
              <li>Select your business account</li>
              <li>Find the WABA ID and Phone Number ID in account details</li>
            </ol>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 h-8 text-xs bg-white wark:bg-slate-800 hover:bg-slate-50 wark:hover:bg-slate-700 border-slate-300 wark:border-slate-600"
              asChild
            >
              <a href="https://business.facebook.com/wa/manage/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" />
                Open Business Manager
              </a>
            </Button>
          </div>
        </div>
        <div className="absolute -right-4 -top-4 h-8 w-8 rounded-full bg-blue-500/10 transition-all duration-300 group-hover/help:scale-110" />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 wark:bg-slate-800/50 border border-slate-200 wark:border-slate-700 mb-6">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full transition-colors ${isFormValid ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
          <span className={`text-sm transition-colors ${isFormValid ? 'text-green-600 wark:text-green-400' : 'text-slate-600 wark:text-slate-300'}`}>
            {isFormValid ? 'Ready to connect' : 'Fill required fields'}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 wark:text-slate-400">
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span>Instant</span>
          </div>
        </div>
      </div>

      {/* Connect Button */}
      <Button
        disabled={!isFormValid || isConnecting}
        onClick={handleConnect}
        className="w-full gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        size="lg"
      >
        {isConnecting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <Link className="h-4 w-4" />
            <span>Connect WABA Account</span>
          </>
        )}
      </Button>

      {/* Benefits Footer */}
      <div className="flex items-center justify-center gap-4 text-xs text-slate-600 wark:text-slate-400 mt-4 pt-4 border-t border-slate-200 wark:border-slate-700">
        <div className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-green-500" />
          <span>No data loss</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-blue-500" />
          <span>Keep existing setup</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-purple-500" />
          <span>Instant sync</span>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-blue-500/10 transition-all duration-300 group-hover:scale-110" />
    </div>
  );
}
