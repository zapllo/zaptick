"use client";

import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function IntegrationsSection() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const integrationCategories: Record<string, Array<{ name: string, logo: string }>> = {
    crm: [
      { name: "Salesforce", logo: "/logos/salesforce.svg" },
      { name: "HubSpot", logo: "/logos/hubspot.svg" },
      { name: "Zoho CRM", logo: "/logos/zoho.svg" },
      { name: "Pipedrive", logo: "/logos/pipedrive.svg" },
      { name: "Microsoft Dynamics", logo: "/logos/microsoft.svg" },
      { name: "Monday.com", logo: "/logos/monday.svg" },
    ],
    ecommerce: [
      { name: "Shopify", logo: "/logos/shopify.svg" },
      { name: "WooCommerce", logo: "/logos/woocommerce.svg" },
      { name: "Magento", logo: "/logos/magento.svg" },
      { name: "BigCommerce", logo: "/logos/bigcommerce.svg" },
      { name: "PrestaShop", logo: "/logos/prestashop.svg" },
      { name: "Etsy", logo: "/logos/etsy.svg" },
    ],
    marketing: [
      { name: "Mailchimp", logo: "/logos/mailchimp.svg" },
      { name: "Klaviyo", logo: "/logos/klaviyo.svg" },
      { name: "ActiveCampaign", logo: "/logos/activecampaign.svg" },
      { name: "GetResponse", logo: "/logos/getresponse.svg" },
      { name: "Omnisend", logo: "/logos/omnisend.svg" },
      { name: "Sendinblue", logo: "/logos/sendinblue.svg" },
    ],
    helpdesk: [
      { name: "Zendesk", logo: "/logos/zendesk.svg" },
      { name: "Freshdesk", logo: "/logos/freshdesk.svg" },
      { name: "Help Scout", logo: "/logos/helpscout.svg" },
      { name: "Intercom", logo: "/logos/intercom.svg" },
      { name: "Gorgias", logo: "/logos/gorgias.svg" },
      { name: "LiveAgent", logo: "/logos/liveagent.svg" },
    ],
  };

  return (
    <section id="integrations" ref={ref} className="container mx-auto py-20 px-4 md:px-8">
      <div className="text-center mb-16">
        <Badge className="mb-4 px-3 py-1 bg-purple-100 text-purple-800 wark:bg-purple-900 wark:text-purple-300">Integrations</Badge>
        <h2 className="text-3xl md:text-5xl font-bold mb-4">Connect with your favorite tools</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          ZapTick seamlessly integrates with your existing tech stack to provide a unified workflow experience.
        </p>
      </div>

      <Tabs defaultValue="crm" className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <TabsTrigger value="crm">CRM</TabsTrigger>
            <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
            <TabsTrigger value="helpdesk">Help Desk</TabsTrigger>
          </TabsList>
        </div>

        {Object.keys(integrationCategories).map((category) => (
          <TabsContent key={category} value={category} className="mt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {integrationCategories[category as keyof typeof integrationCategories].map((integration, index: number) => (
                <motion.div
                  key={index}
                  className="bg-white wark:bg-gray-800 rounded-xl p-4 flex flex-col items-center justify-center shadow-sm border border-gray-200 wark:border-gray-700 hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="h-12 w-12 mb-3 flex items-center justify-center">
                    <Image src={integration.logo} alt={integration.name} width={40} height={40} />
                  </div>
                  <p className="text-sm font-medium text-center">{integration.name}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="mt-12 text-center bg-purple-50 wark:bg-purple-900/20 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <h3 className="text-xl font-bold mb-2">How {category.toUpperCase()} integration works</h3>
              <p className="text-muted-foreground mb-6">
                {category === "crm" && "Sync customer data between ZapTick and your CRM to maintain a unified customer profile and conversation history."}
                {category === "ecommerce" && "Connect your e-commerce platform to send order confirmations, shipping updates, and abandoned cart reminders via WhatsApp."}
                {category === "marketing" && "Integrate with your marketing automation tools to create omnichannel campaigns that include WhatsApp messaging."}
                {category === "helpdesk" && "Connect your help desk solution to handle customer support inquiries from WhatsApp within your existing workflow."}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-4 bg-white wark:bg-gray-800">
                  <div className="rounded-full bg-purple-100 wark:bg-purple-900/50 w-8 h-8 flex items-center justify-center mb-3 mx-auto">
                    <span className="text-purple-600 wark:text-purple-400 font-semibold">1</span>
                  </div>
                  <h4 className="text-sm font-semibold text-center mb-2">Connect</h4>
                  <p className="text-xs text-muted-foreground text-center">
                    Authorize with just a few clicks through our secure OAuth flow
                  </p>
                </Card>

                <Card className="p-4 bg-white wark:bg-gray-800">
                  <div className="rounded-full bg-purple-100 wark:bg-purple-900/50 w-8 h-8 flex items-center justify-center mb-3 mx-auto">
                    <span className="text-purple-600 wark:text-purple-400 font-semibold">2</span>
                  </div>
                  <h4 className="text-sm font-semibold text-center mb-2">Configure</h4>
                  <p className="text-xs text-muted-foreground text-center">
                    Set up data mapping and automation triggers between systems
                  </p>
                </Card>

                <Card className="p-4 bg-white wark:bg-gray-800">
                  <div className="rounded-full bg-purple-100 wark:bg-purple-900/50 w-8 h-8 flex items-center justify-center mb-3 mx-auto">
                    <span className="text-purple-600 wark:text-purple-400 font-semibold">3</span>
                  </div>
                  <h4 className="text-sm font-semibold text-center mb-2">Activate</h4>
                  <p className="text-xs text-muted-foreground text-center">
                    Start syncing data and automating workflows between platforms
                  </p>
                </Card>
              </div>
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Custom integration and API section */}
      <div className="mt-20">
        <div className="flex flex-col md:flex-row gap-8 items-center bg-gradient-to-r from-gray-50 to-gray-100 wark:from-gray-900 wark:to-gray-800 rounded-3xl p-8">
          <div className="md:w-1/2">
            <h3 className="text-2xl font-bold mb-4">Need a custom integration?</h3>
            <p className="text-muted-foreground mb-6">
              We offer a powerful API and webhooks for custom integrations. Our developer-friendly platform lets you build exactly what your business needs.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button className="bg-purple-500 hover:bg-purple-600">
                Explore API Docs
              </Button>
              <Button variant="outline">
                Talk to Developer Support
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 bg-white wark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold">API Request Example</p>
              <Badge className="bg-green-100 text-green-800 wark:bg-green-900 wark:text-green-300">
                POST /api/v1/messages
              </Badge>
            </div>
            <pre className="bg-gray-100 wark:bg-gray-900 p-4 rounded-lg text-xs overflow-x-auto">
              {`{
  "recipient": "+1234567890",
  "type": "text",
  "content": {
    "text": "Hello! Your order #12345 has been shipped."
  },
  "template": {
    "name": "order_update",
    "language": "en_US"
  }
}`}
            </pre>
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" size="sm" className="text-xs">
                Copy Code
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Partner program section */}
      <div className="mt-20 text-center">
        <Badge className="mb-4 px-3 py-1 bg-blue-100 text-blue-800 wark:bg-blue-900 wark:text-blue-300">
          Partner Program
        </Badge>
        <h3 className="text-2xl font-bold mb-4">Become an integration partner</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
          Join our partner ecosystem and build integrations that help thousands of businesses enhance their WhatsApp communication strategy.
        </p>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
          Join Partner Program
        </Button>
      </div>
    </section>
  );
}
