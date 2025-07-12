export const workflowTemplates = [
  {
    name: "Welcome Series",
    description: "Onboard new customers with a welcome message sequence",
    category: "Onboarding",
    nodes: [
      {
        id: "trigger-1",
        type: "trigger",
        position: { x: 250, y: 50 },
        data: {
          label: "New Customer",
          config: { triggers: ["hello", "hi", "start"] }
        }
      },
      {
        id: "action-1",
        type: "action",
        position: { x: 250, y: 200 },
        data: {
          label: "Welcome Message",
          config: {
            messageType: "text",
            content: "Welcome! Thanks for reaching out. How can I help you today?"
          }
        }
      },
      {
        id: "delay-1",
        type: "delay",
        position: { x: 250, y: 350 },
        data: {
          label: "Wait 1 Hour",
          config: { delayMs: 3600000 }
        }
      },
      {
        id: "action-2",
        type: "action",
        position: { x: 250, y: 500 },
        data: {
          label: "Follow-up",
          config: {
            messageType: "text",
            content: "Is there anything else I can help you with? Feel free to ask!"
          }
        }
      }
    ],
    edges: [
      { id: "e1", source: "trigger-1", target: "action-1" },
      { id: "e2", source: "action-1", target: "delay-1" },
      { id: "e3", source: "delay-1", target: "action-2" }
    ]
  },
  {
    name: "Support Escalation",
    description: "Escalate unresolved support queries to human agents",
    category: "Support",
    nodes: [
      {
        id: "trigger-1",
        type: "trigger",
        position: { x: 250, y: 50 },
        data: {
          label: "Support Request",
          config: { triggers: ["help", "support", "issue", "problem"] }
        }
      },
      {
        id: "action-1",
        type: "action",
        position: { x: 250, y: 200 },
        data: {
          label: "Auto Response",
          config: {
            messageType: "text",
            content: "I'll help you with that. Can you provide more details about your issue?"
          }
        }
      },
      {
        id: "delay-1",
        type: "delay",
        position: { x: 250, y: 350 },
        data: {
          label: "Wait 10 Minutes",
          config: { delayMs: 600000 }
        }
      },
      {
        id: "condition-1",
        type: "condition",
        position: { x: 250, y: 500 },
        data: {
          label: "Response Received?",
          config: { checkForResponse: true }
        }
      },
      {
        id: "action-2",
        type: "action",
        position: { x: 100, y: 650 },
        data: {
          label: "Escalate to Agent",
          config: {
            messageType: "text",
            content: "Let me connect you with one of our support agents who can help you better."
          }
        }
      },
      {
        id: "action-3",
        type: "action",
        position: { x: 400, y: 650 },
        data: {
          label: "Continue Automated Help",
          config: {
            messageType: "text",
            content: "Great! I'm here to help. What specific issue are you experiencing?"
          }
        }
      }
    ],
    edges: [
      { id: "e1", source: "trigger-1", target: "action-1" },
      { id: "e2", source: "action-1", target: "delay-1" },
      { id: "e3", source: "delay-1", target: "condition-1" },
      { id: "e4", source: "condition-1", target: "action-2", sourceHandle: "no" },
      { id: "e5", source: "condition-1", target: "action-3", sourceHandle: "yes" }
    ]
  }
];
