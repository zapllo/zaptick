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
    <Card className="flex flex-col justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-dashed border-2 border-blue-200 dark:border-blue-800">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-blue-900 dark:text-blue-100">
          <Link className="h-5 w-5" />
          Connect Existing WABA
        </CardTitle>
        <CardDescription className="text-blue-700 dark:text-blue-300">
          Already have a WhatsApp Business Account? Connect it directly
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="wabaId" className="text-sm font-medium">
            WABA ID <span className="text-red-500">*</span>
          </Label>
          <Input
            id="wabaId"
            placeholder="e.g., 123456789012345"
            value={wabaId}
            onChange={(e) => setWabaId(e.target.value)}
            className="bg-white dark:bg-gray-950"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumberId" className="text-sm font-medium">
            Phone Number ID <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phoneNumberId"
            placeholder="e.g., 987654321098765"
            value={phoneNumberId}
            onChange={(e) => setPhoneNumberId(e.target.value)}
            className="bg-white dark:bg-gray-950"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessName" className="text-sm font-medium">
            Business Name
          </Label>
          <Input
            id="businessName"
            placeholder="Your Business Name (optional)"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="bg-white dark:bg-gray-950"
          />
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 <strong>Where to find these IDs:</strong><br/>
            Go to <strong>Facebook Business Manager</strong> → <strong>WhatsApp Accounts</strong> → Select your account → View the WABA ID and Phone Number ID in the account details.
          </p>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          disabled={!wabaId || !phoneNumberId || !user?.id || isConnecting}
          onClick={handleConnect}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isConnecting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Link className="h-4 w-4 mr-2" />
              Connect WABA
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
