'use client';

import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit, Trash2, Save, Building2, Globe, DollarSign, Shield, MessageSquare, CheckCircle, Settings, Search, Filter, X, RefreshCw, Wallet, CreditCard, IndianRupee } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TemplateRate {
    countryCode: string;
    countryName: string;
    currency: string;
    rates: {
        marketing: {
            interaktPrice: number;
            marginPercentage: number;
            platformPrice: number;
        };
        authentication: {
            interaktPrice: number;
            marginPercentage: number;
            platformPrice: number;
        };
        utility: {
            interaktPrice: number;
            marginPercentage: number;
            platformPrice: number;
        };
    };
    isActive: boolean;
    lastUpdated: Date;
}

interface Company {
    _id: string;
    name: string;
    industry?: string;
    category?: string;
    location?: string;
    subscriptionPlan?: string;
    subscriptionStatus?: string;
    walletBalance: number;
    currency?: string;
    templateRates?: TemplateRate[];
    createdAt?: Date;
    isActive?: boolean;
}

interface Filters {
    search: string;
    industry: string;
    category: string;
    location: string;
    subscriptionPlan: string;
    subscriptionStatus: string;
    hasRates: string;
    rateStatus: string;
}

interface WalletUpdate {
    companyId: string;
    companyName: string;
    currentBalance: number;
    newBalance: number;
    currency: string;
}

// ... (keep all the countries array the same)
const countries = [
    { code: 'IN', name: 'India', currency: 'INR', flag: '🇮🇳' },
    { code: 'US', name: 'United States', currency: 'USD', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', currency: 'GBP', flag: '🇬🇧' },
    { code: 'AU', name: 'Australia', currency: 'AUD', flag: '🇦🇺' },
    { code: 'CA', name: 'Canada', currency: 'CAD', flag: '🇨🇦' },
    { code: 'SG', name: 'Singapore', currency: 'SGD', flag: '🇸🇬' },
    { code: 'AE', name: 'United Arab Emirates', currency: 'AED', flag: '🇦🇪' },
    { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', flag: '🇸🇦' },
    { code: 'FR', name: 'France', currency: 'EUR', flag: '🇫🇷' },
    { code: 'DE', name: 'Germany', currency: 'EUR', flag: '🇩🇪' },
    { code: 'IT', name: 'Italy', currency: 'EUR', flag: '🇮🇹' },
    { code: 'ES', name: 'Spain', currency: 'EUR', flag: '🇪🇸' },
    { code: 'NL', name: 'Netherlands', currency: 'EUR', flag: '🇳🇱' },
    { code: 'BR', name: 'Brazil', currency: 'BRL', flag: '🇧🇷' },
    { code: 'MX', name: 'Mexico', currency: 'MXN', flag: '🇲🇽' },
    { code: 'JP', name: 'Japan', currency: 'JPY', flag: '🇯🇵' },
    { code: 'KR', name: 'South Korea', currency: 'KRW', flag: '🇰🇷' },
    { code: 'CN', name: 'China', currency: 'CNY', flag: '🇨🇳' },
    { code: 'TH', name: 'Thailand', currency: 'THB', flag: '🇹🇭' },
    { code: 'MY', name: 'Malaysia', currency: 'MYR', flag: '🇲🇾' },
    { code: 'ID', name: 'Indonesia', currency: 'IDR', flag: '🇮🇩' },
    { code: 'PH', name: 'Philippines', currency: 'PHP', flag: '🇵🇭' },
    { code: 'VN', name: 'Vietnam', currency: 'VND', flag: '🇻🇳' },
];

export default function AdminTemplateRatesPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [templateRates, setTemplateRates] = useState<TemplateRate[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingRate, setEditingRate] = useState<TemplateRate | null>(null);
    const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
    const [isRateDialogOpen, setIsRateDialogOpen] = useState(false);
    const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);
    const [walletUpdate, setWalletUpdate] = useState<WalletUpdate | null>(null);
    const [activeTab, setActiveTab] = useState('marketing');
    const [showFilters, setShowFilters] = useState(false);

    // Filter states
    const [filters, setFilters] = useState<Filters>({
        search: '',
        industry: '',
        category: '',
        location: '',
        subscriptionPlan: '',
        subscriptionStatus: '',
        hasRates: '',
        rateStatus: ''
    });

    // Rate filters
    const [rateFilters, setRateFilters] = useState({
        search: '',
        currency: '',
        status: '',
        country: ''
    });

    const { toast } = useToast();

    // Load companies on mount
    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/companies');
            if (response.ok) {
                const data = await response.json();
                setCompanies(data.companies || []);
            } else {
                toast({
                    title: "Error",
                    description: "Failed to load companies",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error loading companies:', error);
            toast({
                title: "Error",
                description: "Error loading companies",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const loadTemplateRates = async (companyId: string) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/admin/template-rates?companyId=${companyId}`);
            if (response.ok) {
                const data = await response.json();
                setTemplateRates(data.rates || []);
            } else {
                toast({
                    title: "Error",
                    description: "Failed to load template rates",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error loading template rates:', error);
            toast({
                title: "Error",
                description: "Error loading template rates",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    // Wallet management functions
    const openWalletDialog = (company: Company) => {
        setWalletUpdate({
            companyId: company._id,
            companyName: company.name,
            currentBalance: company.walletBalance,
            newBalance: company.walletBalance,
            currency: company.currency || 'INR'
        });
        setIsWalletDialogOpen(true);
    };

    const updateWalletBalance = async () => {
        if (!walletUpdate) return;

        try {
            setSaving(true);
            const response = await fetch('/api/admin/companies', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    companyId: walletUpdate.companyId,
                    walletBalance: walletUpdate.newBalance,
                    currency: walletUpdate.currency
                }),
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Wallet balance updated successfully",
                });
                await loadCompanies(); // Refresh companies data
                setIsWalletDialogOpen(false);
                setWalletUpdate(null);
            } else {
                const error = await response.json();
                toast({
                    title: "Error",
                    description: error.error || "Failed to update wallet balance",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error updating wallet balance:', error);
            toast({
                title: "Error",
                description: "Error updating wallet balance",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    // Filtered companies based on search and filters
    const filteredCompanies = useMemo(() => {
        return companies.filter(company => {
            // Search filter
            if (filters.search && !company.name.toLowerCase().includes(filters.search.toLowerCase())) {
                return false;
            }

            // Industry filter
            if (filters.industry && company.industry !== filters.industry) {
                return false;
            }

            // Category filter
            if (filters.category && company.category !== filters.category) {
                return false;
            }

            // Location filter
            if (filters.location && company.location !== filters.location) {
                return false;
            }

            // Subscription plan filter
            if (filters.subscriptionPlan && company.subscriptionPlan !== filters.subscriptionPlan) {
                return false;
            }

            // Subscription status filter
            if (filters.subscriptionStatus && company.subscriptionStatus !== filters.subscriptionStatus) {
                return false;
            }

            // Has rates filter
            if (filters.hasRates === 'yes' && (!company.templateRates || company.templateRates.length === 0)) {
                return false;
            }
            if (filters.hasRates === 'no' && company.templateRates && company.templateRates.length > 0) {
                return false;
            }

            // Rate status filter
            if (filters.rateStatus === 'active' && (!company.templateRates || !company.templateRates.some(rate => rate.isActive))) {
                return false;
            }
            if (filters.rateStatus === 'inactive' && company.templateRates && company.templateRates.some(rate => rate.isActive)) {
                return false;
            }

            return true;
        });
    }, [companies, filters]);

    // Filtered template rates
    const filteredTemplateRates = useMemo(() => {
        return templateRates.filter(rate => {
            // Search filter (country name or code)
            if (rateFilters.search &&
                !rate.countryName.toLowerCase().includes(rateFilters.search.toLowerCase()) &&
                !rate.countryCode.toLowerCase().includes(rateFilters.search.toLowerCase())) {
                return false;
            }

            // Currency filter
            if (rateFilters.currency && rate.currency !== rateFilters.currency) {
                return false;
            }

            // Status filter
            if (rateFilters.status === 'active' && !rate.isActive) {
                return false;
            }
            if (rateFilters.status === 'inactive' && rate.isActive) {
                return false;
            }

            // Country filter
            if (rateFilters.country && rate.countryCode !== rateFilters.country) {
                return false;
            }

            return true;
        });
    }, [templateRates, rateFilters]);

    // Get unique values for filter dropdowns
    const uniqueIndustries = useMemo(() => {
        return [...new Set(companies.filter(c => c.industry).map(c => c.industry))];
    }, [companies]);

    const uniqueCategories = useMemo(() => {
        return [...new Set(companies.filter(c => c.category).map(c => c.category))];
    }, [companies]);

    const uniqueLocations = useMemo(() => {
        return [...new Set(companies.filter(c => c.location).map(c => c.location))];
    }, [companies]);

    const uniqueCurrencies = useMemo(() => {
        return [...new Set(templateRates.map(r => r.currency))].sort();
    }, [templateRates]);

    const openManageDialog = async (company: Company) => {
        setSelectedCompany(company);
        setIsManageDialogOpen(true);
        await loadTemplateRates(company._id);
    };

    const createNewRate = (): TemplateRate => ({
        countryCode: '',
        countryName: '',
        currency: 'INR',
        rates: {
            marketing: {
                interaktPrice: 0,
                marginPercentage: 20,
                platformPrice: 0
            },
            authentication: {
                interaktPrice: 0,
                marginPercentage: 20,
                platformPrice: 0
            },
            utility: {
                interaktPrice: 0,
                marginPercentage: 20,
                platformPrice: 0
            }
        },
        isActive: true,
        lastUpdated: new Date()
    });

    const openRateDialog = (rate?: TemplateRate) => {
        setEditingRate(rate || createNewRate());
        setIsRateDialogOpen(true);
    };

    const updateEditingRate = (field: string, value: any) => {
        if (!editingRate) return;

        console.log('Updating field:', field, 'with value:', value); // Debug log

        setEditingRate(prevRate => {
            if (!prevRate) return null;

            const updatedRate = { ...prevRate };

            if (field.includes('.')) {
                const [parent, child, grandchild] = field.split('.');
                if (grandchild) {
                    if (!updatedRate[parent]) updatedRate[parent] = {};
                    if (!updatedRate[parent][child]) updatedRate[parent][child] = {};
                    updatedRate[parent][child][grandchild] = value;

                    // Auto-calculate platform price when interakt price or margin changes
                    if (grandchild === 'interaktPrice' || grandchild === 'marginPercentage') {
                        const rate = updatedRate[parent][child];
                        rate.platformPrice = rate.interaktPrice * (1 + rate.marginPercentage / 100);
                    }
                } else {
                    if (!updatedRate[parent]) updatedRate[parent] = {};
                    updatedRate[parent][child] = value;
                }
            } else {
                updatedRate[field] = value;
            }

            console.log('Updated rate:', updatedRate); // Debug log
            return updatedRate;
        });
    };

    const saveRate = () => {
        if (!editingRate || !editingRate.countryCode || !editingRate.countryName) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields",
                variant: "destructive"
            });
            return;
        }

        const existingIndex = templateRates.findIndex(r => r.countryCode === editingRate.countryCode);
        let updatedRates;

        if (existingIndex >= 0) {
            updatedRates = [...templateRates];
            updatedRates[existingIndex] = { ...editingRate, lastUpdated: new Date() };
        } else {
            updatedRates = [...templateRates, { ...editingRate, lastUpdated: new Date() }];
        }

        setTemplateRates(updatedRates);
        setIsRateDialogOpen(false);
        setEditingRate(null);
    };

    const removeRate = (countryCode: string) => {
        const updatedRates = templateRates.filter(rate => rate.countryCode !== countryCode);
        setTemplateRates(updatedRates);
    };

    const saveTemplateRates = async () => {
        if (!selectedCompany) {
            toast({
                title: "Error",
                description: "Please select a company first",
                variant: "destructive"
            });
            return;
        }

        try {
            setSaving(true);
            const response = await fetch('/api/admin/template-rates', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    companyId: selectedCompany._id,
                    rates: templateRates
                }),
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Template rates saved successfully",
                });
                // Refresh the company data
                await loadCompanies();
            } else {
                const error = await response.json();
                toast({
                    title: "Error",
                    description: error.error || "Failed to save template rates",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error('Error saving template rates:', error);
            toast({
                title: "Error",
                description: "Error saving template rates",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    const getRateByType = (rate: TemplateRate, type: string) => {
        return rate.rates[type as keyof typeof rate.rates];
    };

    const getCompanyRatesCount = (company: Company) => {
        return company.templateRates?.length || 0;
    };

    const getCompanyActiveRatesCount = (company: Company) => {
        return company.templateRates?.filter(rate => rate.isActive).length || 0;
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            industry: '',
            category: '',
            location: '',
            subscriptionPlan: '',
            subscriptionStatus: '',
            hasRates: '',
            rateStatus: ''
        });
    };

    const clearRateFilters = () => {
        setRateFilters({
            search: '',
            currency: '',
            status: '',
            country: ''
        });
    };

    const hasActiveFilters = Object.values(filters).some(value => value !== '');
    const hasActiveRateFilters = Object.values(rateFilters).some(value => value !== '');

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    return (
        <div className="container mx-auto px-6 py-8 space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">Template Message Rates</h1>
                <p className="text-muted-foreground text-lg">
                    Manage WhatsApp template message pricing and wallet balances for all companies
                </p>
            </div>

            {/* Companies Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Companies
                            </CardTitle>
                            <CardDescription>
                                View and manage template rates and wallet balances for all registered companies
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                                className="gap-2"
                            >
                                <Filter className="h-4 w-4" />
                                Filters
                                {hasActiveFilters && (
                                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                                        {Object.values(filters).filter(v => v !== '').length}
                                    </Badge>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={loadCompanies}
                                disabled={loading}
                                className="gap-2"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                {/* Filters Panel */}
                {showFilters && (
                    <CardContent className="border-t bg-muted/50">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium">Filter Companies</h3>
                                {hasActiveFilters && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="gap-2 text-muted-foreground"
                                    >
                                        <X className="h-3 w-3" />
                                        Clear All
                                    </Button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="search">Search</Label>
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="search"
                                            placeholder="Search companies..."
                                            value={filters.search}
                                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                            className="pl-8"
                                        />
                                    </div>
                                </div>
                                {/* ... (keep all other filter inputs the same) */}
                                <div className="space-y-2">
                                    <Label htmlFor="industry">Industry</Label>
                                    <Select
                                        value={filters.industry}
                                        onValueChange={(value) => setFilters(prev => ({ ...prev, industry: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All industries" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All">All industries</SelectItem>
                                            {uniqueIndustries.map(industry => (
                                                <SelectItem key={industry} value={industry!}>
                                                    {industry}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        value={filters.category}
                                        onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All">All categories</SelectItem>
                                            {uniqueCategories.map(category => (
                                                <SelectItem key={category} value={category!}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Select
                                        value={filters.location}
                                        onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All locations" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All">All locations</SelectItem>
                                            {uniqueLocations.map(location => (
                                                <SelectItem key={location} value={location!}>
                                                    {location}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subscription-plan">Subscription Plan</Label>
                                    <Select
                                        value={filters.subscriptionPlan}
                                        onValueChange={(value) => setFilters(prev => ({ ...prev, subscriptionPlan: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All plans" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All">All plans</SelectItem>
                                            <SelectItem value="free">Free</SelectItem>
                                            <SelectItem value="starter">Starter</SelectItem>
                                            <SelectItem value="growth">Growth</SelectItem>
                                            <SelectItem value="advanced">Advanced</SelectItem>
                                            <SelectItem value="enterprise">Enterprise</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subscription-status">Subscription Status</Label>
                                    <Select
                                        value={filters.subscriptionStatus}
                                        onValueChange={(value) => setFilters(prev => ({ ...prev, subscriptionStatus: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All">All statuses</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="expired">Expired</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="has-rates">Has Rates</Label>
                                    <Select
                                        value={filters.hasRates}
                                        onValueChange={(value) => setFilters(prev => ({ ...prev, hasRates: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All companies" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All">All companies</SelectItem>
                                            <SelectItem value="yes">With rates</SelectItem>
                                            <SelectItem value="no">Without rates</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rate-status">Rates Status</Label>
                                    <Select
                                        value={filters.rateStatus}
                                        onValueChange={(value) => setFilters(prev => ({ ...prev, rateStatus: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="All rates" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All">All rates</SelectItem>
                                            <SelectItem value="active">Has active rates</SelectItem>
                                            <SelectItem value="inactive">No active rates</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                )}

                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center space-y-4">
                                <p className="text-muted-foreground">Loading companies...</p>
                            </div>
                        </div>
                    ) : filteredCompanies.length === 0 ? (
                        <div className="text-center py-12">
                            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">
                                {hasActiveFilters ? 'No companies match your filters' : 'No companies found'}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                {hasActiveFilters
                                    ? 'Try adjusting your search criteria or clearing filters.'
                                    : 'No companies are registered in the system yet.'
                                }
                            </p>
                            {hasActiveFilters && (
                                <Button onClick={clearFilters} variant="outline">
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>Showing {filteredCompanies.length} of {companies.length} companies</span>
                            </div>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Company Name</TableHead>
                                            <TableHead>Industry</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead>Plan</TableHead>
                                            <TableHead>Wallet Balance</TableHead>
                                            <TableHead>Total Rates</TableHead>
                                            <TableHead>Active Rates</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredCompanies.map((company) => {
                                            const totalRates = getCompanyRatesCount(company);
                                            const activeRates = getCompanyActiveRatesCount(company);

                                            return (
                                                <TableRow key={company._id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                                            <div>
                                                                <div className="font-medium">{company.name}</div>
                                                                <div className="text-sm text-muted-foreground">ID: {company._id}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {company.industry ? (
                                                            <Badge variant="outline">{company.industry}</Badge>
                                                        ) : (
                                                            <span className="text-muted-foreground">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {company.location ? (
                                                            <Badge variant="outline">{company.location}</Badge>
                                                        ) : (
                                                            <span className="text-muted-foreground">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {company.subscriptionPlan ? (
                                                            <Badge variant="secondary" className="capitalize">
                                                                {company.subscriptionPlan}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-muted-foreground">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Wallet className="h-4 w-4 text-muted-foreground" />
                                                            <div>
                                                                <div className="font-medium">
                                                                    {formatCurrency(company.walletBalance, company.currency || 'INR')}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {company.currency || 'INR'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">
                                                            {totalRates} {totalRates === 1 ? 'rate' : 'rates'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={activeRates > 0 ? "default" : "secondary"}>
                                                            {activeRates} active
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={company.subscriptionStatus === 'active' ? "default" : "secondary"}>
                                                            {company.subscriptionStatus || 'Unknown'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {company.createdAt
                                                            ? new Date(company.createdAt).toLocaleDateString()
                                                            : 'N/A'
                                                        }
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => openWalletDialog(company)}
                                                                className="h-8 gap-2"
                                                            >
                                                                <CreditCard className="h-4 w-4" />
                                                                Wallet
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => openManageDialog(company)}
                                                                className="h-8 gap-2"
                                                            >
                                                                <Settings className="h-4 w-4" />
                                                                Rates
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Wallet Balance Dialog */}
            <Dialog open={isWalletDialogOpen} onOpenChange={setIsWalletDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Wallet className="h-5 w-5" />
                            Update Wallet Balance
                        </DialogTitle>
                        <DialogDescription>
                            Update the wallet balance for {walletUpdate?.companyName}
                        </DialogDescription>
                    </DialogHeader>

                    {walletUpdate && (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium">Current Balance</p>
                                        <p className="text-lg font-semibold">
                                            {formatCurrency(walletUpdate.currentBalance, walletUpdate.currency)}
                                        </p>
                                    </div>
                                    <Wallet className="h-8 w-8 text-muted-foreground" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="new-balance">New Balance</Label>
                                        <Input
                                            id="new-balance"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={walletUpdate.newBalance}
                                            onChange={(e) => setWalletUpdate(prev => prev ? {
                                                ...prev,
                                                newBalance: parseFloat(e.target.value) || 0
                                            } : null)}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="currency">Currency</Label>
                                        <Select
                                            value={walletUpdate.currency}
                                            onValueChange={(value) => setWalletUpdate(prev => prev ? {
                                                ...prev,
                                                currency: value
                                            } : null)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                                                <SelectItem value="USD">USD - US Dollar</SelectItem>
                                                <SelectItem value="EUR">EUR - Euro</SelectItem>
                                                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                                <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                                                <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                                                <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                                                <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                                                <SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {walletUpdate.newBalance !== walletUpdate.currentBalance && (
                                    <Alert>
                                        <AlertDescription>
                                            <div className="flex items-center justify-between">
                                                <span>Balance Change:</span>
                                                <span className={`font-medium ${walletUpdate.newBalance > walletUpdate.currentBalance
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                                    }`}>
                                                    {walletUpdate.newBalance > walletUpdate.currentBalance ? '+' : ''}
                                                    {formatCurrency(
                                                        walletUpdate.newBalance - walletUpdate.currentBalance,
                                                        walletUpdate.currency
                                                    )}
                                                </span>
                                            </div>
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsWalletDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={updateWalletBalance}
                            disabled={saving || !walletUpdate}
                        >
                            {saving ? 'Updating...' : 'Update Balance'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Manage Rates Dialog */}
            <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
                <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            Template Rates for {selectedCompany?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Manage pricing for marketing, authentication, and utility templates
                        </DialogDescription>
                    </DialogHeader>

                    {selectedCompany && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Badge variant="outline">
                                        {templateRates.length} {templateRates.length === 1 ? 'rate' : 'rates'} configured
                                    </Badge>
                                    {hasActiveRateFilters && (
                                        <Badge variant="secondary">
                                            {filteredTemplateRates.length} filtered
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {/* <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowFilters(!showFilters)}
                                        className="gap-2"
                                    >
                                        <Filter className="h-4 w-4" />
                                        Filter Rates
                                        {hasActiveRateFilters && (
                                            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                                                {Object.values(rateFilters).filter(v => v !== '').length}
                                            </Badge>
                                        )}
                                    </Button> */}
                                    <Button onClick={() => openRateDialog()} className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Add Rate
                                    </Button>
                                    <Button
                                        onClick={saveTemplateRates}
                                        disabled={saving || loading}
                                        variant="default"
                                        className="gap-2"
                                    >
                                        <Save className="h-4 w-4" />
                                        {saving ? 'Saving...' : 'Save All Changes'}
                                    </Button>
                                </div>
                            </div>

                            {/* Rate Filters */}
                            {showFilters && (
                                <Card className="bg-muted/50">
                                    <CardContent className="pt-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-medium">Filter Template Rates</h3>
                                                {hasActiveRateFilters && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={clearRateFilters}
                                                        className="gap-2 text-muted-foreground"
                                                    >
                                                        <X className="h-3 w-3" />
                                                        Clear All
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="rate-search">Search</Label>
                                                    <div className="relative">
                                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            id="rate-search"
                                                            placeholder="Search countries..."
                                                            value={rateFilters.search}
                                                            onChange={(e) => setRateFilters(prev => ({ ...prev, search: e.target.value }))}
                                                            className="pl-8"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="rate-currency">Currency</Label>
                                                    <Select
                                                        value={rateFilters.currency}
                                                        onValueChange={(value) => setRateFilters(prev => ({ ...prev, currency: value }))}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="All currencies" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="All">All currencies</SelectItem>
                                                            {uniqueCurrencies.map(currency => (
                                                                <SelectItem key={currency} value={currency}>
                                                                    {currency}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="rate-status">Status</Label>
                                                    <Select
                                                        value={rateFilters.status}
                                                        onValueChange={(value) => setRateFilters(prev => ({ ...prev, status: value }))}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="All statuses" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="All">All statuses</SelectItem>
                                                            <SelectItem value="active">Active</SelectItem>
                                                            <SelectItem value="inactive">Inactive</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="rate-country">Country</Label>
                                                    <Select
                                                        value={rateFilters.country}
                                                        onValueChange={(value) => setRateFilters(prev => ({ ...prev, country: value }))}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="All countries" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="All">All countries</SelectItem>
                                                            {countries.map(country => (
                                                                <SelectItem key={country.code} value={country.code}>
                                                                    <div className="flex items-center gap-2">
                                                                        <span>{country.flag}</span>
                                                                        {country.name}
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-center space-y-4">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                        <p className="text-muted-foreground">Loading template rates...</p>
                                    </div>
                                </div>
                            ) : filteredTemplateRates.length === 0 ? (
                                <div className="text-center py-12">
                                    <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">
                                        {hasActiveRateFilters ? 'No rates match your filters' : 'No rates configured'}
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        {hasActiveRateFilters
                                            ? 'Try adjusting your search criteria or clearing filters.'
                                            : 'Get started by adding your first template rate configuration'
                                        }
                                    </p>
                                    {hasActiveRateFilters ? (
                                        <Button onClick={clearRateFilters} variant="outline">
                                            Clear Filters
                                        </Button>
                                    ) : (
                                        <Button onClick={() => openRateDialog()} className="gap-2">
                                            <Plus className="h-4 w-4" />
                                            Add First Rate
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="marketing" className="gap-2">
                                            <MessageSquare className="h-4 w-4" />
                                            Marketing
                                        </TabsTrigger>
                                        <TabsTrigger value="authentication" className="gap-2">
                                            <Shield className="h-4 w-4" />
                                            Authentication
                                        </TabsTrigger>
                                        <TabsTrigger value="utility" className="gap-2">
                                            <CheckCircle className="h-4 w-4" />
                                            Utility
                                        </TabsTrigger>
                                    </TabsList>

                                    {['marketing', 'authentication', 'utility'].map((type) => (
                                        <TabsContent key={type} value={type} className="mt-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                    <span>Showing {filteredTemplateRates.length} of {templateRates.length} rates</span>
                                                </div>
                                                <div className="rounded-md border">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Country</TableHead>
                                                                <TableHead>Currency</TableHead>
                                                                <TableHead>Interakt Price</TableHead>
                                                                <TableHead>Margin %</TableHead>
                                                                <TableHead>Platform Price</TableHead>
                                                                <TableHead>Status</TableHead>
                                                                <TableHead>Last Updated</TableHead>
                                                                <TableHead className="text-right">Actions</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {filteredTemplateRates.map((rate) => {
                                                                const rateData = getRateByType(rate, type);
                                                                const country = countries.find(c => c.code === rate.countryCode);

                                                                return (
                                                                    <TableRow key={rate.countryCode}>
                                                                        <TableCell>
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-lg">{country?.flag}</span>
                                                                                <div>
                                                                                    <div className="font-medium">{rate.countryName}</div>
                                                                                    <div className="text-sm text-muted-foreground">{rate.countryCode}</div>
                                                                                </div>
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Badge variant="outline">{rate.currency}</Badge>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <div className="flex items-center gap-1">
                                                                                <IndianRupee className="h-3 w-3" />
                                                                                {rateData.interaktPrice.toFixed(4)}
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell>{rateData.marginPercentage}%</TableCell>
                                                                        <TableCell>
                                                                            <div className="flex items-center gap-1 font-medium">
                                                                                <IndianRupee className="h-3 w-3" />
                                                                                {rateData.platformPrice.toFixed(4)}
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Badge variant={rate.isActive ? "default" : "secondary"}>
                                                                                {rate.isActive ? "Active" : "Inactive"}
                                                                            </Badge>
                                                                        </TableCell>
                                                                        <TableCell className="text-sm text-muted-foreground">
                                                                            {new Date(rate.lastUpdated).toLocaleDateString()}
                                                                        </TableCell>
                                                                        <TableCell className="text-right">
                                                                            <div className="flex items-center justify-end gap-2">
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    onClick={() => openRateDialog(rate)}
                                                                                    className="h-8 w-8 p-0"
                                                                                >
                                                                                    <Edit className="h-4 w-4" />
                                                                                </Button>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    onClick={() => removeRate(rate.countryCode)}
                                                                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                                                                >
                                                                                    <Trash2 className="h-4 w-4" />
                                                                                </Button>
                                                                            </div>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                );
                                                            })}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    ))}
                                </Tabs>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Rate Dialog */}
            <Dialog open={isRateDialogOpen} onOpenChange={setIsRateDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            {editingRate && templateRates.find(r => r.countryCode === editingRate.countryCode)
                                ? 'Edit Template Rate'
                                : 'Add New Template Rate'
                            }
                        </DialogTitle>
                        <DialogDescription>
                            Configure pricing for all template message types for this country
                        </DialogDescription>
                    </DialogHeader>

                    {editingRate && (
                        <div className="space-y-6">
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="country">Country</Label>
                                    <select
                                        id="country"
                                        value={editingRate?.countryCode || ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            console.log('Country selected:', value); // Debug log

                                            if (value) {
                                                const selectedCountry = countries.find(c => c.code === value);
                                                console.log('Found country:', selectedCountry); // Debug log

                                                // Update all fields at once
                                                setEditingRate(prev => {
                                                    if (!prev) return null;
                                                    return {
                                                        ...prev,
                                                        countryCode: value,
                                                        countryName: selectedCountry?.name || '',
                                                        currency: selectedCountry?.currency || 'INR'
                                                    };
                                                });
                                            } else {
                                                setEditingRate(prev => {
                                                    if (!prev) return null;
                                                    return {
                                                        ...prev,
                                                        countryCode: '',
                                                        countryName: '',
                                                        currency: 'INR'
                                                    };
                                                });
                                            }
                                        }}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">Select country...</option>
                                        {countries
                                            .filter(country =>
                                                // Only show countries that are not already configured (except current one being edited)
                                                !templateRates.find(rate =>
                                                    rate.countryCode === country.code &&
                                                    rate.countryCode !== editingRate?.countryCode
                                                )
                                            )
                                            .map((country) => (
                                                <option key={country.code} value={country.code}>
                                                    {country.flag} {country.name} ({country.code})
                                                </option>
                                            ))
                                        }
                                    </select>
                                    {/* Debug display */}
                                    <div className="text-xs text-muted-foreground">
                                        Selected: {editingRate?.countryCode || 'None'} - {editingRate?.countryName || 'None'}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="currency">Currency</Label>
                                    <Input
                                        id="currency"
                                        value={editingRate.currency}
                                        onChange={(e) => updateEditingRate('currency', e.target.value)}
                                        placeholder="Currency code"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="status"
                                            checked={editingRate.isActive}
                                            onCheckedChange={(checked) => updateEditingRate('isActive', checked)}
                                        />
                                        <Label htmlFor="status">
                                            {editingRate.isActive ? 'Active' : 'Inactive'}
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Rate Configuration */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold">Rate Configuration</h3>

                                {[
                                    { key: 'marketing', title: 'Marketing Templates', icon: MessageSquare, color: 'bg-red-50 border-red-200' },
                                    { key: 'authentication', title: 'Authentication Templates', icon: Shield, color: 'bg-blue-50 border-blue-200' },
                                    { key: 'utility', title: 'Utility Templates', icon: CheckCircle, color: 'bg-green-50 border-green-200' }
                                ].map(({ key, title, icon: Icon, color }) => (
                                    <Card key={key} className={color}>
                                        <CardHeader className="pb-4">
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <Icon className="h-4 w-4" />
                                                {title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Interakt Price ({editingRate.currency})</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.0001"
                                                        value={editingRate.rates[key].interaktPrice}
                                                        onChange={(e) => updateEditingRate(`rates.${key}.interaktPrice`, parseFloat(e.target.value) || 0)}
                                                        placeholder="0.0000"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Margin Percentage (%)</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        value={editingRate.rates[key].marginPercentage}
                                                        onChange={(e) => updateEditingRate(`rates.${key}.marginPercentage`, parseFloat(e.target.value) || 0)}
                                                        placeholder="20.0"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Platform Price ({editingRate.currency})</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.0001"
                                                        value={editingRate.rates[key].platformPrice.toFixed(4)}
                                                        readOnly
                                                        className="bg-muted"
                                                    />
                                                </div>
                                            </div>
                                            <Alert>
                                                <AlertDescription>
                                                    Platform Price = Interakt Price × (1 + Margin %)
                                                </AlertDescription>
                                            </Alert>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={saveRate}>
                            Save Rate Configuration
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}