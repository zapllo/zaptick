"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
    User,
    Building2,
    KeyRound,
    Save,
    Calendar,
    Mail,
    Shield,
    Crown,
    Globe,
    MapPin,
    Users,
    Briefcase,
    Eye,
    EyeOff
} from "lucide-react";
import { format } from "date-fns";

interface UserData {
    id: string;
    name: string;
    email: string;
    role: string;
    isOwner: boolean;
    lastLoginAt?: string;
    createdAt: string;
}

interface CompanyData {
    id: string;
    name: string;
    address?: string;
    website?: string;
    industry?: string;
    size?: string;
    logo?: string;
}

const COMPANY_SIZES = [
    "1-10 employees",
    "11-50 employees",
    "51-200 employees",
    "201-500 employees",
    "501-1000 employees",
    "1000+ employees"
];

const INDUSTRIES = [
    "Technology",
    "E-commerce",
    "Healthcare",
    "Education",
    "Finance",
    "Real Estate",
    "Food & Beverage",
    "Fashion & Retail",
    "Travel & Tourism",
    "Automotive",
    "Manufacturing",
    "Consulting",
    "Marketing & Advertising",
    "Non-profit",
    "Other"
];

export default function AccountPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [companyData, setCompanyData] = useState<CompanyData | null>(null);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const { toast } = useToast();

    // Form states
    const [profileForm, setProfileForm] = useState({
        name: "",
        email: ""
    });

    const [companyForm, setCompanyForm] = useState({
        name: "",
        address: "",
        website: "",
        industry: "",
        size: "",
        logo: ""
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isUpdatingCompany, setIsUpdatingCompany] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    useEffect(() => {
        fetchAccountData();
    }, []);

    const fetchAccountData = async () => {
        try {
            const response = await fetch('/api/account');
            const data = await response.json();

            if (data.success) {
                setUserData(data.data.user);
                setCompanyData(data.data.company);

                // Set form initial values
                setProfileForm({
                    name: data.data.user.name,
                    email: data.data.user.email
                });

                setCompanyForm({
                    name: data.data.company.name || "",
                    address: data.data.company.address || "",
                    website: data.data.company.website || "",
                    industry: data.data.company.industry || "",
                    size: data.data.company.size || "",
                    logo: data.data.company.logo || ""
                });
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to fetch account data",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error fetching account data:', error);
            toast({
                title: "Error",
                description: "Failed to fetch account data",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileUpdate = async () => {
        if (!profileForm.name || !profileForm.email) {
            toast({
                title: "Error",
                description: "Name and email are required",
                variant: "destructive",
            });
            return;
        }

        setIsUpdatingProfile(true);
        try {
            const response = await fetch('/api/account/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileForm),
            });

            const data = await response.json();

            if (data.success) {
                setUserData(data.user);
                toast({
                    title: "Success",
                    description: "Profile updated successfully",
                });
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to update profile",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast({
                title: "Error",
                description: "Failed to update profile",
                variant: "destructive",
            });
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleCompanyUpdate = async () => {
        if (!companyForm.name) {
            toast({
                title: "Error",
                description: "Company name is required",
                variant: "destructive",
            });
            return;
        }

        setIsUpdatingCompany(true);
        try {
            const response = await fetch('/api/account/company', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(companyForm),
            });

            const data = await response.json();

            if (data.success) {
                setCompanyData(data.company);
                toast({
                    title: "Success",
                    description: "Company information updated successfully",
                });
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to update company information",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error updating company:', error);
            toast({
                title: "Error",
                description: "Failed to update company information",
                variant: "destructive",
            });
        } finally {
            setIsUpdatingCompany(false);
        }
    };

    const handlePasswordChange = async () => {
        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            toast({
                title: "Error",
                description: "All password fields are required",
                variant: "destructive",
            });
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast({
                title: "Error",
                description: "New passwords do not match",
                variant: "destructive",
            });
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            toast({
                title: "Error",
                description: "Password must be at least 6 characters long",
                variant: "destructive",
            });
            return;
        }

        setIsChangingPassword(true);
        try {
            const response = await fetch('/api/account/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                }),
            });

            const data = await response.json();

            if (data.success) {
                setPasswordForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                });
                setIsPasswordDialogOpen(false);
                toast({
                    title: "Success",
                    description: "Password changed successfully",
                });
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to change password",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error changing password:', error);
            toast({
                title: "Error",
                description: "Failed to change password",
                variant: "destructive",
            });
        } finally {
            setIsChangingPassword(false);
        }
    };

    const getUserRoleDisplay = () => {
        if (userData?.isOwner) return 'Owner';
        if (userData?.role === 'admin') return 'Admin';
        return 'Agent';
    };

    const getUserRoleBadgeVariant = () => {
        if (userData?.isOwner) return 'default';
        if (userData?.role === 'admin') return 'secondary';
        return 'outline';
    };

    if (isLoading) {
        return (
            <ProtectedRoute>
                <Layout>
                    <div className="container mx-auto px-4 py-8 max-w-4xl">
                        <div className="space-y-6">
                            <Skeleton className="h-8 w-48" />
                            <div className="grid gap-6">
                                <Skeleton className="h-64 w-full" />
                                <Skeleton className="h-64 w-full" />
                            </div>
                        </div>
                    </div>
                </Layout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <Layout>
                <div className="container mx-auto px-4 py-8 ">
                    <div className="space-y-6">
                        {/* Header */}
                        <div>
                            <h1 className="text-3xl font-bold">Account Settings</h1>
                            <p className="text-muted-foreground mt-1">
                                Manage your personal and company information
                            </p>
                        </div>

                        {/* User Profile Section */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src="/placeholder-avatar.jpg" />
                                        <AvatarFallback className="bg-primary/10 text-primary text-xl">
                                            {userData?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            Personal Information
                                        </CardTitle>
                                        <CardDescription>
                                            Update your personal details and account information
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name *</Label>
                                            <Input
                                                id="name"
                                                value={profileForm.name}
                                                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                                placeholder="Enter your full name"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={profileForm.email}
                                                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                                placeholder="Enter your email address"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Role</Label>
                                            <div className="flex items-center gap-2">
                                                {userData?.isOwner ? (
                                                    <Crown className="h-4 w-4 text-yellow-500" />
                                                ) : (
                                                    <Shield className="h-4 w-4 text-primary" />
                                                )}
                                                <Badge variant={getUserRoleBadgeVariant() as any}>
                                                    {getUserRoleDisplay()}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Member Since</Label>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                {userData?.createdAt && format(new Date(userData.createdAt), "MMMM dd, yyyy")}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Last Login</Label>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Mail className="h-4 w-4" />
                                                {userData?.lastLoginAt
                                                    ? format(new Date(userData.lastLoginAt), "MMMM dd, yyyy 'at' HH:mm")
                                                    : "Never"
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex justify-between items-center">
                                    <div className="space-y-1">
                                        <h4 className="font-medium">Password</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Change your account password
                                        </p>
                                    </div>
                                    <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline">
                                                <KeyRound className="h-4 w-4 mr-2" />
                                                Change Password
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Change Password</DialogTitle>
                                                <DialogDescription>
                                                    Enter your current password and choose a new one
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="currentPassword">Current Password</Label>
                                                    <div className="relative">
                                                        <Input
                                                            id="currentPassword"
                                                            type={showCurrentPassword ? "text" : "password"}
                                                            value={passwordForm.currentPassword}
                                                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                                            placeholder="Enter current password"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                        >
                                                            {showCurrentPassword ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="newPassword">New Password</Label>
                                                    <div className="relative">
                                                        <Input
                                                            id="newPassword"
                                                            type={showNewPassword ? "text" : "password"}
                                                            value={passwordForm.newPassword}
                                                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                            placeholder="Enter new password"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                                        >
                                                            {showNewPassword ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                                    <Input
                                                        id="confirmPassword"
                                                        type="password"
                                                        value={passwordForm.confirmPassword}
                                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                        placeholder="Confirm new password"
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setIsPasswordDialogOpen(false)}
                                                    disabled={isChangingPassword}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handlePasswordChange}
                                                    disabled={isChangingPassword}
                                                >
                                                    {isChangingPassword ? "Changing..." : "Change Password"}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleProfileUpdate}
                                        disabled={isUpdatingProfile}
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {isUpdatingProfile ? "Saving..." : "Save Changes"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Company Information Section */}
                        {(userData?.isOwner || userData?.role === 'admin') && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        Company Information
                                    </CardTitle>
                                    <CardDescription>
                                        Manage your company details and branding
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="companyName">Company Name *</Label>
                                                <Input
                                                    id="companyName"
                                                    value={companyForm.name}
                                                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                                                    placeholder="Enter company name"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="website">Website</Label>
                                                <div className="relative">
                                                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        id="website"
                                                        value={companyForm.website}
                                                        onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                                                        placeholder="https://www.example.com"
                                                        className="pl-10"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="industry">Industry</Label>
                                                <Select
                                                    value={companyForm.industry}
                                                    onValueChange={(value) => setCompanyForm({ ...companyForm, industry: value })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select industry" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {INDUSTRIES.map((industry) => (
                                                            <SelectItem key={industry} value={industry}>
                                                                {industry}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="address">Address</Label>
                                                <Textarea
                                                    id="address"
                                                    value={companyForm.address}
                                                    onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                                                    placeholder="Enter company address"
                                                    rows={3}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="size">Company Size</Label>
                                                <Select
                                                    value={companyForm.size}
                                                    onValueChange={(value) => setCompanyForm({ ...companyForm, size: value })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select company size" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {COMPANY_SIZES.map((size) => (
                                                            <SelectItem key={size} value={size}>
                                                                {size}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* <div className="space-y-2">
                                                <Label htmlFor="logo">Logo URL</Label>
                                                <Input
                                                    id="logo"
                                                    value={companyForm.logo}
                                                    onChange={(e) => setCompanyForm({ ...companyForm, logo: e.target.value })}
                                                    placeholder="https://example.com/logo.png"
                                                />
                                            </div> */}
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            onClick={handleCompanyUpdate}
                                            disabled={isUpdatingCompany}
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            {isUpdatingCompany ? "Saving..." : "Save Company Info"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Account Security Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Account Security
                                </CardTitle>
                                <CardDescription>
                                    Monitor your account security and activity
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="space-y-1">
                                        <h4 className="font-medium">Two-Factor Authentication</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Add an extra layer of security to your account
                                        </p>
                                    </div>
                                    <Button variant="outline" disabled>
                                        <Shield className="h-4 w-4 mr-2" />
                                        Coming Soon
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="space-y-1">
                                        <h4 className="font-medium">Login Sessions</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Manage your active login sessions
                                        </p>
                                    </div>
                                    <Button variant="outline" disabled>
                                        <Users className="h-4 w-4 mr-2" />
                                        Coming Soon
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Danger Zone - Only for Owners */}
                        {userData?.isOwner && (
                            <Card className="border-destructive">
                                <CardHeader>
                                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                                    <CardDescription>
                                        Actions that can permanently affect your account and company
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border border-destructive rounded-lg">
                                        <div className="space-y-1">
                                            <h4 className="font-medium text-destructive">Delete Company</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Permanently delete your company and all associated data
                                            </p>
                                        </div>
                                        <Button variant="destructive" disabled>
                                            Delete Company
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}