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
import { Plus, Edit, Trash2, Save, Globe, DollarSign, Shield, MessageSquare, CheckCircle, Search, Filter, X, RefreshCw, Target, IndianRupee } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DefaultTemplateRate {
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
    { code: 'ZA', name: 'South Africa', currency: 'ZAR', flag: '🇿🇦' },
    { code: 'EG', name: 'Egypt', currency: 'EGP', flag: '🇪🇬' },
    { code: 'NG', name: 'Nigeria', currency: 'NGN', flag: '🇳🇬' },
    { code: 'KE', name: 'Kenya', currency: 'KES', flag: '🇰🇪' },
    { code: 'GH', name: 'Ghana', currency: 'GHS', flag: '🇬🇭' },
    { code: 'TR', name: 'Turkey', currency: 'TRY', flag: '🇹🇷' },
    { code: 'IL', name: 'Israel', currency: 'ILS', flag: '🇮🇱' },
    { code: 'RU', name: 'Russia', currency: 'RUB', flag: '🇷🇺' },
    { code: 'PL', name: 'Poland', currency: 'PLN', flag: '🇵🇱' },
    { code: 'CZ', name: 'Czech Republic', currency: 'CZK', flag: '🇨🇿' },
    { code: 'HU', name: 'Hungary', currency: 'HUF', flag: '🇭🇺' },
    { code: 'RO', name: 'Romania', currency: 'RON', flag: '🇷🇴' },
    { code: 'PT', name: 'Portugal', currency: 'EUR', flag: '🇵🇹' },
    { code: 'GR', name: 'Greece', currency: 'EUR', flag: '🇬🇷' },
    { code: 'SE', name: 'Sweden', currency: 'SEK', flag: '🇸🇪' },
    { code: 'NO', name: 'Norway', currency: 'NOK', flag: '🇳🇴' },
    { code: 'DK', name: 'Denmark', currency: 'DKK', flag: '🇩🇰' },
    { code: 'CH', name: 'Switzerland', currency: 'CHF', flag: '🇨🇭' },
    { code: 'AT', name: 'Austria', currency: 'EUR', flag: '🇦🇹' },
    { code: 'BE', name: 'Belgium', currency: 'EUR', flag: '🇧🇪' },
];

export default function AdminDefaultTemplateRatesPage() {
    const [templateRates, setTemplateRates] = useState<DefaultTemplateRate[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingRate, setEditingRate] = useState<DefaultTemplateRate | null>(null);
    const [isRateDialogOpen, setIsRateDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('marketing');
    const [showFilters, setShowFilters] = useState(false);

    // Filter states
    const [filters, setFilters] = useState({
        search: '',
        currency: '',
        status: '',
        country: ''
    });

    const { toast } = useToast();

    // Load default template rates on mount
    useEffect(() => {
        loadDefaultTemplateRates();
    }, []);

    const loadDefaultTemplateRates = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/default-template-rates');
            if (response.ok) {
                const data = await response.json();
                setTemplateRates(data.rates || []);
            } else {
                toast({
                    title: "Error",
                    description: "Failed to load default template rates",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error loading default template rates:', error);
            toast({
                title: "Error",
                description: "Error loading default template rates",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Filtered template rates
    const filteredTemplateRates = useMemo(() => {
        return templateRates.filter(rate => {
            // Search filter (country name or code)
            if (filters.search &&
                !rate.countryName.toLowerCase().includes(filters.search.toLowerCase()) &&
                !rate.countryCode.toLowerCase().includes(filters.search.toLowerCase())) {
                return false;
            }

            // Currency filter
            if (filters.currency && rate.currency !== filters.currency) {
                return false;
            }

            // Status filter
            if (filters.status === 'active' && !rate.isActive) {
                return false;
            }
            if (filters.status === 'inactive' && rate.isActive) {
                return false;
            }

            // Country filter
            if (filters.country && rate.countryCode !== filters.country) {
                return false;
            }

            return true;
        });
    }, [templateRates, filters]);

    const uniqueCurrencies = useMemo(() => {
        return [...new Set(templateRates.map(r => r.currency))].sort();
    }, [templateRates]);

    const createNewRate = (): DefaultTemplateRate => ({
        countryCode: '',
        countryName: '',
        currency: 'INR',
        rates: {
            marketing: {
                interaktPrice: 0.25,
                marginPercentage: 20,
                platformPrice: 0.30
            },
            authentication: {
                interaktPrice: 0.15,
                marginPercentage: 20,
                platformPrice: 0.18
            },
            utility: {
                interaktPrice: 0.20,
                marginPercentage: 20,
                platformPrice: 0.24
            }
        },
        isActive: true,
        lastUpdated: new Date()
    });

    const openRateDialog = (rate?: DefaultTemplateRate) => {
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

    const removeRate = async (countryCode: string) => {
        const rate = templateRates.find(r => r.countryCode === countryCode);
        if (!rate) return;

        try {
            const response = await fetch(`/api/admin/default-template-rates?countryCode=${countryCode}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: `Default rate for ${rate.countryName} deleted successfully`,
                });
                const updatedRates = templateRates.filter(r => r.countryCode !== countryCode);
                setTemplateRates(updatedRates);
            } else {
                toast({
                    title: "Error",
                    description: "Failed to delete default template rate",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error deleting rate:', error);
            toast({
                title: "Error",
                description: "Error deleting default template rate",
                variant: "destructive",
            });
        }
    };

    const saveDefaultTemplateRates = async () => {
        // Validate rates
        for (let i = 0; i < templateRates.length; i++) {
            const rate = templateRates[i];
            if (!rate.countryCode || !rate.countryName) {
                toast({
                    title: "Error",
                    description: `Please fill in all required fields for rate ${i + 1}`,
                    variant: "destructive",
                });
                return;
            }
        }

        try {
            setSaving(true);
            const response = await fetch('/api/admin/default-template-rates', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    rates: templateRates
                }),
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Default template rates saved successfully",
                });
                loadDefaultTemplateRates(); // Reload to get updated data
            } else {
                const error = await response.json();
                toast({
                    title: "Error",
                    description: error.error || "Failed to save default template rates",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error saving default template rates:', error);
            toast({
                title: "Error",
                description: "Error saving default template rates",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const getRateByType = (rate: DefaultTemplateRate, type: string) => {
        return rate.rates[type as keyof typeof rate.rates];
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            currency: '',
            status: '',
            country: ''
        });
    };

    const hasActiveFilters = Object.values(filters).some(value => value !== '');

    return (
        <div className="container mx-auto px-6 py-8 space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">Default Template Message Rates</h1>
                <p className="text-muted-foreground text-lg">
                    Configure global default template message rates. These are used as fallback when companies don&apos;t have specific rates configured.
                </p>
            </div>

            {/* Main Content */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Global Default Rates
                            </CardTitle>
                            <CardDescription>
                                Manage default pricing for marketing, authentication, and utility templates
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
                                onClick={loadDefaultTemplateRates}
                                disabled={loading}
                                className="gap-2"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <Button onClick={() => openRateDialog()} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add Rate
                            </Button>
                            <Button
                                onClick={saveDefaultTemplateRates}
                                disabled={saving || loading}
                                variant="default"
                                className="gap-2"
                            >
                                <Save className="h-4 w-4" />
                                {saving ? 'Saving...' : 'Save All Changes'}
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                {/* Filters Panel */}
                {showFilters && (
                    <CardContent className="border-t bg-muted/50">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium">Filter Default Rates</h3>
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
                                            placeholder="Search countries..."
                                            value={filters.search}
                                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                            className="pl-8"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="currency">Currency</Label>
                                    <Select
                                        value={filters.currency}
                                        onValueChange={(value) => setFilters(prev => ({ ...prev, currency: value }))}
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
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={filters.status}
                                        onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
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
                                    <Label htmlFor="country">Country</Label>
                                    <Select
                                        value={filters.country}
                                        onValueChange={(value) => setFilters(prev => ({ ...prev, country: value }))}
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
                )}

                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center space-y-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                <p className="text-muted-foreground">Loading default template rates...</p>
                            </div>
                        </div>
                    ) : filteredTemplateRates.length === 0 ? (
                        <div className="text-center py-12">
                            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">
                                {hasActiveFilters ? 'No rates match your filters' : 'No default rates configured'}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                {hasActiveFilters
                                    ? 'Try adjusting your search criteria or clearing filters.'
                                    : 'Get started by adding your first default template rate configuration'
                                }
                            </p>
                            {hasActiveFilters ? (
                                <Button onClick={clearFilters} variant="outline">
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
                        <div className="space-y-6">
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>Showing {filteredTemplateRates.length} of {templateRates.length} rates</span>
                            </div>

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
                                    </TabsContent>
                                ))}
                            </Tabs>

                            {/* Information Panel */}
                            <Alert>
                                <Target className="h-4 w-4" />
                                <AlertDescription>
                                    <div className="space-y-2">
                                        <p className="font-medium">How Default Rates Work:</p>
                                        <ul className="text-sm space-y-1 ml-4 list-disc">
                                            <li>Default rates are used when a company doesn&apos;t have specific template rates configured for a country</li>
                                            <li>The system first looks for company-specific rates, then falls back to these default rates</li>
                                            <li>Platform Price is automatically calculated: Interakt Price × (1 + Margin %)</li>
                                            <li>These rates ensure consistent pricing across all customers for countries without specific configurations</li>
                                            <li>Inactive rates won&apos;t be used in calculations - useful for temporarily disabling rates</li>
                                        </ul>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Rate Dialog */}
            <Dialog open={isRateDialogOpen} onOpenChange={setIsRateDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            {editingRate && templateRates.find(r => r.countryCode === editingRate.countryCode)
                                ? 'Edit Default Template Rate'
                                : 'Add New Default Template Rate'
                            }
                        </DialogTitle>
                        <DialogDescription>
                            Configure default pricing for all template message types for this country
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
                                <h3 className="text-lg font-semibold">Default Rate Configuration</h3>

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
                            Save Default Rate Configuration
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}