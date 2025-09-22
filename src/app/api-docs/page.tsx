"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Code,
  Search,
  Copy,
  Check,
  ExternalLink,
  Play,
  Book,
  Zap,
  Shield,
  Globe,
  MessageSquare,
  Users,
  BarChart3,
  Settings,
  Key,
  Terminal,
  FileText,
  ArrowRight
} from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Link from "next/link";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function ApiDocsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState("");

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  const apiCategories = [
    {
      title: "Authentication",
      description: "Manage API keys and authentication",
      icon: Shield,
      color: "bg-red-500",
      endpoints: [
        "POST /auth/token",
        "POST /auth/refresh",
        "DELETE /auth/revoke"
      ]
    },
    {
      title: "Messages",
      description: "Send and manage WhatsApp messages",
      icon: MessageSquare,
      color: "bg-green-500",
      endpoints: [
        "POST /messages/send",
        "GET /messages",
        "GET /messages/{id}",
        "POST /messages/bulk"
      ]
    },
    {
      title: "Templates",
      description: "Create and manage message templates",
      icon: FileText,
      color: "bg-blue-500",
      endpoints: [
        "GET /templates",
        "POST /templates",
        "PUT /templates/{id}",
        "DELETE /templates/{id}"
      ]
    },
    {
      title: "Contacts",
      description: "Manage your contact database",
      icon: Users,
      color: "bg-purple-500",
      endpoints: [
        "GET /contacts",
        "POST /contacts",
        "PUT /contacts/{id}",
        "DELETE /contacts/{id}"
      ]
    },
    {
      title: "Analytics",
      description: "Access message and campaign analytics",
      icon: BarChart3,
      color: "bg-orange-500",
      endpoints: [
        "GET /analytics/messages",
        "GET /analytics/campaigns",
        "GET /analytics/reports"
      ]
    },
    {
      title: "Webhooks",
      description: "Set up real-time event notifications",
      icon: Globe,
      color: "bg-teal-500",
      endpoints: [
        "GET /webhooks",
        "POST /webhooks",
        "PUT /webhooks/{id}",
        "DELETE /webhooks/{id}"
      ]
    }
  ];

  const quickStart = `curl -X POST "https://api.zaptick.com/v1/messages/send" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+919876543210",
    "type": "text",
    "text": {
      "body": "Hello from Zaptick!"
    }
  }'`;

  const authExample = `// Initialize Zaptick SDK
const zaptick = require('@zaptick/sdk');

// Configure with your API key
zaptick.configure({
  apiKey: 'your_api_key_here',
  baseUrl: 'https://api.zaptick.com/v1'
});

// Send a message
const response = await zaptick.messages.send({
  to: '+919876543210',
  type: 'text',
  text: {
    body: 'Hello from Zaptick API!'
  }
});

console.log('Message sent:', response.data);`;

  const webhookExample = `{
  "event": "message.delivered",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "messageId": "msg_123456789",
    "to": "+919876543210",
    "status": "delivered",
    "deliveredAt": "2024-01-15T10:29:58Z"
  }
}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-purple-50/20">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5"></div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={fadeIn}>
              <Badge className="mb-6 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-200">
                <Code className="w-4 h-4 mr-2" />
                API Reference
              </Badge>
            </motion.div>

            <motion.h1 variants={fadeIn} className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Zaptick
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                API Reference
              </span>
            </motion.h1>

            <motion.p variants={fadeIn} className="text-xl text-gray-600 mb-8 leading-relaxed">
              Build powerful WhatsApp integrations with our comprehensive REST API.
              Send messages, manage contacts, and automate workflows programmatically.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 text-lg px-8 py-4 h-auto">
                <Play className="mr-2 h-5 w-5" />
                Try API Explorer
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 h-auto">
                <Book className="mr-2 h-5 w-5" />
                View SDKs
              </Button>
            </motion.div>

            {/* Search Bar */}
            <motion.div variants={fadeIn} className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search API endpoints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-12 pr-4 border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-200 rounded-xl"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-20 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Quick Start</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Send your first message in under 5 minutes
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <Tabs defaultValue="curl" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="php">PHP</TabsTrigger>
                </TabsList>

                <TabsContent value="curl" className="mt-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Send a Message with cURL</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyCode(quickStart, 'curl')}
                        >
                          {copiedCode === 'curl' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                        <code>{quickStart}</code>
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="javascript" className="mt-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>JavaScript SDK</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyCode(authExample, 'js')}
                        >
                          {copiedCode === 'js' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                        <code>{authExample}</code>
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="python" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Python SDK</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                        <code>{`# Install: pip install zaptick-python
import zaptick

# Configure client
client = zaptick.Client(api_key='your_api_key_here')

# Send message
response = client.messages.send(
    to='+919876543210',
    type='text',
    text={'body': 'Hello from Zaptick API!'}
)

print(f"Message sent: {response.id}")`}</code>
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="php" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>PHP SDK</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                        <code>{`<?php
// Install: composer require zaptick/php-sdk
require_once 'vendor/autoload.php';

$zaptick = new Zaptick\\Client([
    'api_key' => 'your_api_key_here'
]);

$response = $zaptick->messages->send([
    'to' => '+919876543210',
    'type' => 'text',
    'text' => [
        'body' => 'Hello from Zaptick API!'
    ]
]);

echo "Message sent: " . $response->id;`}</code>
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </div>
      </section>

      {/* API Categories */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
          >
            <div className="text-center mb-16">
             <h2 className="text-4xl font-bold text-gray-900 mb-6">API Endpoints</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Explore all available endpoints organized by functionality
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {apiCategories.map((category, index) => (
                <motion.div key={index} variants={fadeIn}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                          <category.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="group-hover:text-purple-600 transition-colors">
                            {category.title}
                          </CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {category.endpoints.length} endpoints
                          </Badge>
                        </div>
                      </div>
                      <CardDescription>
                        {category.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {category.endpoints.map((endpoint, endpointIndex) => (
                          <li key={endpointIndex} className="flex items-center gap-2 text-sm font-mono text-gray-600 hover:text-purple-600 transition-colors cursor-pointer bg-gray-50 rounded px-2 py-1">
                            <Terminal className="w-3 h-3" />
                            {endpoint}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Authentication Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={staggerContainer}
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Authentication</h2>
              <p className="text-xl text-gray-600">
                Secure your API requests with bearer token authentication
              </p>
            </div>

            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
              <motion.div variants={fadeIn}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="w-5 h-5" />
                      API Keys
                    </CardTitle>
                    <CardDescription>
                      Generate and manage your API keys
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Base URL</h4>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          https://api.zaptick.com/v1
                        </code>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Authentication Header</h4>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          Authorization: Bearer YOUR_API_KEY
                        </code>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Rate Limits</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• 1000 requests/hour (Standard)</li>
                          <li>• 5000 requests/hour (Pro)</li>
                          <li>• Unlimited (Enterprise)</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeIn}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Webhooks
                    </CardTitle>
                    <CardDescription>
                      Real-time event notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Event Types</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• message.sent</li>
                          <li>• message.delivered</li>
                          <li>• message.read</li>
                          <li>• message.failed</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Example Payload</h4>
                        <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                          <code>{webhookExample}</code>
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SDKs Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={fadeIn}
            className="max-w-4xl mx-auto text-center text-white"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Official SDKs
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Get started faster with our official SDKs for your favorite programming language
            </p>

            <div className="grid md:grid-cols-4 gap-6 mb-12">
              {[
                { name: "JavaScript", command: "npm install @zaptick/sdk" },
                { name: "Python", command: "pip install zaptick-python" },
                { name: "PHP", command: "composer require zaptick/php-sdk" },
                { name: "Go", command: "go get github.com/zaptick/go-sdk" }
              ].map((sdk, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <h3 className="font-semibold mb-2">{sdk.name}</h3>
                  <code className="text-sm text-purple-200">{sdk.command}</code>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-purple-50 text-lg px-8 py-4 h-auto font-semibold"
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                View GitHub
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-purple-600 text-lg px-8 py-4 h-auto font-semibold"
              >
                <Book className="mr-2 h-5 w-5" />
                SDK Documentation
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
