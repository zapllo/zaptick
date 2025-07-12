import Workflow from '@/models/Workflow';
import Contact from '@/models/Contact';
import Conversation from '@/models/Conversation';
import User from '@/models/User';
import { v4 as uuidv4 } from 'uuid';

const INT_TOKEN = process.env.INTERAKT_API_TOKEN;

export interface WorkflowExecution {
  workflowId: string;
  contactId: string;
  currentNodeId: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  variables: Record<string, any>;
  executionPath: string[];
  createdAt: Date;
  completedAt?: Date;
}

class WorkflowEngine {
  private static instance: WorkflowEngine;
  private executions = new Map<string, WorkflowExecution>();

  static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine();
    }
    return WorkflowEngine.instance;
  }

  async triggerWorkflow(
    workflowId: string,
    contactId: string,
    triggerData: any
  ): Promise<string> {
    try {
      const workflow = await Workflow.findById(workflowId);
      if (!workflow || !workflow.isActive) {
        throw new Error('Workflow not found or inactive');
      }

      // Find trigger node
      const triggerNode = workflow.nodes.find((node: any) => node.type === 'trigger');
      if (!triggerNode) {
        throw new Error('No trigger node found in workflow');
      }

      const executionId = uuidv4();
      const execution: WorkflowExecution = {
        workflowId,
        contactId,
        currentNodeId: triggerNode.id,
        status: 'running',
        variables: { ...triggerData },
        executionPath: [triggerNode.id],
        createdAt: new Date()
      };

      this.executions.set(executionId, execution);

      // Start execution
      await this.executeNextNode(executionId);

      return executionId;
    } catch (error) {
      console.error('Error triggering workflow:', error);
      throw error;
    }
  }

  private async executeNextNode(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) return;

    try {
      const workflow = await Workflow.findById(execution.workflowId);
      if (!workflow) {
        execution.status = 'failed';
        return;
      }

      const currentNode = workflow.nodes.find((node: any) => node.id === execution.currentNodeId);
      if (!currentNode) {
        execution.status = 'completed';
        execution.completedAt = new Date();
        return;
      }

      let nextNodeId: string | null = null;

      switch (currentNode.type) {
        case 'trigger':
          nextNodeId = await this.executeTriggerNode(execution, currentNode, workflow);
          break;
        case 'action':
          nextNodeId = await this.executeActionNode(execution, currentNode, workflow);
          break;
        case 'condition':
          nextNodeId = await this.executeConditionNode(execution, currentNode, workflow);
          break;
        case 'delay':
          await this.executeDelayNode(execution, currentNode, workflow);
          return; // Delay will schedule next execution
        case 'webhook':
          nextNodeId = await this.executeWebhookNode(execution, currentNode, workflow);
          break;
        default:
          execution.status = 'failed';
          return;
      }

      if (nextNodeId) {
        execution.currentNodeId = nextNodeId;
        execution.executionPath.push(nextNodeId);
        // Continue execution
        await this.executeNextNode(executionId);
      } else {
        execution.status = 'completed';
        execution.completedAt = new Date();
      }

      // Update workflow statistics
      if (execution.status === 'completed') {
        await Workflow.findByIdAndUpdate(execution.workflowId, {
          $inc: { executionCount: 1, successCount: 1 },
          lastTriggered: new Date()
        });
      } else if (execution.status === 'failed') {
        await Workflow.findByIdAndUpdate(execution.workflowId, {
          $inc: { executionCount: 1, failureCount: 1 },
          lastTriggered: new Date()
        });
      }

    } catch (error) {
      console.error('Error executing node:', error);
      execution.status = 'failed';
      await Workflow.findByIdAndUpdate(execution.workflowId, {
        $inc: { executionCount: 1, failureCount: 1 },
        lastTriggered: new Date()
      });
    }
  }

  private async executeTriggerNode(
    execution: WorkflowExecution,
    node: any,
    workflow: any
  ): Promise<string | null> {
    // Find next node connected to this trigger
    const nextEdge = workflow.edges.find((edge: any) => edge.source === node.id);
    return nextEdge?.target || null;
  }

  private async executeActionNode(
    execution: WorkflowExecution,
    node: any,
    workflow: any
  ): Promise<string | null> {
    try {
      // Get contact and user information
      const contact = await Contact.findById(execution.contactId);
      if (!contact) {
        console.error('Contact not found for workflow execution');
        return null;
      }

      const user = await User.findById(workflow.userId);
      if (!user) {
        console.error('User not found for workflow execution');
        return null;
      }

      // Find the WABA account
      const wabaAccount = user.wabaAccounts?.find((account: any) => account.wabaId === contact.wabaId);
      if (!wabaAccount) {
        console.error('WABA account not found for workflow execution');
        return null;
      }

      // Get message content from node configuration
      const messageContent = node.data.config?.message || 'Automated message from workflow';
      const messageType = node.data.config?.messageType || 'text';

      // Validate phone number format
      let phoneNumber = contact.phone;
      if (!phoneNumber.startsWith('+')) {
        phoneNumber = '+' + phoneNumber;
      }

      // Prepare WhatsApp message payload
      let whatsappPayload;

      if (messageType === 'template') {
        whatsappPayload = {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: phoneNumber,
          type: "template",
          template: {
            name: node.data.config?.templateName,
            language: {
              code: node.data.config?.templateLanguage || 'en'
            }
          }
        };

        // Add components if provided
        if (node.data.config?.templateComponents?.length) {
          (whatsappPayload.template as any).components = node.data.config.templateComponents;
        }
      } else {
        // Default text message payload
        whatsappPayload = {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: phoneNumber,
          type: "text",
          text: {
            preview_url: false,
            body: messageContent
          }
        };
      }

      console.log('Workflow sending message:', JSON.stringify(whatsappPayload, null, 2));

      // Validate required environment variables
      if (!INT_TOKEN) {
        console.error('INTERAKT_API_TOKEN is not set');
        return null;
      }

      // Send message via Interakt API
      const interaktResponse = await fetch(
        `https://amped-express.interakt.ai/api/v17.0/${wabaAccount.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'x-access-token': INT_TOKEN,
            'x-waba-id': contact.wabaId,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(whatsappPayload)
        }
      );

      const responseText = await interaktResponse.text();
      console.log('Workflow message response:', responseText);

      if (!interaktResponse.ok) {
        console.error('Failed to send workflow message:', responseText);
        return null;
      }

      let interaktData;
      try {
        interaktData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse workflow message response:', parseError);
        return null;
      }

      // Record the message in conversation
      await this.recordMessageInConversation(
        contact,
        messageContent,
        messageType,
        interaktData.messages?.[0]?.id,
        user.name || 'Workflow',
        node.data.config?.templateName
      );

      console.log('Workflow message sent successfully');

      // Find next node
      const nextEdge = workflow.edges.find((edge: any) => edge.source === node.id);
      return nextEdge?.target || null;

    } catch (error) {
      console.error('Error executing action node:', error);
      return null;
    }
  }

  private async executeConditionNode(
    execution: WorkflowExecution,
    node: any,
    workflow: any
  ): Promise<string | null> {
    try {
      const conditionType = node.data.config?.conditionType;
      const conditionValue = node.data.config?.conditionValue;
      const messageContent = execution.variables.messageContent?.toLowerCase() || '';

      let result = false;

      if (conditionType && conditionValue) {
        const checkValue = conditionValue.toLowerCase();

        switch (conditionType) {
          case 'contains':
            result = messageContent.includes(checkValue);
            break;
          case 'equals':
            result = messageContent === checkValue;
            break;
          case 'starts_with':
            result = messageContent.startsWith(checkValue);
            break;
          case 'ends_with':
            result = messageContent.endsWith(checkValue);
            break;
          default:
            result = messageContent.includes(checkValue);
        }
      }

      console.log(`Condition evaluation: "${messageContent}" ${conditionType} "${conditionValue}" = ${result}`);

      // Find the appropriate edge based on condition result
      const targetHandle = result ? 'yes' : 'no';
      const nextEdge = workflow.edges.find((edge: any) =>
        edge.source === node.id && edge.sourceHandle === targetHandle
      );

      return nextEdge?.target || null;
    } catch (error) {
      console.error('Error executing condition node:', error);
      return null;
    }
  }

  private async executeDelayNode(
    execution: WorkflowExecution,
    node: any,
    workflow: any
  ): Promise<void> {
    const delayMinutes = node.data.config?.duration || 5; // Default 5 minutes
    const delayMs = delayMinutes * 60 * 1000;

    console.log(`Workflow delay: ${delayMinutes} minutes`);

    setTimeout(async () => {
      const nextEdge = workflow.edges.find((edge: any) => edge.source === node.id);
      if (nextEdge?.target) {
        execution.currentNodeId = nextEdge.target;
        execution.executionPath.push(nextEdge.target);
        await this.executeNextNode(execution.workflowId);
      } else {
        execution.status = 'completed';
        execution.completedAt = new Date();
      }
    }, delayMs);
  }

  private async executeWebhookNode(
    execution: WorkflowExecution,
    node: any,
    workflow: any
  ): Promise<string | null> {
    try {
      const webhookUrl = node.data.config?.webhookUrl;
      const webhookMethod = node.data.config?.webhookMethod || 'POST';

      if (!webhookUrl) {
        console.error('Webhook URL not configured');
        return null;
      }

      const webhookPayload = {
        workflowId: execution.workflowId,
        contactId: execution.contactId,
        executionId: execution.workflowId,
        variables: execution.variables,
        timestamp: new Date().toISOString()
      };

      const webhookResponse = await fetch(webhookUrl, {
        method: webhookMethod,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload)
      });

      console.log(`Webhook executed: ${webhookMethod} ${webhookUrl} - Status: ${webhookResponse.status}`);

      // Find next node
      const nextEdge = workflow.edges.find((edge: any) => edge.source === node.id);
      return nextEdge?.target || null;

    } catch (error) {
      console.error('Error executing webhook node:', error);
      return null;
    }
  }

  private async recordMessageInConversation(
    contact: any,
    messageContent: string,
    messageType: string,
    whatsappMessageId?: string,
    senderName?: string,
    templateName?: string
  ): Promise<void> {
    try {
      // Create or update conversation
      let conversation = await Conversation.findOne({ contactId: contact._id });

      const newMessage = {
        id: uuidv4(),
        senderId: 'agent' as const,
        content: messageContent,
        messageType: messageType,
        timestamp: new Date(),
        status: 'sent' as const,
        whatsappMessageId: whatsappMessageId,
        senderName: senderName || 'Workflow',
        templateName: messageType === 'template' ? templateName : undefined
      };

      if (conversation) {
        conversation.messages.push(newMessage);
        conversation.lastMessage = messageContent;
        conversation.lastMessageType = messageType;
        conversation.lastMessageAt = new Date();
        conversation.status = 'active';

        // Check if still within 24 hours
        const now = new Date();
        const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        conversation.isWithin24Hours = conversation.lastMessageAt > last24Hours;
      } else {
        conversation = new Conversation({
          contactId: contact._id,
          wabaId: contact.wabaId,
          phoneNumberId: contact.phoneNumberId,
          userId: contact.userId,
          messages: [newMessage],
          lastMessage: messageContent,
          lastMessageType: messageType,
          lastMessageAt: new Date(),
          isWithin24Hours: true
        });
      }

      await conversation.save();

      // Update contact's last message time
      contact.lastMessageAt = new Date();
      await contact.save();

      console.log('Workflow message recorded in conversation');
    } catch (error) {
      console.error('Error recording workflow message in conversation:', error);
    }
  }

  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId);
  }

  getAllExecutions(): WorkflowExecution[] {
    return Array.from(this.executions.values());
  }
}

export default WorkflowEngine;