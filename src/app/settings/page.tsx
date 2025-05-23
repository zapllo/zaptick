// "use client";

// import { useState } from "react";
// import {
//   Save,
//   Upload,
//   Download,
//   UserCog,
//   Bell,
//   Shield,
//   Globe,
//   Mail,
//   Smartphone,
//   Server,
//   AlertCircle,
//   Check,
//   MessageSquare,
//   HelpCircle,
//   BadgeCheck,
//   Users,
//   RefreshCw,
//   Webhook,
//   BellRing,
//   DollarSign,
//   CreditCard,
//   Receipt,
//   Building2,
//   Clock,
//   FileText,
// } from "lucide-react";
// import Layout from "@/components/layout/Layout";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
// } from "@/components/ui/tabs";
// import { Switch } from "@/components/ui/switch";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Separator } from "@/components/ui/separator";
// import { Textarea } from "@/components/ui/textarea";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { format } from "date-fns";

// export default function SettingsPage() {
//   const [selectedTab, setSelectedTab] = useState("account");
//   const [saveSuccess, setSaveSuccess] = useState(false);

//   const handleSave = () => {
//     setSaveSuccess(true);
//     setTimeout(() => setSaveSuccess(false), 3000);
//   };

//   return (
//     <Layout>
//       <div className="space-y-6">
//         <div>
//           <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
//           <p className="text-muted-foreground">
//             Manage your account settings and preferences
//           </p>
//         </div>

//         <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
//           <TabsList className="grid md:grid-cols-6 grid-cols-2 h-auto p-1 gap-1">
//             <TabsTrigger value="account" className="py-2">
//               <UserCog className="h-4 w-4 mr-2" />
//               Account
//             </TabsTrigger>
//             <TabsTrigger value="notifications" className="py-2">
//               <Bell className="h-
import React from 'react'


export default function page({ }) {
  return (
    <div>page</div>
  )
}
