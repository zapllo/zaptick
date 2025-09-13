export const testAutoReplyTriggers = [
  { keyword: "hello", description: "Basic greeting" },
  { keyword: "hi", description: "Casual greeting" },
  { keyword: "start", description: "Getting started" },
  { keyword: "help", description: "Request for assistance" },
  { keyword: "support", description: "Customer support" },
  { keyword: "price", description: "Pricing inquiry" },
  { keyword: "buy", description: "Purchase intent" },
  { keyword: "order", description: "Order related" },
  { keyword: "delivery", description: "Delivery inquiry" },
  { keyword: "refund", description: "Refund request" },
];

export const sampleAutoReplies = [
  {
    name: "Welcome Message",
    triggers: ["hello", "hi", "hey"],
    replyMessage: "Hello! 👋 Welcome to our WhatsApp support. How can I help you today?",
    matchType: "contains",
    priority: 1
  },
  {
    name: "Business Hours",
    triggers: ["hours", "open", "closed", "timing"],
    replyMessage: "Our business hours are:\n🕘 Monday - Friday: 9 AM - 6 PM\n🕘 Saturday: 10 AM - 4 PM\n🚫 Sunday: Closed\n\nFor urgent matters, please call us at +1234567890",
    matchType: "contains",
    priority: 2
  },
  {
    name: "Pricing Info",
    triggers: ["price", "cost", "pricing", "how much"],
    replyMessage: "💰 Here's our pricing information:\n\n📦 Basic Plan: $29/month\n🚀 Pro Plan: $59/month\n⭐ Enterprise: Custom pricing\n\nWould you like to schedule a demo?",
    matchType: "contains",
    priority: 3
  },
  {
    name: "Support Request",
    triggers: ["help", "support", "issue", "problem"],
    replyMessage: "🆘 I'm here to help! Please describe your issue and our support team will assist you.\n\nFor faster resolution, you can also:\n📧 Email: support@company.com\n📞 Call: +1234567890",
    matchType: "contains",
    priority: 4
  }
];
