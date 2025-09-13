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
    EyeOff,
    Edit3,
    CheckCircle,
    AlertTriangle,
    Lock,
    Settings,
    UserCheck,
    Building,
    Phone,
    Camera,
    Loader2,
    Trash2,
    RotateCcw,
    Clock,
    ArrowRight,
    Activity
} from "lucide-react";
import { format } from "date-fns";
import PhoneInput from "react-phone-input-2";
import 'react-phone-input-2/lib/style.css';
import { BiCategory } from "react-icons/bi";

// Industry categories mapping - same as signup page
const INDUSTRY_CATEGORIES = {
    "Marketing & Advertising": [
        "Digital Marketing",
        "Traditional Advertising"
    ],
    "Retail": [
        "Ecommerce & Online Stores",
        "Physical Stores & Brick Mortar",
        "Omnichannel Ecommerce & Physical Stores"
    ],
    "Education": [
        "Schools & Universities",
        "Coaching Classes & Training Institutes",
        "Online Learning Platforms",
        "Books & Publications"
    ],
    "Entertainment, Social Media & Gaming": [
        "Movies & TV Shows",
        "Events & Performing Arts",
        "Cinema Halls & Multiplexes",
        "Magazines & Publications",
        "Gaming",
        "Social Media Figures",
        "Gambling & Real Money Gaming"
    ],
    "Finance": [
        "Banks",
        "Investments",
        "Payment Aggregators",
        "Insurance",
        "Loans"
    ],
    "Healthcare": [
        "Medical Services",
        "Prescription Medicines & Drugs",
        "Hospitals"
    ],
    "Public Utilities & Non-Profits": [
        "Government Services",
        "Charities",
        "Religious Organizations"
    ],
    "Professional Services": [
        "Legal Consulting Services",
        "Other Services"
    ],
    "Technology": [
        "Software & IT Services",
        "Technology & Hardware"
    ],
    "Travel & Hospitality": [
        "Hotels & Lodging",
        "Transportation",
        "Tour Agencies",
        "Clubs"
    ],
    "Automotive": [
        "Automobile Dealers",
        "Automotive Services"
    ],
    "Real Estate & Construction": [
        "Property Sales",
        "Building & Construction"
    ],
    "Restaurants": [
        "Fast Food",
        "Fine Dining",
        "Catering"
    ],
    "Manufacturing & Impex": [
        "Consumer Goods Production",
        "Industrial Production",
        "Impex"
    ],
    "Fitness & Wellness": [
        "Gyms & Fitness Centers",
        "Fitness Services",
        "Spas & Salons"
    ],
    "Others": [
        "Miscellaneous"
    ]
};

// Get industries array
const INDUSTRIES = Object.keys(INDUSTRY_CATEGORIES);

const COMPANY_SIZES = [
    "1-10 employees",
    "11-50 employees",
    "51-200 employees",
    "201-500 employees",
    "501-1000 employees",
    "1000+ employees"
];

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
    category?: string;
    location?: string;
    phone?: string;
    countryCode?: string;
    logo?: string;
}

export default function AccountPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [companyData, setCompanyData] = useState<CompanyData | null>(null);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [activeSection, setActiveSection] = useState<'profile' | 'company' | 'security'>('profile');

    const { toast } = useToast();

    // Available categories based on selected industry
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);

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
        category: "",
        location: "",
        phone: "",
        countryCode: "+91",
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

    // Update categories when industry changes
    useEffect(() => {
        if (companyForm.industry) {
            setAvailableCategories(INDUSTRY_CATEGORIES[companyForm.industry as keyof typeof INDUSTRY_CATEGORIES] || []);
            // Don't reset category if it's valid for the new industry
            const validCategories = INDUSTRY_CATEGORIES[companyForm.industry as keyof typeof INDUSTRY_CATEGORIES] || [];
            if (companyForm.category && !validCategories.includes(companyForm.category)) {
                setCompanyForm(prev => ({ ...prev, category: "" }));
            }
        } else {
            setAvailableCategories([]);
        }
    }, [companyForm.industry]);

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
                    category: data.data.company.category || "",
                    location: data.data.company.location || "",
                    phone: data.data.company.phone || "",
                    countryCode: data.data.company.countryCode || "+91",
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

        // Validate industry-category relationship
        if (companyForm.industry && companyForm.category) {
            const validCategories = INDUSTRY_CATEGORIES[companyForm.industry as keyof typeof INDUSTRY_CATEGORIES];
            if (!validCategories || !validCategories.includes(companyForm.category)) {
                toast({
                    title: "Error",
                    description: "Invalid category for the selected industry",
                    variant: "destructive",
                });
                return;
            }
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

    const getRoleIcon = () => {
        if (userData?.isOwner) return <Crown className="h-4 w-4 text-yellow-500" />;
        if (userData?.role === 'admin') return <Shield className="h-4 w-4 text-blue-500" />;
        return <User className="h-4 w-4 text-gray-500" />;
    };

    const sections = [
        { id: 'profile', label: 'Personal Info', icon: User, description: 'Manage your personal details' },
        { id: 'company', label: 'Company', icon: Building2, description: 'Update company information' },
        { id: 'security', label: 'Security', icon: Shield, description: 'Account security settings' }
    ];

    if (isLoading) {
        return (
            <ProtectedRoute>
                <Layout>
                    <div className="container mx-auto p-6 max-w-7xl">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <Skeleton className="h-8 w-64" />
                                <Skeleton className="h-4 w-96" />
                            </div>
                            <div className="grid gap-6 lg:grid-cols-4">
                                <Skeleton className="h-64 w-full" />
                                <div className="lg:col-span-3">
                                    <Skeleton className="h-96 w-full" />
                                </div>
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
                <div className=" mx-auto p-6 ">
                    <div className="space-y-8">
                        {/* Header */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent wark:from-white wark:to-gray-300">
                                        Account Settings
                                    </h1>
                                    <p className="text-muted-foreground">
                                        Manage your personal and company information
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-right">
                                        <p className="text-sm font-medium">{userData?.name}</p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            {getRoleIcon()}
                                            {getUserRoleDisplay()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Status indicators */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-green-600 font-medium">Account Active</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>Last login: {userData?.lastLoginAt ? format(new Date(userData.lastLoginAt), "MMM dd, yyyy") : "Never"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-8 lg:grid-cols-4">
                            {/* Navigation Sidebar */}
                            <div className="lg:col-span-1">
                                <div className="sticky top-6 space-y-4">
                                    {/* Profile overview card */}
                                    <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
                                        <CardContent className="p-6">
                                            <div className="flex flex-col items-center text-center space-y-4">
                                                <div className="relative group">
                                                    <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                                                        <AvatarImage src="/placeholder-avatar.jpg" />
                                                        <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
                                                            {userData?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <button className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-white shadow-lg border-2 border-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-50">
                                                        <Camera className="h-4 w-4 text-gray-600" />
                                                    </button>
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="font-semibold text-lg">{userData?.name}</h3>
                                                    <Badge variant={getUserRoleBadgeVariant() as any} className="text-xs">
                                                        {getRoleIcon()}
                                                        <span className="ml-1">{getUserRoleDisplay()}</span>
                                                    </Badge>
                                                    <p className="text-sm text-muted-foreground">{userData?.email}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Navigation */}
                                    <nav className="space-y-2">
                                        {sections.map((section) => {
                                            const Icon = section.icon;
                                            const isActive = activeSection === section.id;
                                            const isDisabled = section.id === 'company' && !(userData?.isOwner || userData?.role === 'admin');

                                            return (
                                                <button
                                                    key={section.id}
                                                    onClick={() => !isDisabled && setActiveSection(section.id as any)}
                                                    disabled={isDisabled}
                                                    className={`
                                                        w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group
                                                        ${isActive
                                                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                                            : isDisabled
                                                                ? 'text-muted-foreground cursor-not-allowed opacity-50'
                                                                : 'hover:bg-muted hover:shadow-md hover:scale-[1.02]'
                                                        }
                                                    `}
                                                >
                                                    <Icon className={`h-5 w-5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary'} transition-colors`} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`font-medium ${isActive ? 'text-primary-foreground' : ''}`}>
                                                            {section.label}
                                                        </p>
                                                        <p className={`text-xs ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                                            {section.description}
                                                        </p>
                                                    </div>
                                                    {isActive && (
                                                        <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </nav>

                                    {/* Quick stats */}
                                    <Card className="border-0 shadow-sm">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm font-medium text-muted-foreground">Account Stats</CardTitle>
                                        </CardHeader>
                                        <CardContent className="pt-0 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Member since</span>
                                                <span className="text-sm font-medium">
                                                    {userData?.createdAt && format(new Date(userData.createdAt), "MMM yyyy")}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Security level</span>
                                                <div className="flex items-center gap-1">
                                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                                    <span className="text-sm font-medium text-green-600">Good</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="lg:col-span-3">
                                <div className="space-y-6">
                                    {/* Profile Section */}
                                    {activeSection === 'profile' && (
                                        <Card className="border-0 shadow-lg">
                                            <CardHeader className="pb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                                        <User className="h-6 w-6 text-primary" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-xl">Personal Information</CardTitle>
                                                        <CardDescription>
                                                            Update your personal details and account preferences
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-8">
                                                <div className="grid md:grid-cols-2 gap-8">
                                                    <div className="space-y-6">
                                                        <div className="group space-y-3">
                                                            <Label htmlFor="name" className="text-sm font-medium text-gray-700 wark:text-gray-300">
                                                                Full Name *
                                                            </Label>
                                                            <div className="relative">
                                                                <Input
                                                                    id="name"
                                                                    value={profileForm.name}
                                                                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                                                    placeholder="Enter your full name"
                                                                    className="pl-10 transition-all duration-200 focus:shadow-md"
                                                                />
                                                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                            </div>
                                                        </div>

                                                        <div className="group space-y-3">
                                                            <Label htmlFor="email" className="text-sm font-medium text-gray-700 wark:text-gray-300">
                                                                Email Address *
                                                            </Label>
                                                            <div className="relative">
                                                                <Input
                                                                    id="email"
                                                                    type="email"
                                                                    value={profileForm.email}
                                                                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                                                    placeholder="Enter your email address"
                                                                    className="pl-10 transition-all duration-200 focus:shadow-md"
                                                                />
                                                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-6">
                                                        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 wark:from-blue-900/20 wark:to-indigo-900/20 border border-blue-200 wark:border-blue-800">
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <div className="p-2 rounded-lg bg-blue-100 wark:bg-blue-900/40">
                                                                    {getRoleIcon()}
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-medium text-blue-900 wark:text-blue-100">Account Role</h4>
                                                                    <p className="text-sm text-blue-700 wark:text-blue-300">Your current access level</p>
                                                                </div>
                                                            </div>
                                                            <Badge variant={getUserRoleBadgeVariant() as any} className="mb-2">
                                                                {getUserRoleDisplay()}
                                                            </Badge>
                                                            <p className="text-sm text-blue-700 wark:text-blue-300">
                                                                {userData?.isOwner
                                                                    ? "You have full administrative access to this account."
                                                                    : userData?.role === 'admin'
                                                                        ? "You have administrative privileges."
                                                                        : "You have agent-level access."
                                                                }
                                                            </p>
                                                        </div>

                                                        <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 wark:from-green-900/20 wark:to-emerald-900/20 border border-green-200 wark:border-green-800">
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <div className="p-2 rounded-lg bg-green-100 wark:bg-green-900/40">
                                                                    <Calendar className="h-4 w-4 text-green-600" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-medium text-green-900 wark:text-green-100">Member Since</h4>
                                                                    <p className="text-sm text-green-700 wark:text-green-300">
                                                                        {userData?.createdAt && format(new Date(userData.createdAt), "MMMM dd, yyyy")}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pt-6 border-t">
                                                    <div className="flex items-center justify-between">
                                                        <div className="space-y-1">
                                                            <h4 className="font-medium text-gray-900 wark:text-gray-100">Password Security</h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                Keep your account secure with a strong password
                                                            </p>
                                                        </div>
                                                        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                                                            <DialogTrigger asChild>
                                                                <Button variant="outline" className="hover:shadow-md transition-all duration-200">
                                                                    <KeyRound className="h-4 w-4 mr-2" />
                                                                    Change Password
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="sm:max-w-md">
                                                                <DialogHeader>
                                                                    <DialogTitle className="flex items-center gap-2">
                                                                        <Lock className="h-5 w-5" />
                                                                        Change Password
                                                                    </DialogTitle>
                                                                    <DialogDescription>
                                                                        Enter your current password and choose a new secure password
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
                                                                                className="pr-10"
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
                                                                                className="pr-10"
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
                                                                        className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
                                                                    >
                                                                        {isChangingPassword ? (
                                                                            <>
                                                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                                Changing...
                                                                            </>
                                                                        ) : (
                                                                            "Change Password"
                                                                        )}
                                                                    </Button>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end pt-6 border-t">
                                                    <Button
                                                        onClick={handleProfileUpdate}
                                                        disabled={isUpdatingProfile}
                                                        className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 hover:shadow-lg transition-all duration-200"
                                                    >
                                                        {isUpdatingProfile ? (
                                                            <>
                                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                Saving...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Save className="h-4 w-4 mr-2" />
                                                                Save Changes
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Company Section */}
                                    {activeSection === 'company' && (userData?.isOwner || userData?.role === 'admin') && (
                                        <Card className="border-0 shadow-lg">
                                            <CardHeader className="pb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                                                        <Building2 className="h-6 w-6 text-blue-500" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-xl">Company Information</CardTitle>
                                                        <CardDescription>
                                                            Manage your company details and business profile
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-8">
                                                <div className="grid md:grid-cols-2 gap-8">
                                                    <div className="space-y-6">
                                                        <div className="group space-y-3">
                                                            <Label htmlFor="companyName" className="text-sm font-medium text-gray-700 wark:text-gray-300">
                                                                Company Name *
                                                            </Label>
                                                            <div className="relative">
                                                                <Input
                                                                    id="companyName"
                                                                    value={companyForm.name}
                                                                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                                                                    placeholder="Enter company name"
                                                                    className="pl-10 transition-all duration-200 focus:shadow-md"
                                                                />
                                                                <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                            </div>
                                                        </div>

                                                        <div className="group space-y-3">
                                                            <Label htmlFor="website" className="text-sm font-medium text-gray-700 wark:text-gray-300">
                                                                Website URL
                                                            </Label>
                                                            <div className="relative">
                                                                <Input
                                                                    id="website"
                                                                    value={companyForm.website}
                                                                    onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                                                                    placeholder="https://www.example.com"
                                                                    className="pl-10 transition-all duration-200 focus:shadow-md"
                                                                />
                                                                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                            </div>
                                                        </div>

                                                        <div className="group space-y-3">
                                                            <Label htmlFor="companyPhone" className="text-sm font-medium text-gray-700 wark:text-gray-300">
                                                                Company Phone
                                                            </Label>
                                                            <div className="phone-input-container">
                                                                <PhoneInput
                                                                    country={'in'}
                                                                    value={companyForm.phone}
                                                                    onChange={(phone, country: any) => {
                                                                        setCompanyForm({
                                                                            ...companyForm,
                                                                            phone: phone,
                                                                            countryCode: country.dialCode
                                                                        });
                                                                    }}
                                                                    inputProps={{
                                                                        name: 'companyPhone',
                                                                        required: false,
                                                                        autoFocus: false
                                                                    }}
                                                                    containerClass="w-full"
                                                                    inputClass="w-full h-10 pl-12 pr-4 border border-slate-200 rounded-md focus:border-primary/50 focus:ring-1 focus:ring-primary/20 bg-white transition-all duration-200 focus:shadow-md"
                                                                    buttonClass="border-slate-200 hover:bg-slate-50 transition-colors"
                                                                    dropdownClass="bg-white border-slate-200 shadow-lg"
                                                                    searchClass="bg-white border-slate-200"
                                                                    enableSearch={true}
                                                                    disableSearchIcon={false}
                                                                    searchPlaceholder="Search countries..."
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="group space-y-3">
                                                            <Label htmlFor="companyLocation" className="text-sm font-medium text-gray-700 wark:text-gray-300">
                                                                Company Location
                                                            </Label>
                                                            <div className="relative">
                                                                <Input
                                                                    id="companyLocation"
                                                                    placeholder="City, Country"
                                                                    value={companyForm.location}
                                                                    onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })}
                                                                    className="pl-10 transition-all duration-200 focus:shadow-md"
                                                                />
                                                                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <Label htmlFor="companySize" className="text-sm font-medium text-gray-700 wark:text-gray-300">
                                                                Company Size
                                                            </Label>
                                                            <Select
                                                                value={companyForm.size}
                                                                onValueChange={(value) => setCompanyForm({ ...companyForm, size: value })}
                                                            >
                                                                <SelectTrigger className="transition-all duration-200 focus:shadow-md">
                                                                    <div className="flex items-center gap-2">
                                                                        <Users className="h-4 w-4 text-muted-foreground" />
                                                                        <SelectValue placeholder="Select company size" />
                                                                    </div>
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
                                                    </div>

                                                    <div className="space-y-6">
                                                        <div className="space-y-3">
                                                            <Label htmlFor="address" className="text-sm font-medium text-gray-700 wark:text-gray-300">
                                                                Company Address
                                                            </Label>
                                                            <Textarea
                                                                id="address"
                                                                value={companyForm.address}
                                                                onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                                                                placeholder="Enter company address"
                                                                rows={3}
                                                                className="resize-none transition-all duration-200 focus:shadow-md"
                                                            />
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-3">
                                                                <Label htmlFor="industry" className="text-sm font-medium text-gray-700 wark:text-gray-300">
                                                                    Industry
                                                                </Label>
                                                                <Select
                                                                    value={companyForm.industry}
                                                                    onValueChange={(value) => setCompanyForm({ ...companyForm, industry: value })}
                                                                >
                                                                    <SelectTrigger className="transition-all duration-200 focus:shadow-md">
                                                                        <div className="flex items-center gap-2">
                                                                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                                                                            <SelectValue placeholder="Select industry" />
                                                                        </div>
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

                                                            <div className="space-y-3">
                                                                <Label htmlFor="companyCategory" className="text-sm font-medium text-gray-700 wark:text-gray-300">
                                                                    Category
                                                                </Label>
                                                                <Select
                                                                    value={companyForm.category}
                                                                    onValueChange={(value) => setCompanyForm({ ...companyForm, category: value })}
                                                                    disabled={!companyForm.industry}
                                                                >
                                                                    <SelectTrigger className="transition-all duration-200 focus:shadow-md">
                                                                        <div className="flex items-center gap-2">
                                                                            <BiCategory className="h-4 w-4 text-muted-foreground" />
                                                                            <SelectValue placeholder={companyForm.industry ? "Select category" : "Select industry first"} />
                                                                        </div>
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {availableCategories.map((category) => (
                                                                            <SelectItem key={category} value={category}>
                                                                                {category}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>

                                                        {/* Company stats */}
                                                        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 wark:from-blue-900/20 wark:to-cyan-900/20 border border-blue-200 wark:border-blue-800">
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <div className="p-2 rounded-lg bg-blue-100 wark:bg-blue-900/40">
                                                                    <Activity className="h-4 w-4 text-blue-600" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-medium text-blue-900 wark:text-blue-100">Company Profile</h4>
                                                                    <p className="text-sm text-blue-700 wark:text-blue-300">Profile completion status</p>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-sm text-blue-700 wark:text-blue-300">Completion</span>
                                                                    <span className="text-sm font-medium text-blue-900 wark:text-blue-100">
                                                                        {Math.round(
                                                                            (Object.values(companyForm).filter(value => value && value.trim() !== '').length / Object.keys(companyForm).length) * 100
                                                                        )}%
                                                                    </span>
                                                                </div>
                                                                <div className="w-full bg-blue-200 wark:bg-blue-800 rounded-full h-2">
                                                                    <div
                                                                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                                                                        style={{
                                                                            width: `${Math.round(
                                                                                (Object.values(companyForm).filter(value => value && value.trim() !== '').length / Object.keys(companyForm).length) * 100
                                                                            )}%`
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end pt-6 border-t">
                                                    <Button
                                                        onClick={handleCompanyUpdate}
                                                        disabled={isUpdatingCompany}
                                                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transition-all duration-200"
                                                    >
                                                        {isUpdatingCompany ? (
                                                            <>
                                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                Saving...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Save className="h-4 w-4 mr-2" />
                                                                Save Company Info
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Security Section */}
                                    {activeSection === 'security' && (
                                        <div className="space-y-6">
                                            <Card className="border-0 shadow-lg">
                                                <CardHeader className="pb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
                                                            <Shield className="h-6 w-6 text-red-500" />
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-xl">Account Security</CardTitle>
                                                            <CardDescription>
                                                                Manage your account security and privacy settings
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-6">
                                                    <div className="grid gap-4">
                                                        <div className="group p-6 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 wark:bg-green-900/40">
                                                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-medium">Password Security</h4>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            Your password is secure and up to date
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                                                                    <DialogTrigger asChild>
                                                                        <Button variant="outline" size="sm" className="hover:shadow-md transition-all duration-200">
                                                                            <KeyRound className="h-4 w-4 mr-2" />
                                                                            Change
                                                                        </Button>
                                                                    </DialogTrigger>
                                                                    <DialogContent className="sm:max-w-md">
                                                                        <DialogHeader>
                                                                            <DialogTitle className="flex items-center gap-2">
                                                                                <Lock className="h-5 w-5" />
                                                                                Change Password
                                                                            </DialogTitle>
                                                                            <DialogDescription>
                                                                                Enter your current password and choose a new secure password
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
                                                                                        className="pr-10"
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
                                                                                        className="pr-10"
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
                                                                                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
                                                                            >
                                                                                {isChangingPassword ? (
                                                                                    <>
                                                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                                        Changing...
                                                                                    </>
                                                                                ) : (
                                                                                    "Change Password"
                                                                                )}
                                                                            </Button>
                                                                        </DialogFooter>
                                                                    </DialogContent>
                                                                </Dialog>
                                                            </div>
                                                        </div>

                                                        <div className="group p-6 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 wark:bg-amber-900/40">
                                                                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-medium">Two-Factor Authentication</h4>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            Add an extra layer of security to your account
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <Button variant="outline" size="sm" disabled className="opacity-50">
                                                                    <Shield className="h-4 w-4 mr-2" />
                                                                    Coming Soon
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        <div className="group p-6 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 wark:bg-blue-900/40">
                                                                        <Users className="h-5 w-5 text-blue-600" />
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-medium">Active Sessions</h4>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            Monitor and manage your active login sessions
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <Button variant="outline" size="sm" disabled className="opacity-50">
                                                                    <Activity className="h-4 w-4 mr-2" />
                                                                    Coming Soon
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Danger Zone - Only for Owners */}
                                            {userData?.isOwner && (
                                                <Card className="border-red-200 bg-red-50/50 wark:bg-red-900/10">
                                                    <CardHeader>
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
                                                                <AlertTriangle className="h-6 w-6 text-red-500" />
                                                            </div>
                                                            <div>
                                                                <CardTitle className="text-xl text-red-700 wark:text-red-300">Danger Zone</CardTitle>
                                                                <CardDescription className="text-red-600 wark:text-red-400">
                                                                    Actions that can permanently affect your account
                                                                </CardDescription>
                                                            </div>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="p-6 rounded-xl border border-red-300 bg-white wark:bg-red-900/20">
                                                            <div className="flex items-center justify-between">
                                                                <div className="space-y-1">
                                                                    <h4 className="font-medium text-red-700 wark:text-red-300">Delete Company Account</h4>
                                                                    <p className="text-sm text-red-600 wark:text-red-400">
                                                                        Permanently delete your company and all associated data. This action cannot be undone.</p>
                                                                </div>
                                                                <Button variant="destructive" size="sm" disabled className="opacity-50">
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Delete Company
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}