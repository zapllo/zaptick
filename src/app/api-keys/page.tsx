"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Copy,
  Key,
  Clock,
  RefreshCw,
  Trash,
  CheckCircle,
  XCircle,
  EyeOff,
  Eye,
  AlertCircle,
  Shield,
  Smartphone,
  Globe,
  Terminal,
  Server,
  Calendar,
  Info,
  Check,
  X,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, formatDistanceToNow, addMonths } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

// Mock data for API keys
const apiKeys = [
  {
    id: 1,
    name: "Production API Key",
    key: "wba_prod_XXXXXXXXXXXXXXXXXXXX",
    status: "active",
    type: "production",
    createdAt: new Date(2023, 3, 15),
    expiresAt: addMonths(new Date(2023, 3, 15), 12),
    lastUsed: new Date(2023, 5, 16, 14, 35),
    permissions: ["messages:read", "messages:write", "contacts:read", "contacts:write", "templates:read"],
    ipRestrictions: ["192.168.1.1", "192.168.1.2"],
    origins: ["https://app.mycompany.com", "https://api.mycompany.com"],
    usageLimit: 10000,
    usageCount: 8752
  },
  {
    id: 2,
    name: "Development API Key",
    key: "wba_dev_XXXXXXXXXXXXXXXXXXXX",
    status: "active",
    type: "development",
    createdAt: new Date(2023, 4, 20),
    expiresAt: addMonths(new Date(2023, 4, 20), 6),
    lastUsed: new Date(2023, 5, 16, 9, 42),
    permissions: ["messages:read", "messages:write", "contacts:read", "templates:read"],
    ipRestrictions: [],
    origins: ["https://dev.mycompany.com", "http://localhost:3000"],
    usageLimit: 5000,
    usageCount: 1253
  },
  {
    id: 3,
    name: "Mobile App API Key",
    key: "wba_mob_XXXXXXXXXXXXXXXXXXXX",
    status: "active",
    type: "production",
    createdAt: new Date(2023, 2, 10),
    expiresAt: addMonths(new Date(2023, 2, 10), 12),
    lastUsed: new Date(2023, 5, 16, 15, 12),
    permissions: ["messages:read", "messages:write", "contacts:read"],
    ipRestrictions: [],
    origins: [],
    usageLimit: 20000,
    usageCount: 12875
  },
  {
    id: 4,
    name: "Integration API Key",
    key: "wba_int_XXXXXXXXXXXXXXXXXXXX",
    status: "expired",
    type: "production",
    createdAt: new Date(2022, 11, 5),
    expiresAt: new Date(2023, 5, 5),
    lastUsed: new Date(2023, 5, 4, 10, 0),
    permissions: ["messages:read", "messages:write", "contacts:read", "webhooks:manage"],
    ipRestrictions: ["10.0.0.1"],
    origins: ["https://erp.mycompany.com"],
    usageLimit: 15000,
    usageCount: 14982
  },
  {
    id: 5,
    name: "Analytics API Key",
    key: "wba_ana_XXXXXXXXXXXXXXXXXXXX",
    status: "revoked",
    type: "production",
    createdAt: new Date(2023, 1, 20),
    expiresAt: addMonths(new Date(2023, 1, 20), 12),
    lastUsed: new Date(2023, 4, 15, 12, 30),
    permissions: ["analytics:read"],
    ipRestrictions: [],
    origins: ["https://analytics.mycompany.com"],
    usageLimit: 5000,
    usageCount: 3842,
    revokedAt: new Date(2023, 5, 10)
  }
];

type ApiKeyStatus = "active" | "expired" | "revoked";

// Helper function to get the status badge color
const getStatusColor = (status: ApiKeyStatus) => {
  switch (status) {
    case "active":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "expired":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "revoked":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function ApiKeysPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [createKeyOpen, setCreateKeyOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<number | null>(null);
  const [showKey, setShowKey] = useState<{[key: number]: boolean}>({});
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const toggleShowKey = (id: number) => {
    setShowKey(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filter API keys based on search and status
  const filteredKeys = apiKeys.filter(key => {
    const matchesSearch = searchQuery === "" ||
      key.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === "" || key.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">API Keys</h2>
            <p className="text-muted-foreground">
              Manage API keys for integrating with the WhatsApp Business API
            </p>
          </div>
          <Button onClick={() => setCreateKeyOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create API Key
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search API keys..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>API Key</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKeys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                    No API keys found. Try adjusting your search or create a new key.
                  </TableCell>
                </TableRow>
              ) : (
                filteredKeys.map((apiKey) => (
                  <TableRow key={apiKey.id} className="group">
                    <TableCell>
                      <div className="font-medium">{apiKey.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Last used: {apiKey.lastUsed ? format(apiKey.lastUsed, "MMM d, yyyy 'at' h:mm a") : "Never"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="font-mono text-sm">
                          {showKey[apiKey.id] ? apiKey.key : apiKey.key.substring(0, 8) + "••••••••••••••••••"}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => toggleShowKey(apiKey.id)}
                        >
                          {showKey[apiKey.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(apiKey.key)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusColor(apiKey.status as ApiKeyStatus)}
                      >
                        {apiKey.status.charAt(0).toUpperCase() + apiKey.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={apiKey.type === 'production' ? 'default' : 'secondary'} className="capitalize">
                        {apiKey.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(apiKey.createdAt, "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      {apiKey.status === "revoked" ? (
                        <span className="text-muted-foreground">Revoked {format(apiKey.revokedAt!, "MMM d, yyyy")}</span>
                      ) : (
                        <span className={new Date() > apiKey.expiresAt ? "text-red-500" : ""}>
                          {format(apiKey.expiresAt, "MMM d, yyyy")}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setSelectedKey(apiKey.id)}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                        {apiKey.status === "active" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSelectedKey(apiKey.id)}>
                                  <Info className="mr-2 h-4 w-4" />
                                  <span>View Details</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  <span>Regenerate Key</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  <XCircle className="mr-2 h-4 w-4" />
                                  <span>Revoke Key</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create API Key Dialog */}
      <Dialog open={createKeyOpen} onOpenChange={setCreateKeyOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              Generate a new API key for integrating with the WhatsApp Business API
            </DialogDescription>
          </DialogHeader>

          {newKey ? (
            <div className="py-4 space-y-4">
              <div className="p-4 border rounded-md bg-green-50 wark:bg-green-900/20 text-green-600 wark:text-green-400 text-sm">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">API Key created successfully</p>
                    <p className="mt-1">Make sure to copy your API key now. You won&apos;t be able to see it again!</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Your API Key</label>
                <div className="flex">
                  <Input
                    value={newKey}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="ml-2"
                    onClick={() => copyToClipboard(newKey)}
                  >
                    {copySuccess ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Store this key securely. It will not be shown again.
                </p>
              </div>

              <div className="p-3 border rounded-md space-y-2">
                <h4 className="text-sm font-medium">Usage Example</h4>
                <div className="bg-muted p-3 rounded-md">
                  <pre className="text-xs overflow-x-auto font-mono">
{`curl -X POST https://api.whatsapp.business/v1/messages \\
  -H "Authorization: Bearer ${newKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"to":"1234567890","type":"text","text":{"body":"Hello!"}}'`}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="keyName" className="text-sm font-medium">
                  Key Name <span className="text-destructive">*</span>
                </label>
                <Input id="keyName" placeholder="e.g. Production API Key" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Key Type <span className="text-destructive">*</span>
                </label>
                <RadioGroup defaultValue="development">
                  <div className="flex items-start space-x-2 mb-2">
                    <RadioGroupItem value="development" id="type-dev" />
                    <div>
                      <Label htmlFor="type-dev" className="font-medium">Development</Label>
                      <p className="text-muted-foreground text-sm">For testing and development environments</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="production" id="type-prod" />
                    <div>
                      <Label htmlFor="type-prod" className="font-medium">Production</Label>
                      <p className="text-muted-foreground text-sm">For live production environments</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Permissions
                </label>
                <div className="grid grid-cols-2 gap-2 border rounded-md p-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="perm-messages-read" defaultChecked />
                    <label
                      htmlFor="perm-messages-read"
                      className="text-sm leading-none"
                    >
                      messages:read
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="perm-messages-write" defaultChecked />
                    <label
                      htmlFor="perm-messages-write"
                      className="text-sm leading-none"
                    >
                      messages:write
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="perm-contacts-read" defaultChecked />
                    <label
                      htmlFor="perm-contacts-read"
                      className="text-sm leading-none"
                    >
                      contacts:read
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="perm-contacts-write" />
                    <label
                      htmlFor="perm-contacts-write"
                      className="text-sm leading-none"
                    >
                      contacts:write
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="perm-templates-read" defaultChecked />
                    <label
                      htmlFor="perm-templates-read"
                      className="text-sm leading-none"
                    >
                      templates:read
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="perm-templates-write" />
                    <label
                      htmlFor="perm-templates-write"
                      className="text-sm leading-none"
                    >
                      templates:write
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="perm-webhooks-manage" />
                    <label
                      htmlFor="perm-webhooks-manage"
                      className="text-sm leading-none"
                    >
                      webhooks:manage
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="perm-analytics-read" />
                    <label
                      htmlFor="perm-analytics-read"
                      className="text-sm leading-none"
                    >
                      analytics:read
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">
                    Access Restrictions
                  </label>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add IP
                  </Button>
                </div>

                <div className="border rounded-md p-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Switch id="restrict-ip" />
                      <label htmlFor="restrict-ip" className="text-sm">
                        Restrict to specific IP addresses
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Switch id="restrict-origins" />
                      <label htmlFor="restrict-origins" className="text-sm">
                        Restrict to specific origins
                      </label>
                    </div>
                  </div>
                </div>
               <p className="text-xs text-muted-foreground">
                  Optional: Limit API access to specific IP addresses or origins for additional security
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Expiration
                </label>
                <Select defaultValue="1-year">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30-days">30 days</SelectItem>
                    <SelectItem value="90-days">90 days</SelectItem>
                    <SelectItem value="6-months">6 months</SelectItem>
                    <SelectItem value="1-year">1 year</SelectItem>
                    <SelectItem value="never">Never (Not recommended)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Set when this API key will expire. Regularly rotating keys is recommended.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            {newKey ? (
              <Button onClick={() => {
                setCreateKeyOpen(false);
                setNewKey(null);
              }}>
                Done
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCreateKeyOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setNewKey("wba_" + Math.random().toString(36).substring(2, 12) + "_" + Math.random().toString(36).substring(2, 12))}>
                  Generate API Key
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View API Key Details Dialog */}
      <Dialog open={selectedKey !== null} onOpenChange={() => setSelectedKey(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <span className="mr-2">API Key Details</span>
              {selectedKey !== null && (
                <Badge
                  variant="outline"
                  className={getStatusColor(apiKeys.find(k => k.id === selectedKey)?.status as ApiKeyStatus)}
                >
                  {/* {selectedKey !== null &&
                    apiKeys.find(k => k.id === selectedKey)?.status.charAt(0).toUpperCase() +
                    apiKeys.find(k => k.id === selectedKey)?.status.slice(1)
                  } */}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedKey !== null && apiKeys.find(k => k.id === selectedKey)?.name}
            </DialogDescription>
          </DialogHeader>

          {(() => {
            if (selectedKey === null) return null;
            const apiKey = apiKeys.find(k => k.id === selectedKey);
            if (!apiKey) return null;

            return (
              <div className="py-4 space-y-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium">API Key</div>
                  <div className="flex items-center space-x-2">
                    <div className="font-mono text-sm p-2 bg-muted rounded-md flex-1">
                      {showKey[apiKey.id] ? apiKey.key : apiKey.key.substring(0, 8) + "••••••••••••••••••"}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleShowKey(apiKey.id)}
                    >
                      {showKey[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyToClipboard(apiKey.key)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div>
                    <div className="text-sm font-medium">Type</div>
                    <div className="text-sm">
                      <Badge variant={apiKey.type === 'production' ? 'default' : 'secondary'} className="capitalize mt-1">
                        {apiKey.type}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Status</div>
                    <div className="text-sm">
                      <Badge
                        variant="outline"
                        className={`mt-1 ${getStatusColor(apiKey.status as ApiKeyStatus)}`}
                      >
                        {apiKey.status.charAt(0).toUpperCase() + apiKey.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Created</div>
                    <div className="text-sm">{format(apiKey.createdAt, "MMM d, yyyy")}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Expires</div>
                    <div className="text-sm">
                      {apiKey.status === "revoked" ? (
                        <span className="text-muted-foreground">Revoked {format(apiKey.revokedAt!, "MMM d, yyyy")}</span>
                      ) : (
                        <span className={new Date() > apiKey.expiresAt ? "text-red-500" : ""}>
                          {format(apiKey.expiresAt, "MMM d, yyyy")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Last Used</div>
                    <div className="text-sm">{apiKey.lastUsed ? format(apiKey.lastUsed, "MMM d, yyyy 'at' h:mm a") : "Never"}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Usage</div>
                    <div className="text-sm">{apiKey.usageCount.toLocaleString()} / {apiKey.usageLimit.toLocaleString()}</div>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="text-sm font-medium mb-2">Permissions</div>
                  <div className="flex flex-wrap gap-2">
                    {apiKey.permissions.map((permission, index) => (
                      <Badge key={index} variant="secondary">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium mb-2">IP Restrictions</div>
                    {apiKey.ipRestrictions.length > 0 ? (
                      <div className="space-y-2">
                        {apiKey.ipRestrictions.map((ip, index) => (
                          <div key={index} className="flex items-center p-2 bg-muted rounded-md">
                            <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">{ip}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">No IP restrictions</div>
                    )}
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-2">Allowed Origins</div>
                    {apiKey.origins.length > 0 ? (
                      <div className="space-y-2">
                        {apiKey.origins.map((origin, index) => (
                          <div key={index} className="flex items-center p-2 bg-muted rounded-md">
                            <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm truncate">{origin}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">No origin restrictions</div>
                    )}
                  </div>
                </div>

                <div className="p-3 border rounded-md space-y-2">
                  <h4 className="text-sm font-medium">Usage Example</h4>
                  <div className="bg-muted p-3 rounded-md">
                    <pre className="text-xs overflow-x-auto font-mono">
{`curl -X POST https://api.whatsapp.business/v1/messages \\
  -H "Authorization: Bearer ${showKey[apiKey.id] ? apiKey.key : apiKey.key.substring(0, 8) + "••••••••••••••••••"}" \\
  -H "Content-Type: application/json" \\
  -d '{"to":"1234567890","type":"text","text":{"body":"Hello!"}}'`}
                    </pre>
                  </div>
                </div>
              </div>
            );
          })()}

          <DialogFooter>
            {selectedKey !== null && apiKeys.find(k => k.id === selectedKey)?.status === "active" && (
              <div className="flex w-full justify-between">
                <Button variant="outline" className="text-red-500" size="sm">
                  <XCircle className="h-4 w-4 mr-2" />
                  Revoke Key
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setSelectedKey(null)}>
                    Close
                  </Button>
                  <Button>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate Key
                  </Button>
                </div>
              </div>
            )}
            {selectedKey !== null && (apiKeys.find(k => k.id === selectedKey)?.status === "expired" || apiKeys.find(k => k.id === selectedKey)?.status === "revoked") && (
              <Button variant="outline" onClick={() => setSelectedKey(null)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
