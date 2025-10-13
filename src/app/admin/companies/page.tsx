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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  Building2,
  Search,
  Filter,
  X,
  RefreshCw,
  Eye,
  Users,
  Wallet,
  CreditCard,
  Brain,
  Settings,
  MoreHorizontal,
  MapPin,
  Calendar,
  Activity
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';

interface Company {
  _id: string;
  name: string;
  address?: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string;
  category?: string;
  phone?: string;
  countryCode?: string;
  walletBalance: number;
  aiCredits: number;
  currency?: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  billingCycle?: string;
  lastPaymentId?: string;
  lastPaymentAmount?: number;
  lastPaymentDate?: Date;
  logo?: string;
  templateRates?: any[];
  createdAt: Date;
  updatedAt: Date;
  isActive?: boolean;
}

interface CompanyFilters {
  search: string;
  industry: string;
  category: string;
  location: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  hasRates: string;
  walletStatus: string;
  aiCreditsStatus: string;
  isActive: string;
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Filter states
  const [filters, setFilters] = useState<CompanyFilters>({
    search: '',
    industry: '',
    category: '',
    location: '',
    subscriptionPlan: '',
    subscriptionStatus: '',
    hasRates: '',
    walletStatus: '',
    aiCreditsStatus: '',
    isActive: ''
  });

  const [editingCompany, setEditingCompany] = useState<Partial<Company>>({});

  const { toast } = useToast();

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

  // Filtered companies
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

      // Wallet status filter
      if (filters.walletStatus === 'positive' && company.walletBalance <= 0) {
        return false;
      }
      if (filters.walletStatus === 'zero' && company.walletBalance !== 0) {
        return false;
      }
      if (filters.walletStatus === 'negative' && company.walletBalance >= 0) {
        return false;
      }

      // AI credits status filter
      if (filters.aiCreditsStatus === 'positive' && company.aiCredits <= 0) {
        return false;
      }
      if (filters.aiCreditsStatus === 'zero' && company.aiCredits !== 0) {
        return false;
      }
      if (filters.aiCreditsStatus === 'low' && company.aiCredits > 10) {
        return false;
      }

      // Active status filter
      if (filters.isActive === 'active' && !company.isActive) {
        return false;
      }
      if (filters.isActive === 'inactive' && company.isActive) {
        return false;
      }

      return true;
    });
  }, [companies, filters]);

  // Get unique values for filter dropdowns
  const uniqueIndustries = useMemo(() => {
    return [...new Set(companies.filter(c => c.industry).map(c => c.industry))].sort();
  }, [companies]);

  const uniqueCategories = useMemo(() => {
    return [...new Set(companies.filter(c => c.category).map(c => c.category))].sort();
  }, [companies]);

  const uniqueLocations = useMemo(() => {
    return [...new Set(companies.filter(c => c.location).map(c => c.location))].sort();
  }, [companies]);

  const openViewDialog = async (company: Company) => {
    try {
      const response = await fetch(`/api/admin/companies/${company._id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedCompany(data.company);
        setIsViewDialogOpen(true);
      } else {
        toast({
          title: "Error",
          description: "Failed to load company details",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading company details:', error);
      toast({
        title: "Error",
        description: "Error loading company details",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (company: Company) => {
    setSelectedCompany(company);
    setEditingCompany({ ...company });
    setIsEditDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingCompany({
      name: '',
      address: '',
      website: '',
      industry: '',
      size: '',
      location: '',
      category: '',
      phone: '',
      countryCode: '',
      walletBalance: 0,
      aiCredits: 10,
      currency: 'INR',
      subscriptionPlan: 'free',
      subscriptionStatus: 'expired',
      isActive: true
    });
    setIsCreateDialogOpen(true);
  };

  const openDeleteDialog = (company: Company) => {
    setSelectedCompany(company);
    setIsDeleteDialogOpen(true);
  };

  const updateField = (field: string, value: any) => {
    setEditingCompany(prev => ({ ...prev, [field]: value }));
  };

  const saveCompany = async () => {
    if (!editingCompany.name) {
      toast({
        title: "Validation Error",
        description: "Company name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      let response;

      if (selectedCompany) {
        // Update existing company
        response = await fetch(`/api/admin/companies/${selectedCompany._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates: editingCompany })
        });
      } else {
        // Create new company
        response = await fetch('/api/admin/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingCompany)
        });
      }

      if (response.ok) {
        toast({
          title: "Success",
          description: `Company ${selectedCompany ? 'updated' : 'created'} successfully`,
        });
        await loadCompanies();
        setIsEditDialogOpen(false);
        setIsCreateDialogOpen(false);
        setSelectedCompany(null);
        setEditingCompany({});
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || `Failed to ${selectedCompany ? 'update' : 'create'} company`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving company:', error);
      toast({
        title: "Error",
        description: `Error ${selectedCompany ? 'updating' : 'creating'} company`,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteCompany = async () => {
    if (!selectedCompany) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/companies/${selectedCompany._id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Company deleted successfully",
        });
        await loadCompanies();
        setIsDeleteDialogOpen(false);
        setSelectedCompany(null);
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to delete company",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting company:', error);
      toast({
        title: "Error",
        description: "Error deleting company",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
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
      walletStatus: '',
      aiCreditsStatus: '',
      isActive: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getWalletStatusBadge = (balance: number) => {
    if (balance > 1000) return <Badge variant="default" className="bg-green-600">High</Badge>;
    if (balance > 0) return <Badge variant="outline" className="text-orange-600 border-orange-600">Low</Badge>;
    return <Badge variant="secondary" className="text-red-600">Empty</Badge>;
  };

  const getAICreditsStatusBadge = (credits: number) => {
    if (credits > 50) return <Badge variant="default" className="bg-green-600">High</Badge>;
    if (credits > 10) return <Badge variant="outline" className="text-orange-600 border-orange-600">Medium</Badge>;
    if (credits > 0) return <Badge variant="outline" className="text-red-600 border-red-600">Low</Badge>;
    return <Badge variant="secondary" className="text-red-600">Empty</Badge>;
  };

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Companies Management</h1>
        <p className="text-muted-foreground text-lg">
          Manage all registered companies, their details, subscriptions, and resources
        </p>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                All Companies
              </CardTitle>
              <CardDescription>
                Complete management of companies and their resources
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
              <Button onClick={openCreateDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Company
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
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Select
                    value={filters.industry}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, industry: value === 'All' ? '' : value }))}
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
                  <Label>Location</Label>
                  <Select
                    value={filters.location}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, location: value === 'All' ? '' : value }))}
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
                  <Label>Subscription Plan</Label>
                  <Select
                    value={filters.subscriptionPlan}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, subscriptionPlan: value === 'All' ? '' : value }))}
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
                  <Label>Wallet Status</Label>
                  <Select
                    value={filters.walletStatus}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, walletStatus: value === 'All' ? '' : value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All wallets" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All wallets</SelectItem>
                      <SelectItem value="positive">Positive Balance</SelectItem>
                      <SelectItem value="zero">Zero Balance</SelectItem>
                      <SelectItem value="negative">Negative Balance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>AI Credits</Label>
                  <Select
                    value={filters.aiCreditsStatus}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, aiCreditsStatus: value === 'All' ? '' : value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All credits" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All credits</SelectItem>
                      <SelectItem value="positive">Has Credits</SelectItem>
                      <SelectItem value="zero">No Credits</SelectItem>
                      <SelectItem value="low">Low Credits (≤10)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={filters.isActive}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, isActive: value === 'All' ? '' : value }))}
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
              </div>
            </div>
          </CardContent>
        )}

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
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
              {hasActiveFilters ? (
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              ) : (
                <Button onClick={openCreateDialog} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add First Company
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
                      <TableHead>Company</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead>Wallet</TableHead>
                      <TableHead>AI Credits</TableHead>
                      <TableHead>Template Rates</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompanies.map((company) => (
                      <TableRow key={company._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                              {company.logo ? (
                                <img src={company.logo} alt="" className="w-8 h-8 rounded-lg" />
                              ) : (
                                <Building2 className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{company.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {company.category || 'No category'}
                              </div>
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
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{company.location}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="secondary" className="capitalize">
                              {company.subscriptionPlan || 'Free'}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {company.subscriptionStatus || 'Expired'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-sm">
                              {formatCurrency(company.walletBalance, company.currency)}
                            </div>
                            {getWalletStatusBadge(company.walletBalance)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-sm flex items-center gap-1">
                              <Brain className="h-3 w-3" />
                              {company.aiCredits?.toLocaleString()}
                            </div>
                            {getAICreditsStatusBadge(company.aiCredits)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {company.templateRates?.length || 0} rates
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {company.templateRates?.filter(r => r.isActive).length || 0} active
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={company.isActive ? "default" : "secondary"}>
                            {company.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(company.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openViewDialog(company)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(company)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Company
                              </DropdownMenuItem>
                              <Link href={`/admin/users?companyId=${company._id}`}>
                                <DropdownMenuItem>
                                  <Users className="mr-2 h-4 w-4" />
                                  Manage Users
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem
                                onClick={() => openDeleteDialog(company)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Company
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Company Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {selectedCompany?.name} - Company Details
            </DialogTitle>
            <DialogDescription>
              Complete overview of company information and statistics
            </DialogDescription>
          </DialogHeader>

          {selectedCompany && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">Users ({selectedCompany.users?.length || 0})</TabsTrigger>
                <TabsTrigger value="subscription">Subscription</TabsTrigger>
                <TabsTrigger value="rates">Template Rates ({selectedCompany.templateRates?.length || 0})</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-6">
                {/* Company Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Company Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Name</Label>
                          <p className="text-sm text-muted-foreground">{selectedCompany.name}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Industry</Label>
                          <p className="text-sm text-muted-foreground">{selectedCompany.industry || '-'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Category</Label>
                          <p className="text-sm text-muted-foreground">{selectedCompany.category || '-'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Location</Label>
                          <p className="text-sm text-muted-foreground">{selectedCompany.location || '-'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Phone</Label>
                          <p className="text-sm text-muted-foreground">{selectedCompany.phone || '-'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Website</Label>
                          <p className="text-sm text-muted-foreground">{selectedCompany.website || '-'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Resources</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            <span className="text-sm font-medium">Wallet Balance</span>
                          </div>
                          <span className="font-semibold">
                            {formatCurrency(selectedCompany.walletBalance, selectedCompany.currency)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4" />
                            <span className="text-sm font-medium">AI Credits</span>
                          </div>
                          <span className="font-semibold">
                            {selectedCompany.aiCredits.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 border rounded-lg text-center">
                        <div className="text-2xl font-bold text-primary">{selectedCompany.stats?.totalUsers || 0}</div>
                        <div className="text-sm text-muted-foreground">Total Users</div>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">{selectedCompany.stats?.activeUsers || 0}</div>
                        <div className="text-sm text-muted-foreground">Active Users</div>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">{selectedCompany.stats?.totalTemplateRates || 0}</div>
                        <div className="text-sm text-muted-foreground">Template Rates</div>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <div className="text-2xl font-bold text-orange-600">{selectedCompany.stats?.activeTemplateRates || 0}</div>
                        <div className="text-sm text-muted-foreground">Active Rates</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users" className="mt-6">
                {selectedCompany.users && selectedCompany.users.length > 0 ? (
                  <div className="space-y-4">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Login</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedCompany.users.map((user: any) => (
                            <TableRow key={user._id}>
                              <TableCell>
                                <div className="font-medium">{user.name}</div>
                                {user.isOwner && <Badge variant="outline" className="mt-1">Owner</Badge>}
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {user.role}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={user.isActive ? "default" : "secondary"}>
                                  {user.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {user.lastLoginAt
                                  ? new Date(user.lastLoginAt).toLocaleDateString()
                                  : 'Never'
                                }
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
                    <p className="text-muted-foreground">
                      This company doesn't have any users registered yet.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="subscription" className="mt-6">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Subscription Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium">Plan</Label>
                            <p className="text-lg font-semibold capitalize">
                              {selectedCompany.subscriptionPlan || 'Free'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Status</Label>
                            <div className="mt-1">
                              <Badge variant={selectedCompany.subscriptionStatus === 'active' ? "default" : "secondary"}>
                                {selectedCompany.subscriptionStatus || 'Expired'}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Billing Cycle</Label>
                            <p className="text-sm text-muted-foreground capitalize">
                              {selectedCompany.billingCycle || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium">Start Date</Label>
                            <p className="text-sm text-muted-foreground">
                              {selectedCompany.subscriptionStartDate
                                ? new Date(selectedCompany.subscriptionStartDate).toLocaleDateString()
                                : 'N/A'
                              }
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">End Date</Label>
                            <p className="text-sm text-muted-foreground">
                              {selectedCompany.subscriptionEndDate
                                ? new Date(selectedCompany.subscriptionEndDate).toLocaleDateString()
                                : 'N/A'
                              }
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Last Payment</Label>
                            <p className="text-sm text-muted-foreground">
                              {selectedCompany.lastPaymentAmount && selectedCompany.lastPaymentDate
                                ? `${formatCurrency(selectedCompany.lastPaymentAmount)} on ${new Date(selectedCompany.lastPaymentDate).toLocaleDateString()}`
                                : 'No payments recorded'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="rates" className="mt-6">
                {selectedCompany.templateRates && selectedCompany.templateRates.length > 0 ? (
                  <div className="space-y-4">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Country</TableHead>
                            <TableHead>Currency</TableHead>
                            <TableHead>Marketing</TableHead>
                            <TableHead>Authentication</TableHead>
                            <TableHead>Utility</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Updated</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedCompany.templateRates.map((rate: any) => (
                            <TableRow key={rate.countryCode}>
                              <TableCell>
                                <div className="font-medium">{rate.countryName}</div>
                                <div className="text-sm text-muted-foreground">{rate.countryCode}</div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{rate.currency}</Badge>
                              </TableCell>
                              <TableCell className="text-sm">
                                {formatCurrency(rate.rates.marketing.platformPrice, rate.currency)}
                              </TableCell>
                              <TableCell className="text-sm">
                                {formatCurrency(rate.rates.authentication.platformPrice, rate.currency)}
                              </TableCell>
                              <TableCell className="text-sm">
                                {formatCurrency(rate.rates.utility.platformPrice, rate.currency)}
                              </TableCell>
                              <TableCell>
                                <Badge variant={rate.isActive ? "default" : "secondary"}>
                                  {rate.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(rate.lastUpdated).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Template Rates Configured</h3>
                    <p className="text-muted-foreground">
                      This company doesn't have any custom template rates configured.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit/Create Company Dialog */}
      <Dialog open={isEditDialogOpen || isCreateDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsEditDialogOpen(false);
          setIsCreateDialogOpen(false);
          setSelectedCompany(null);
          setEditingCompany({});
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {selectedCompany ? 'Edit Company' : 'Add New Company'}
            </DialogTitle>
            <DialogDescription>
              {selectedCompany
                ? 'Update company information and settings'
                : 'Create a new company with basic information'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    value={editingCompany.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={editingCompany.industry || ''}
                    onChange={(e) => updateField('industry', e.target.value)}
                    placeholder="e.g. Technology, Healthcare"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={editingCompany.category || ''}
                    onChange={(e) => updateField('category', e.target.value)}
                    placeholder="e.g. SaaS, E-commerce"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Company Size</Label>
                  <Select
                    value={editingCompany.size || ''}
                    onValueChange={(value) => updateField('size', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="501+">501+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={editingCompany.location || ''}
                    onChange={(e) => updateField('location', e.target.value)}
                    placeholder="e.g. Mumbai, India"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editingCompany.phone || ''}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={editingCompany.website || ''}
                    onChange={(e) => updateField('website', e.target.value)}
                    placeholder="https://company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={editingCompany.currency || 'INR'}
                    onValueChange={(value) => updateField('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={editingCompany.address || ''}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Enter complete address"
                  rows={3}
                />
              </div>
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Resources & Subscription</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="walletBalance">Wallet Balance</Label>
                  <Input
                    id="walletBalance"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingCompany.walletBalance || 0}
                    onChange={(e) => updateField('walletBalance', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aiCredits">AI Credits</Label>
                  <Input
                    id="aiCredits"
                    type="number"
                    min="0"
                    value={editingCompany.aiCredits || 0}
                    onChange={(e) => updateField('aiCredits', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subscriptionPlan">Subscription Plan</Label>
                  <Select
                    value={editingCompany.subscriptionPlan || 'free'}
                    onValueChange={(value) => updateField('subscriptionPlan', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="growth">Growth</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subscriptionStatus">Subscription Status</Label>
                  <Select
                    value={editingCompany.subscriptionStatus || 'expired'}
                    onValueChange={(value) => updateField('subscriptionStatus', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Status</h3>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={editingCompany.isActive ?? true}
                  onCheckedChange={(checked) => updateField('isActive', checked)}
                />
                <Label htmlFor="isActive">
                  Company is active
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setIsCreateDialogOpen(false);
                setSelectedCompany(null);
                setEditingCompany({});
              }}
            >
              Cancel
            </Button>
            <Button onClick={saveCompany} disabled={saving}>
              {saving ? 'Saving...' : (selectedCompany ? 'Update Company' : 'Create Company')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Company Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Company
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the company and all associated data.
            </DialogDescription>
          </DialogHeader>

          {selectedCompany && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">You are about to delete:</p>
                  <p>• Company: <strong>{selectedCompany.name}</strong></p>
                  <p>• All associated users and their data</p>
                  <p>• Template rates configuration</p>
                  <p>• Wallet balance: <strong>{formatCurrency(selectedCompany.walletBalance, selectedCompany.currency)}</strong></p>
                  <p>• AI credits: <strong>{selectedCompany.aiCredits}</strong></p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteCompany}
              disabled={saving}
            >
              {saving ? 'Deleting...' : 'Delete Company'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
