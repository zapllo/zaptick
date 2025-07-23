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
    <Card className="group relative overflow-hidden rounded-xl border bg-card transition-all duration-300 hover:shadow-sm">
  {/* Header */}
  <CardHeader className="pb-4 border-b border-border/50 bg-gradient-to-r from-gray-50 to-transparent">
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm group-hover:shadow-md transition-all duration-300">
        <Link className="h-6 w-6 text-white" />
      </div>
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-medium text-blue-600">Manual setup</span>
        </div>
        <CardTitle className="text-lg font-semibold text-foreground">
          Connect Existing WABA
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Connect your WhatsApp Business Account using existing credentials
        </CardDescription>
      </div>
    </div>
  </CardHeader>

  {/* Content */}
  <CardContent className="p-6 space-y-6">
    {/* Form Fields */}
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="wabaId" className="text-xs text-muted-foreground">
            WABA ID <span className="text-destructive">*</span>
          </Label>
          {wabaId && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-green-100 text-green-700">
              Provided
            </span>
          )}
        </div>
        <div className="relative">
          <Input
            id="wabaId"
            placeholder="e.g., 123456789012345"
            value={wabaId}
            onChange={(e) => setWabaId(e.target.value)}
            className="h-10 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className={`h-1.5 w-1.5 rounded-full ${wabaId ? 'bg-green-500' : 'bg-gray-300'}`} />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="phoneNumberId" className="text-xs text-muted-foreground">
            Phone Number ID <span className="text-destructive">*</span>
          </Label>
          {phoneNumberId && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-green-100 text-green-700">
              Provided
            </span>
          )}
        </div>
        <div className="relative">
          <Input
            id="phoneNumberId"
            placeholder="e.g., 987654321098765"
            value={phoneNumberId}
            onChange={(e) => setPhoneNumberId(e.target.value)}
            className="h-10 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className={`h-1.5 w-1.5 rounded-full ${phoneNumberId ? 'bg-green-500' : 'bg-gray-300'}`} />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="businessName" className="text-xs text-muted-foreground">
            Business Name <span className="text-gray-400 text-xs">(Optional)</span>
          </Label>
          {businessName && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-blue-100 text-blue-700">
              Provided
            </span>
          )}
        </div>
        <div className="relative">
          <Input
            id="businessName"
            placeholder="Your Business Name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="h-10 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className={`h-1.5 w-1.5 rounded-full ${businessName ? 'bg-blue-500' : 'bg-gray-300'}`} />
          </div>
        </div>
      </div>
    </div>

    {/* Help Section */}
    <div className="rounded-lg bg-accent/30 border border-border/70 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 flex-shrink-0">
          <span className="text-blue-600 text-sm">💡</span>
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground">
            Where to find these IDs:
          </p>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal pl-4">
            <li>Open <span className="font-medium">Facebook Business Manager</span></li>
            <li>Go to <span className="font-medium">WhatsApp Accounts</span></li>
            <li>Select your account</li>
            <li>View the WABA ID and Phone Number ID in account details</li>
          </ol>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 h-7 text-xs border-border/80 text-foreground hover:bg-accent/50"
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
    <div className="flex items-center justify-between text-xs border-t pt-3 border-border/50">
      <div className="flex items-center gap-1.5">
        <div className={`h-2 w-2 rounded-full ${wabaId && phoneNumberId ? 'bg-green-500' : 'bg-gray-300'}`} />
        <span className={wabaId && phoneNumberId ? 'text-green-600' : 'text-muted-foreground'}>
          {wabaId && phoneNumberId ? 'Ready to connect' : 'Fill required fields'}
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
          <span className="text-muted-foreground">Secure</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          <span className="text-muted-foreground">Instant</span>
        </div>
      </div>
    </div>
  </CardContent>

  {/* Footer */}
  <CardFooter className="px-6 py-4 bg-gradient-to-r from-gray-50 to-transparent border-t border-border/50">
    <Button
      disabled={!wabaId || !phoneNumberId || !user?.id || isConnecting}
      onClick={handleConnect}
      className="w-full transition-all duration-200"
    >
      {isConnecting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <Link className="h-4 w-4 mr-2" />
          <span>Connect WABA Account</span>
        </>
      )}
    </Button>
  </CardFooter>
</Card>
  );

}
