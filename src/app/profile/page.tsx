'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from "@/components/layout/Layout";
import {
  User,
  Mail,
  Settings,
  Edit3,
  LogOut,
  Shield,
  Key,
  Bell,
  Check,
  ChevronRight,
  Smartphone,
  Globe,
  Save,
  ArrowLeft,
  X,
  Clock,
  AlertCircle,
  Plus
} from 'lucide-react';
import { FaWhatsapp } from "react-icons/fa";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface WabaAccount {
  wabaId: string;
  phoneNumberId: string;
  businessName: string;
  phoneNumber: string;
  connectedAt: Date;
  status: 'active' | 'disconnected' | 'pending';
  isvNameToken: string;
  templateCount?: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  wabaAccounts: WabaAccount[];
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("account");
  const [showEditNameDialog, setShowEditNameDialog] = useState(false);
  const [showEditEmailDialog, setShowEditEmailDialog] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [editingEmail, setEditingEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState<string | null>(null);
  const [showConfirmDisconnect, setShowConfirmDisconnect] = useState<WabaAccount | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  // Notification preferences (simulated)
  const [notificationPreferences, setNotificationPreferences] = useState({
    emailNotifications: true,
    inAppNotifications: true,
    messageAlerts: true,
    newConversations: true,
    assignedConversations: true,
    statusChanges: false,
    dailyDigest: false
  });

  // Security settings (simulated)
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30, // minutes
    loginHistory: [
      { date: new Date(Date.now() - 1000 * 60 * 5), ip: '192.168.1.1', device: 'Chrome on Windows' },
      { date: new Date(Date.now() - 1000 * 60 * 60 * 24), ip: '192.168.1.1', device: 'Safari on iPhone' },
      { date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), ip: '192.168.1.1', device: 'Chrome on macOS' }
    ]
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch user profile');
        }

        const data = await response.json();
        setUser(data.user);
        setEditingName(data.user.name);
        setEditingEmail(data.user.email);
      } catch (err) {
        setError('Unable to load profile information');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        router.push('/login');
      }
    } catch (err) {
      console.error('Logout failed', err);
      toast({
        title: "Logout failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const updateName = async () => {
    if (!editingName.trim() || editingName === user?.name) {
      setShowEditNameDialog(false);
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName.trim() }),
      });

      if (response.ok) {
        setUser(prev => prev ? { ...prev, name: editingName.trim() } : null);
        toast({ title: "Name updated successfully" });
        setShowEditNameDialog(false);
      } else {
        const data = await response.json();
        toast({
          title: "Failed to update name",
          description: data.message || "Please try again",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Failed to update name",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateEmail = async () => {
    if (!editingEmail.trim() || editingEmail === user?.email) {
      setShowEditEmailDialog(false);
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: editingEmail.trim() }),
      });

      if (response.ok) {
        setUser(prev => prev ? { ...prev, email: editingEmail.trim() } : null);
        toast({ title: "Email updated successfully" });
        setShowEditEmailDialog(false);
      } else {
        const data = await response.json();
        toast({
          title: "Failed to update email",
          description: data.message || "Please try again",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Failed to update email",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "All fields are required",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "New passwords don't match",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
      });

      if (response.ok) {
        toast({ title: "Password changed successfully" });
        setShowChangePasswordDialog(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await response.json();
        toast({
          title: "Failed to change password",
          description: data.message || "Please try again",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Failed to change password",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const disconnectWhatsAppAccount = async (account: WabaAccount) => {
    setIsDisconnecting(account.wabaId);
    try {
      // This is a simulated API call. In a real app, you would implement this endpoint.
      const response = await fetch(`/api/waba-accounts/${account.wabaId}/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        // Update the local state to reflect the disconnection
        setUser(prev => {
          if (!prev) return null;

          const updatedAccounts = prev.wabaAccounts.map(acc =>
            acc.wabaId === account.wabaId
              ? { ...acc, status: 'disconnected' as const }
              : acc
          );

          return { ...prev, wabaAccounts: updatedAccounts };
        });

        toast({ title: "WhatsApp account disconnected" });
      } else {
        const data = await response.json();
        toast({
          title: "Failed to disconnect account",
          description: data.message || "Please try again",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Failed to disconnect account",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsDisconnecting(null);
      setShowConfirmDisconnect(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-screen flex w-full flex-col bg-background">
        {/* Top Navigation Bar */}
        <div className="h-16 border-b bg-card flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Profile & Settings</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className="flex-1 container max-w-6xl mx-auto py-6 px-4 md:px-6 space-y-8 overflow-auto">
          {/* Header section with user info */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-20 w-20 border-4 border-background">
                <AvatarFallback className="bg-primary/20 text-primary text-xl">
                  {user?.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-foreground mb-1">{user?.name}</h1>
                <p className="text-muted-foreground flex items-center justify-center md:justify-start">
                  <Mail className="h-4 w-4 mr-2" /> {user?.email}
                </p>

                <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingName(user?.name || "");
                      setShowEditNameDialog(true);
                    }}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowChangePasswordDialog(true)}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main content area with tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="grid grid-cols-3 w-full md:w-auto md:inline-flex">
              <TabsTrigger value="account" className="px-4">
                <User className="h-4 w-4 mr-2" /> Account
              </TabsTrigger>
              <TabsTrigger value="connections" className="px-4">
                <FaWhatsapp className="h-4 w-4 mr-2" /> WhatsApp
              </TabsTrigger>
              <TabsTrigger value="settings" className="px-4">
                <Settings className="h-4 w-4 mr-2" /> Settings
              </TabsTrigger>
            </TabsList>

            {/* Account Tab */}
            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-primary" />
                    Account Information
                  </CardTitle>
                  <CardDescription>
                    Manage your personal account details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Full Name</Label>
                      <div className="flex items-center justify-between p-3 rounded-md border bg-accent/10">
                        <span className="font-medium">{user?.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setEditingName(user?.name || "");
                            setShowEditNameDialog(true);
                          }}
                        >
                          <Edit3 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Email Address</Label>
                      <div className="flex items-center justify-between p-3 rounded-md border bg-accent/10">
                        <span className="font-medium">{user?.email}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setEditingEmail(user?.email || "");
                            setShowEditEmailDialog(true);
                          }}
                        >
                          <Edit3 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Label className="text-sm text-muted-foreground">Password</Label>
                    <div className="flex items-center justify-between p-3 rounded-md border bg-accent/10">
                      <span className="font-medium">••••••••</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setShowChangePasswordDialog(true)}
                      >
                        <Edit3 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-primary" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your account security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.twoFactorAuth}
                      onCheckedChange={(checked) => {
                        setSecuritySettings({...securitySettings, twoFactorAuth: checked});
                        toast({
                          title: checked ? "Two-factor authentication enabled" : "Two-factor authentication disabled"
                        });
                      }}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label className="text-base">Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">
                      Time before you&apos;re automatically logged out due to inactivity
                    </p>
                    <div className="flex gap-3">
                      {[15, 30, 60, 120].map(minutes => (
                        <Button
                          key={minutes}
                          variant={securitySettings.sessionTimeout === minutes ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setSecuritySettings({...securitySettings, sessionTimeout: minutes});
                            toast({ title: `Session timeout set to ${minutes} minutes` });
                          }}
                          className={securitySettings.sessionTimeout === minutes ? "text-primary-foreground" : ""}
                        >
                          {minutes} min
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label className="text-base">Recent Login Activity</Label>
                    <div className="space-y-2">
                      {securitySettings.loginHistory.map((login, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-md border bg-accent/10">
                          <div className="flex-1">
                            <p className="font-medium">{login.device}</p>
                            <p className="text-sm text-muted-foreground">IP: {login.ip}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {format(login.date, 'MMM d, yyyy')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(login.date, 'h:mm a')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* WhatsApp Connections Tab */}
            <TabsContent value="connections" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FaWhatsapp className="h-5 w-5 mr-2 text-green-600" />
                    WhatsApp Business Accounts
                  </CardTitle>
                  <CardDescription>
                    Manage your connected WhatsApp Business accounts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user?.wabaAccounts && user.wabaAccounts.length > 0 ? (
                    <div className="space-y-4">
                      {user.wabaAccounts.map((account) => (
                        <div
                          key={account.wabaId}
                          className="rounded-lg border overflow-hidden"
                        >
                          <div className="bg-accent/10 px-4 py-3 flex justify-between items-center border-b">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "h-9 w-9 rounded-full flex items-center justify-center",
                                account.status === "active" ? "bg-green-100" :
                                account.status === "pending" ? "bg-amber-100" : "bg-red-100"
                              )}>
                                <FaWhatsapp className={cn(
                                  "h-5 w-5",
                                  account.status === "active" ? "text-green-600" :
                                  account.status === "pending" ? "text-amber-600" : "text-red-600"
                                )} />
                              </div>
                              <div>
                                <h3 className="font-medium">{account.businessName || 'WhatsApp Business Account'}</h3>
                                <p className="text-sm text-muted-foreground">{account.phoneNumber}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className={cn(
                              "capitalize",
                              account.status === "active" ? "bg-green-100 text-green-800 border-green-200" :
                              account.status === "pending" ? "bg-amber-100 text-amber-800 border-amber-200" :
                              "bg-red-100 text-red-800 border-red-200"
                            )}>
                              {account.status}
                            </Badge>
                          </div>
                          <div className="p-4 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Account ID</p>
                                <p className="font-medium text-xs truncate">{account.wabaId}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Phone Number ID</p>
                                <p className="font-medium text-xs truncate">{account.phoneNumberId}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Connected On</p>
                                <p className="font-medium">
                                  {format(new Date(account.connectedAt), 'MMM d, yyyy')}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Templates</p>
                                <p className="font-medium">{account.templateCount || 0}</p>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push('/templates')}
                              >
                                Manage Templates
                              </Button>
                              {account.status === "active" && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setShowConfirmDisconnect(account)}
                                  disabled={isDisconnecting === account.wabaId}
                                >
                                  {isDisconnecting === account.wabaId ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                                      Disconnecting...
                                    </>
                                  ) : (
                                    <>
                                      Disconnect Account
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <div className="bg-green-100 rounded-full p-4 inline-flex mb-4">
                        <FaWhatsapp className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No WhatsApp Accounts Connected</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Connect your WhatsApp Business Account to start sending messages through our platform.
                      </p>
                      <Button
                        onClick={() => router.push('/dashboard')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <FaWhatsapp className="h-4 w-4 mr-2" />
                        Connect WhatsApp Account
                      </Button>
                    </div>
                  )}
                </CardContent>
                {user?.wabaAccounts && user.wabaAccounts.length > 0 && (
                  <CardFooter className="border-t bg-accent/5 px-6">
                    <Button
                      variant="outline"
                      className="ml-auto"
                      onClick={() => router.push('/dashboard')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Connect Another Account
                    </Button>
                  </CardFooter>
                )}
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-primary" />
                    API Integration
                  </CardTitle>
                  <CardDescription>
                    Access API keys and integration information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-accent/10 p-4 rounded-md border">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-medium">API Key</h3>
                        <p className="text-sm text-muted-foreground">Use this key to authenticate API requests</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          value="••••••••••••••••••••••••••••••"
                          readOnly
                          className="font-mono bg-background w-full md:w-auto"
                        />
                        <Button variant="outline" size="sm">
                          Copy
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Webhook URL</h3>
                      <p className="text-sm text-muted-foreground">Configure in your Meta Dashboard</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-primary" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Control how and when you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-notifications" className="text-base flex-1">
                        Email Notifications
                        <p className="text-sm font-normal text-muted-foreground mt-0.5">
                          Receive notifications via email
                        </p>
                      </Label>
                      <Switch
                        id="email-notifications"
                        checked={notificationPreferences.emailNotifications}
                        onCheckedChange={(checked) => {
                          setNotificationPreferences({...notificationPreferences, emailNotifications: checked});
                          toast({
                            title: checked ? "Email notifications enabled" : "Email notifications disabled"
                          });
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                   <Label htmlFor="in-app-notifications" className="text-base flex-1">
                        In-App Notifications
                        <p className="text-sm font-normal text-muted-foreground mt-0.5">
                          Receive notifications within the application
                        </p>
                      </Label>
                      <Switch
                        id="in-app-notifications"
                        checked={notificationPreferences.inAppNotifications}
                        onCheckedChange={(checked) => {
                          setNotificationPreferences({...notificationPreferences, inAppNotifications: checked});
                          toast({
                            title: checked ? "In-app notifications enabled" : "In-app notifications disabled"
                          });
                        }}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="font-medium text-sm">Notification Types</h3>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="message-alerts" className="text-sm flex-1">
                        New message alerts
                      </Label>
                      <Switch
                        id="message-alerts"
                        checked={notificationPreferences.messageAlerts}
                        onCheckedChange={(checked) => {
                          setNotificationPreferences({...notificationPreferences, messageAlerts: checked});
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="new-conversations" className="text-sm flex-1">
                        New conversation alerts
                      </Label>
                      <Switch
                        id="new-conversations"
                        checked={notificationPreferences.newConversations}
                        onCheckedChange={(checked) => {
                          setNotificationPreferences({...notificationPreferences, newConversations: checked});
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="assigned-conversations" className="text-sm flex-1">
                        Assigned conversation alerts
                      </Label>
                      <Switch
                        id="assigned-conversations"
                        checked={notificationPreferences.assignedConversations}
                        onCheckedChange={(checked) => {
                          setNotificationPreferences({...notificationPreferences, assignedConversations: checked});
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="status-changes" className="text-sm flex-1">
                        Status change alerts
                      </Label>
                      <Switch
                        id="status-changes"
                        checked={notificationPreferences.statusChanges}
                        onCheckedChange={(checked) => {
                          setNotificationPreferences({...notificationPreferences, statusChanges: checked});
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="daily-digest" className="text-sm flex-1">
                        Daily digest summary
                      </Label>
                      <Switch
                        id="daily-digest"
                        checked={notificationPreferences.dailyDigest}
                        onCheckedChange={(checked) => {
                          setNotificationPreferences({...notificationPreferences, dailyDigest: checked});
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t bg-accent/5 px-6">
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-primary" />
                    Application Settings
                  </CardTitle>
                  <CardDescription>
                    Customize your application experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="timezone" className="text-sm flex-1">
                        Time Zone
                      </Label>
                      <div className="w-[260px]">
                        <select
                          id="timezone"
                          className="w-full p-2 border rounded-md bg-background"
                          defaultValue="UTC"
                        >
                          <option value="UTC">UTC (Coordinated Universal Time)</option>
                          <option value="America/New_York">Eastern Time (US & Canada)</option>
                          <option value="America/Chicago">Central Time (US & Canada)</option>
                          <option value="America/Denver">Mountain Time (US & Canada)</option>
                          <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                          <option value="Europe/London">London</option>
                          <option value="Europe/Paris">Paris</option>
                          <option value="Asia/Tokyo">Tokyo</option>
                          <option value="Asia/Shanghai">Shanghai</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="date-format" className="text-sm flex-1">
                        Date Format
                      </Label>
                      <div className="w-[260px]">
                        <select
                          id="date-format"
                          className="w-full p-2 border rounded-md bg-background"
                          defaultValue="MM/DD/YYYY"
                        >
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="language" className="text-sm flex-1">
                        Language
                      </Label>
                      <div className="w-[260px]">
                        <select
                          id="language"
                          className="w-full p-2 border rounded-md bg-background"
                          defaultValue="en"
                        >
                          <option value="en">English</option>
                          <option value="es">Español</option>
                          <option value="fr">Français</option>
                          <option value="de">Deutsch</option>
                          <option value="pt">Português</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="theme" className="text-sm flex-1">
                        Theme
                      </Label>
                      <div className="w-[260px]">
                        <select
                          id="theme"
                          className="w-full p-2 border rounded-md bg-background"
                          defaultValue="system"
                        >
                          <option value="system">System Default</option>
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t bg-accent/5 px-6">
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    Permanent actions for your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-md border border-red-200 bg-red-50">
                    <div className="p-4">
                      <h3 className="font-medium text-red-800">Delete Account</h3>
                      <p className="text-sm text-red-700 mt-1">
                        This action is permanent and cannot be undone. All your data will be deleted.
                      </p>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="mt-4"
                        onClick={() => {
                          toast({
                            title: "This is a demo",
                            description: "Account deletion is disabled in this demo",
                          });
                        }}
                      >
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Name Dialog */}
      <Dialog open={showEditNameDialog} onOpenChange={setShowEditNameDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Your Name</DialogTitle>
            <DialogDescription>
              Update your display name shown across the platform
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input
                id="full-name"
                placeholder="Enter your full name"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                className="focus-visible:ring-primary"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditNameDialog(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={updateName}
              disabled={!editingName.trim() || editingName === user?.name || isSaving}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Email Dialog */}
      <Dialog open={showEditEmailDialog} onOpenChange={setShowEditEmailDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Email Address</DialogTitle>
            <DialogDescription>
              Update the email address associated with your account
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label htmlFor="email-address">Email Address</Label>
              <Input
                id="email-address"
                type="email"
                placeholder="Enter your email address"
                value={editingEmail}
                onChange={(e) => setEditingEmail(e.target.value)}
                className="focus-visible:ring-primary"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditEmailDialog(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={updateEmail}
              disabled={!editingEmail.trim() || editingEmail === user?.email || isSaving}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showChangePasswordDialog} onOpenChange={setShowChangePasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Update your account password to improve security
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="Enter your current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="focus-visible:ring-primary"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowChangePasswordDialog(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={changePassword}
              disabled={!currentPassword || !newPassword || !confirmPassword || isSaving}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  Change Password
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Disconnect Dialog */}
      <Dialog open={!!showConfirmDisconnect} onOpenChange={(open) => !open && setShowConfirmDisconnect(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Disconnect WhatsApp Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect this WhatsApp Business Account?
            </DialogDescription>
          </DialogHeader>

          {showConfirmDisconnect && (
            <div className="bg-accent/10 p-4 rounded-md border my-2">
              <p className="font-medium">{showConfirmDisconnect.businessName || 'WhatsApp Business Account'}</p>
              <p className="text-sm text-muted-foreground">{showConfirmDisconnect.phoneNumber}</p>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 my-2">
            <div className="flex gap-3">
              <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-800 font-medium">This will affect your conversations</p>
                <p className="text-sm text-amber-700 mt-1">
                  After disconnecting, you won&apos;t be able to send or receive messages through this account until you reconnect it.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDisconnect(null)}
              disabled={isDisconnecting !== null}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => showConfirmDisconnect && disconnectWhatsAppAccount(showConfirmDisconnect)}
              disabled={isDisconnecting !== null}
            >
              {isDisconnecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                  Disconnecting...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Disconnect Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
