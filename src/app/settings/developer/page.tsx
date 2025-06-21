"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  Book,
  CheckCircle,
  ClipboardCopy,
  Code2,
  ExternalLink,
  Fingerprint,
  GithubIcon,
  Globe,
  InfoIcon,
  Lock,
  Webhook
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Layout from "@/components/layout/Layout";

export default function DeveloperSettingsPage() {
  const [apiKey, setApiKey] = useState("sk_live_51NqFSiKgrzpipnqJgTtLgxPmlXYKQ9fSJ8JqM2YqRXWZp");
  const [showApiKey, setShowApiKey] = useState(false);
  const [optOutError, setOptOutError] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState("https://example.com/webhook");

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: message,
      });
    });
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-6 max-w-6xl">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Developer Settings</h1>
              <p className="text-muted-foreground mt-1">
                Manage your API keys, webhooks, and other developer settings
              </p>
            </div>
            <Button variant="outline" className="gap-2" asChild>
              <a href="https://docs.example.com" target="_blank" rel="noopener noreferrer">
                <Book className="h-4 w-4" /> View Documentation
              </a>
            </Button>
          </div>

          <Alert className=" shadow-sm">
            <AlertCircle className="h-5 w-5 text-amber-800 " />
            <AlertTitle className="text-amber-900 ">Rate Limit Information</AlertTitle>
            <AlertDescription className="text-amber-700 ">
              Your current plan has a rate limit of 300 requests per minute for Public APIs.
              To increase this limit, please upgrade your plan by contacting our support team.
              Error Code on exceeding rate limit → 429.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fingerprint className="h-5 w-5 text-primary" />
                  Secret Key
                </CardTitle>
                <CardDescription>
                  This is your API key to be passed in your API request
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="grid flex-1 gap-2">
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2 bg-primary/5 text-primary border-primary/20">LIVE</Badge>
                      <Label htmlFor="api-key">API Key</Label>
                    </div>
                    <div className="flex items-center gap-2 border rounded-md">
                      <Input
                        id="api-key"
                        value={showApiKey ? apiKey : "•".repeat(apiKey.length)}
                        readOnly
                        className="border-0 focus-visible:ring-0"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="h-8 gap-1"
                      >
                        {showApiKey ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                        {showApiKey ? "Hide" : "Show"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(apiKey, "API key copied to clipboard")}
                        className="h-8 gap-1"
                      >
                        <ClipboardCopy className="h-4 w-4" />
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Button variant="default">Regenerate Key</Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                          <InfoIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Regenerating your API key will invalidate your current key. Make sure to update your applications.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  Error Handling
                </CardTitle>
                <CardDescription>
                  Configure how API errors are handled
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-3">
                  <Switch
                    id="opt-out-error"
                    checked={optOutError}
                    onCheckedChange={setOptOutError}
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="opt-out-error"
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      Return an error if the Message Send API is called for an opted-out user
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Prevents sending messages to users who have opted out of communications
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5 text-primary" />
                Configure Webhook
              </CardTitle>
              <CardDescription>
                Get webhooks for customer messages & delivery status of template messages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="webhook-url">Interakt Webhook</Label>
                  <div className="flex gap-2">
                    <Input
                      id="webhook-url"
                      placeholder="https://your-domain.com/webhook"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button>Edit Configuration</Button>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>You will receive events for:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Incoming customer messages</li>
                    <li>Delivery status updates</li>
                    <li>Read receipts</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="docs" className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="docs" className="gap-2">
                <Book className="h-4 w-4" /> API Documentation
              </TabsTrigger>
              <TabsTrigger value="postman" className="gap-2">
                <CheckCircle className="h-4 w-4" /> Postman Collection
              </TabsTrigger>
              <TabsTrigger value="sdk" className="gap-2">
                <Code2 className="h-4 w-4" /> Python SDK
              </TabsTrigger>
            </TabsList>
            <TabsContent value="docs" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-3">
                      <Book className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">API Documentation</h3>
                      <p className="text-sm text-muted-foreground">
                        Use our API Documentation to start understanding our API capabilities
                      </p>
                    </div>
                    <Button className="gap-2" asChild>
                      <a href="https://docs.example.com" target="_blank" rel="noopener noreferrer">
                        View Docs <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="postman" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-3">
                      <CheckCircle className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">Postman Collection</h3>
                      <p className="text-sm text-muted-foreground">
                        Start playing with our APIs using our Postman Collections
                      </p>
                    </div>
                    <Button className="gap-2" asChild>
                      <a href="https://www.postman.com/example" target="_blank" rel="noopener noreferrer">
                        Download <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="sdk" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-3">
                      <GithubIcon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">Python SDK</h3>
                      <p className="text-sm text-muted-foreground">
                        Dive into the code quickly using the SDKs
                      </p>
                    </div>
                    <Button className="gap-2" asChild>
                      <a href="https://github.com/example/sdk" target="_blank" rel="noopener noreferrer">
                        View SDK <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
