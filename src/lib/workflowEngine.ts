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
  lastActivity?: Date;
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
      console.log(`\n🎬 STARTING WORKFLOW EXECUTION`);
      console.log(`   🔗 Workflow ID: ${workflowId}`);
      console.log(`   👤 Contact ID: ${contactId}`);
      console.log(`   📝 Trigger Data:`, triggerData);

      const workflow = await Workflow.findById(workflowId);
      if (!workflow) {
        throw new Error(`Workflow not found: ${workflowId}`);
      }

      if (!workflow.isActive) {
        throw new Error(`Workflow is not active: ${workflow.name}`);
      }

      console.log(`   ✅ Workflow found: "${workflow.name}" (Active: ${workflow.isActive})`);

      // Find trigger node
      const triggerNode = workflow.nodes.find((node: any) => node.type === 'trigger');
      if (!triggerNode) {
        throw new Error(`No trigger node found in workflow: ${workflow.name}`);
      }

      console.log(`   🎯 Trigger node found: ${triggerNode.id}`);

      const executionId = uuidv4();
      const execution: WorkflowExecution = {
        workflowId,
        contactId,
        currentNodeId: triggerNode.id,
        status: 'running',
        variables: { ...triggerData },
        executionPath: [triggerNode.id],
        createdAt: new Date(),
        lastActivity: new Date()
      };

      this.executions.set(executionId, execution);
      console.log(`   📋 Execution created: ${executionId}`);

      // Start execution
      await this.executeNextNode(executionId);

      return executionId;
    } catch (error) {
      console.error('❌ Error triggering workflow:', error);
      throw error;
    }
  }

  private async executeNextNode(executionId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      console.error(`❌ Execution not found: ${executionId}`);
      return;
    }

    try {
      console.log(`\n🔄 EXECUTING NODE: ${execution.currentNodeId}`);

      const workflow = await Workflow.findById(execution.workflowId);
      if (!workflow) {
        console.error(`❌ Workflow not found: ${execution.workflowId}`);
        execution.status = 'failed';
        return;
      }

      const currentNode = workflow.nodes.find((node: any) => node.id === execution.currentNodeId);
      if (!currentNode) {
        console.log(`✅ No more nodes to execute, marking as completed`);
        execution.status = 'completed';
        execution.completedAt = new Date();
        return;
      }

      console.log(`   🔧 Node type: ${currentNode.type}`);
      console.log(`   📝 Node data:`, currentNode.data);

      // Log all edges for debugging
      console.log(`   🔗 Available edges:`, workflow.edges.map((e: any) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle
      })));

      let nextNodeId: string | null = null;

      switch (currentNode.type) {
        case 'trigger':
          console.log(`   🎯 Executing trigger node`);
          nextNodeId = await this.executeTriggerNode(execution, currentNode, workflow);
          break;
        case 'action':
          console.log(`   🎬 Executing action node`);
          nextNodeId = await this.executeActionNode(execution, currentNode, workflow);
          break;
        case 'condition':
          console.log(`   🔀 Executing condition node`);
          nextNodeId = await this.executeConditionNode(execution, currentNode, workflow);
          break;
        case 'delay':
          console.log(`   ⏱️ Executing delay node`);
          await this.executeDelayNode(execution, currentNode, workflow);
          return; // Delay will schedule next execution
        case 'webhook':
          console.log(`   🔗 Executing webhook node`);
          nextNodeId = await this.executeWebhookNode(execution, currentNode, workflow);
          break;
        default:
          console.error(`   ❌ Unknown node type: ${currentNode.type}`);
          execution.status = 'failed';
          return;
      }

      console.log(`   🎯 Next node determined: ${nextNodeId}`);

      if (nextNodeId) {
        console.log(`   ➡️ Moving to next node: ${nextNodeId}`);
        execution.currentNodeId = nextNodeId;
        execution.executionPath.push(nextNodeId);
        execution.lastActivity = new Date();
        // Continue execution
        await this.executeNextNode(executionId);
      } else {
        if (execution.status !== 'paused') {
          console.log(`   ✅ Execution completed - no next node found`);
          execution.status = 'completed';
          execution.completedAt = new Date();
        } else {
          console.log(`   ⏸️ Execution paused - waiting for user input`);
        }
      }

      // Update workflow statistics
      if (execution.status === 'completed') {
        await Workflow.findByIdAndUpdate(execution.workflowId, {
          $inc: { successCount: 1, executionCount: 1 },
          lastTriggered: new Date()
        });
        console.log(`   ✅ Workflow completed successfully`);
      } else if (execution.status === 'failed') {
        await Workflow.findByIdAndUpdate(execution.workflowId, {
          $inc: { failureCount: 1, executionCount: 1 },
          lastTriggered: new Date()
        });
        console.log(`   ❌ Workflow failed`);
      }

    } catch (error) {
      console.error('❌ Error executing node:', error);
      execution.status = 'failed';
      await Workflow.findByIdAndUpdate(execution.workflowId, {
        $inc: { failureCount: 1, executionCount: 1 },
        lastTriggered: new Date()
      });
    }
  }

  private async executeTriggerNode(
    execution: WorkflowExecution,
    node: any,
    workflow: any
  ): Promise<string | null> {
    console.log(`     🎯 Processing trigger node: ${node.id}`);

    // Find next node connected to this trigger
    const nextEdge = workflow.edges.find((edge: any) => edge.source === node.id);

    if (nextEdge) {
      console.log(`     ➡️ Found next edge: ${nextEdge.source} -> ${nextEdge.target}`);
      return nextEdge.target;
    } else {
      console.log(`     ❌ No outgoing edge found from trigger node`);
      return null;
    }
  }

  private async executeActionNode(
    execution: WorkflowExecution,
    node: any,
    workflow: any
  ): Promise<string | null> {
    try {
      console.log(`🔄 Executing action node: ${node.id} for workflow: ${workflow.name}`);

      const actionType = node.data.config?.actionType || 'send_message';
      console.log(`   🎬 Action type: ${actionType}`);

      // Get contact and user information
      const contact = await Contact.findById(execution.contactId);
      if (!contact) {
        console.error('❌ Contact not found for workflow execution:', execution.contactId);
        return null;
      }

      console.log(`📞 Contact found: ${contact.name} (${contact.phone})`);

      const user = await User.findById(workflow.userId);
      if (!user) {
        console.error('❌ User not found for workflow execution:', workflow.userId);
        return null;
      }

      console.log(`👤 User found: ${user.name}`);

      // Find the WABA account
      const wabaAccount = user.wabaAccounts?.find((account: any) => account.wabaId === contact.wabaId);
      if (!wabaAccount) {
        console.error('❌ WABA account not found for workflow execution. Contact wabaId:', contact.wabaId);
        console.error('Available WABA accounts:', user.wabaAccounts?.map((acc: any) => acc.wabaId));
        return null;
      }

      console.log(`🏢 WABA account found: ${wabaAccount.wabaId}`);

      // Execute based on action type
      switch (actionType) {
        case 'send_message':
          return await this.executeSendMessage(execution, node, contact, wabaAccount, user, workflow);
        case 'send_button':
          return await this.executeSendButton(execution, node, contact, wabaAccount, user, workflow);
        case 'send_media':
          return await this.executeSendMedia(execution, node, contact, wabaAccount, user, workflow);
        case 'send_video':
          return await this.executeSendVideo(execution, node, contact, wabaAccount, user, workflow);
        case 'send_list':
          return await this.executeSendList(execution, node, contact, wabaAccount, user, workflow);
        case 'assign_conversation':
          return await this.executeAssignConversation(execution, node, contact, user, workflow);
        default:
          console.error(`❌ Unknown action type: ${actionType}`);
          return null;
      }

    } catch (error) {
      console.error('❌ Error executing action node:', error);
      return null;
    }
  }

  private async executeSendMessage(
    execution: WorkflowExecution,
    node: any,
    contact: any,
    wabaAccount: any,
    user: any,
    workflow: any
  ): Promise<string | null> {
    const messageContent = node.data.config?.message || 'Automated message from workflow';
    const messageType = node.data.config?.messageType || 'text';

    console.log(`📝 Message to send: "${messageContent}" (type: ${messageType})`);

    // Validate phone number format
    let phoneNumber = contact.phone;
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+' + phoneNumber;
    }

    console.log(`📱 Sending to phone: ${phoneNumber}`);

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

    return await this.sendWhatsAppMessage(execution, whatsappPayload, contact, wabaAccount, messageContent, messageType, user, node, workflow);
  }

  private async executeSendButton(
    execution: WorkflowExecution,
    node: any,
    contact: any,
    wabaAccount: any,
    user: any,
    workflow: any
  ): Promise<string | null> {
    const text = node.data.config?.text || 'Please choose an option:';
    const buttons = node.data.config?.buttons || [];

    console.log(`🔘 Button message: "${text}" with ${buttons.length} buttons`);

    // Validate phone number format
    let phoneNumber = contact.phone;
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+' + phoneNumber;
    }

    // Format buttons for WhatsApp API with proper IDs
    const formattedButtons = buttons.map((button: any, index: number) => {
      let buttonId = button.id || `btn_${index + 1}`;

      // Ensure button ID is provided for all button types
      if (!buttonId || buttonId.trim() === '') {
        buttonId = `button_${Date.now()}_${index}`;
      }

      return {
        type: 'reply',
        reply: {
          id: buttonId,
          title: button.text || `Button ${index + 1}`
        }
      };
    });

    // Validate we have at least one button with proper data
    if (formattedButtons.length === 0) {
      console.error('❌ No valid buttons found for button message');
      return null;
    }

    const whatsappPayload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phoneNumber,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text
        },
        action: {
          buttons: formattedButtons
        }
      }
    };

    // Send the button message
    const messageSent = await this.sendWhatsAppMessage(execution, whatsappPayload, contact, wabaAccount, text, 'interactive', user, node, workflow);

    if (messageSent) {
      console.log(`🔘 Button message sent successfully, pausing workflow for user input`);

      // Mark execution as paused and waiting for button input
      execution.status = 'paused';
      execution.variables.waitingForButtonInput = node.id;
      execution.lastActivity = new Date();

      // Return null to stop execution here - workflow will continue when button is clicked
      return null;
    } else {
      console.error('❌ Failed to send button message');
      return null;
    }
  }

  private async executeSendMedia(
    execution: WorkflowExecution,
    node: any,
    contact: any,
    wabaAccount: any,
    user: any,
    workflow: any
  ): Promise<string | null> {
    const mediaUrl = node.data.config?.mediaUrl;
    const caption = node.data.config?.caption || '';

    if (!mediaUrl) {
      console.error('❌ Media URL not provided');
      return null;
    }

    console.log(`📷 Media message: "${mediaUrl}" with caption: "${caption}"`);

    // Validate phone number format
    let phoneNumber = contact.phone;
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+' + phoneNumber;
    }

    // Check if mediaUrl is a handle (starts with alphanumeric) or URL
    const isMediaHandle = /^[a-zA-Z0-9]+$/.test(mediaUrl);

    const whatsappPayload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phoneNumber,
      type: "image",
      image: isMediaHandle ? {
        id: mediaUrl,
        caption: caption
      } : {
        link: mediaUrl,
        caption: caption
      }
    };

    return await this.sendWhatsAppMessage(execution, whatsappPayload, contact, wabaAccount, caption || 'Media message', 'image', user, node, workflow);
  }

  private async executeSendVideo(
    execution: WorkflowExecution,
    node: any,
    contact: any,
    wabaAccount: any,
    user: any,
    workflow: any
  ): Promise<string | null> {
    const videoUrl = node.data.config?.videoUrl;
    const caption = node.data.config?.caption || '';

    if (!videoUrl) {
      console.error('❌ Video URL not provided');
      return null;
    }

    console.log(`🎥 Video message: "${videoUrl}" with caption: "${caption}"`);

    // Validate phone number format
    let phoneNumber = contact.phone;
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+' + phoneNumber;
    }

    // Check if videoUrl is a handle (starts with alphanumeric) or URL
    const isMediaHandle = /^[a-zA-Z0-9]+$/.test(videoUrl);

    const whatsappPayload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phoneNumber,
      type: "video",
      video: isMediaHandle ? {
        id: videoUrl,
        caption: caption
      } : {
        link: videoUrl,
        caption: caption
      }
    };

    return await this.sendWhatsAppMessage(execution, whatsappPayload, contact, wabaAccount, caption || 'Video message', 'video', user, node, workflow);
  }

  private async executeSendList(
    execution: WorkflowExecution,
    node: any,
    contact: any,
    wabaAccount: any,
    user: any,
    workflow: any
  ): Promise<string | null> {
    const text = node.data.config?.text || 'Please choose an option:';
    const buttonText = node.data.config?.buttonText || 'Select';
    const sections = node.data.config?.sections || [];

    console.log(`📋 List message: "${text}" with ${sections.length} sections`);

    // Validate phone number format
    let phoneNumber = contact.phone;
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+' + phoneNumber;
    }

    const whatsappPayload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phoneNumber,
      type: "interactive",
      interactive: {
        type: "list",
        body: {
          text
        },
        action: {
          button: buttonText,
          sections
        }
      }
    };

    // Send the list message
    const messageSent = await this.sendWhatsAppMessage(execution, whatsappPayload, contact, wabaAccount, text, 'interactive', user, node, workflow);

    if (messageSent) {
      console.log(`📋 List message sent successfully, pausing workflow for user input`);

      // Mark execution as paused and waiting for list input
      execution.status = 'paused';
      execution.variables.waitingForListInput = node.id;
      execution.lastActivity = new Date();

      // Return null to stop execution here - workflow will continue when list item is selected
      return null;
    } else {
      console.error('❌ Failed to send list message');
      return null;
    }
  }

  private async executeAssignConversation(
    execution: WorkflowExecution,
    node: any,
    contact: any,
    user: any,
    workflow: any
  ): Promise<string | null> {
    const assignedToId = node.data.config?.assignedTo;

    if (!assignedToId) {
      console.error('❌ Assigned user ID not provided');
      return null;
    }

    console.log(`👤 Assigning conversation to user: ${assignedToId}`);

    try {
      // Find the user to assign to
      const assignedUser = await User.findById(assignedToId);
      if (!assignedUser) {
        console.error('❌ Assigned user not found');
        return null;
      }

      // Find the conversation
      const conversation = await Conversation.findOne({ contactId: contact._id });
      if (!conversation) {
        console.error('❌ Conversation not found');
        return null;
      }

      // Update the conversation
      conversation.assignedTo = assignedToId;
      await conversation.save();

      // Add a system message about the assignment
      const systemMessage = {
        id: uuidv4(),
        senderId: 'system',
        content: `Conversation assigned to ${assignedUser.name}`,
        messageType: 'system',
        timestamp: new Date(),
        status: 'sent'
      };

      await Conversation.findByIdAndUpdate(
        conversation._id,
        { $push: { messages: systemMessage } }
      );

      console.log(`✅ Conversation assigned to ${assignedUser.name}`);

      // Find next node
      const nextEdge = workflow.edges.find((edge: any) => edge.source === node.id);
      return nextEdge?.target || null;

    } catch (error) {
      console.error('❌ Error assigning conversation:', error);
      return null;
    }
  }

  private async sendWhatsAppMessage(
    execution: WorkflowExecution,
    whatsappPayload: any,
    contact: any,
    wabaAccount: any,
    messageContent: string,
    messageType: string,
    user: any,
    node: any,
    workflow: any
  ): Promise<string | null> {
    console.log('🚀 Workflow sending message payload:', JSON.stringify(whatsappPayload, null, 2));

    // Validate required environment variables
    if (!INT_TOKEN) {
      console.error('❌ INTERAKT_API_TOKEN is not set');
      return null;
    }

    console.log('🔐 API Token found, making request...');

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

    console.log('📡 Interakt API response status:', interaktResponse.status);

    const responseText = await interaktResponse.text();
    console.log('📡 Interakt API response:', responseText);

    if (!interaktResponse.ok) {
      console.error('❌ Failed to send workflow message:', responseText);
      return null;
    }

    let interaktData;
    try {
      interaktData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse workflow message response:', parseError);
      return null;
    }

    console.log('✅ Message sent successfully, recording in conversation...');

    // Record the message in conversation
    await this.recordMessageInConversation(
      contact,
      messageContent,
      messageType,
      interaktData.messages?.[0]?.id,
      user.name || 'Workflow',
      node.data.config?.templateName
    );

    console.log('✅ Workflow message recorded in conversation');

    // Find next node
    const nextEdge = workflow.edges.find((edge: any) => edge.source === node.id);
    const nextNodeId = nextEdge?.target || null;

    console.log(`🔄 Next node: ${nextNodeId}`);

    return nextNodeId;
  }

  private async executeConditionNode(
    execution: WorkflowExecution,
    node: any,
    workflow: any
  ): Promise<string | null> {
    try {
      // Check if we're waiting for user input
      const waitingForInput = node.data.config?.waitForUserInput !== false; // default true

      if (waitingForInput && !execution.variables.userReply) {
        console.log(`     ⏸️ Condition node waiting for user input`);

        // Mark execution as paused and waiting for input
        execution.status = 'paused';
        execution.variables.waitingForCondition = node.id;
        execution.lastActivity = new Date();

        return null; // Stop execution here
      }

      // Use user reply if available, otherwise fall back to trigger message
      const messageContent = (execution.variables.userReply || execution.variables.messageContent || '').toLowerCase();
      const conditionType = node.data.config?.conditionType;
      const conditionValue = node.data.config?.conditionValue;

      console.log(`     🔀 Evaluating condition: "${messageContent}" ${conditionType} "${conditionValue}"`);

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

      console.log(`     ✅ Condition result: ${result}`);

      // Clear the user reply after evaluation
      if (execution.variables.userReply) {
        delete execution.variables.userReply;
        delete execution.variables.waitingForCondition;
      }

      // Find edges from this condition node
      const outgoingEdges = workflow.edges.filter((edge: any) => edge.source === node.id);
      console.log(`     🔗 Found ${outgoingEdges.length} outgoing edges:`, outgoingEdges.map((e: any) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle
      })));

      if (outgoingEdges.length === 0) {
        console.log(`     ❌ No outgoing edges found from condition node`);
        return null;
      }

      // Try to find edge with specific handle first
      let nextEdge = outgoingEdges.find((edge: any) => edge.sourceHandle === (result ? 'yes' : 'no'));

      // If no handle-specific edge found, use the first edge if condition is true
      if (!nextEdge && result) {
        nextEdge = outgoingEdges[0];
        console.log(`     ⚠️ No handle-specific edge found, using first edge since condition is true`);
      }

      // For single edge workflows, proceed regardless of condition result
      if (!nextEdge && outgoingEdges.length === 1) {
        nextEdge = outgoingEdges[0];
        console.log(`     ⚠️ Single edge found, proceeding regardless of condition result`);
      }

      if (nextEdge) {
        console.log(`     ➡️ Following edge to: ${nextEdge.target} (condition: ${result})`);
        return nextEdge.target;
      } else {
        console.log(`     ❌ No suitable edge found`);
        return null;
      }
    } catch (error) {
      console.error('❌ Error executing condition node:', error);
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
        execution.lastActivity = new Date();

        // Find the execution ID for this execution
        const executionId = Array.from(this.executions.entries())
          .find(([_, exec]) => exec === execution)?.[0];

        if (executionId) {
          await this.executeNextNode(executionId);
        }
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
    templateName?: string,
    buttonData?: any,
    listData?: any
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
        templateName: messageType === 'template' ? templateName : undefined,
        buttons: buttonData || undefined,
        listData: listData || undefined
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

  // Updated method to continue workflow based on user input

  async continueWorkflow(
    workflowId: string,
    contactId: string,
    userInput: {
      buttonId?: string;
      buttonTitle?: string;
      messageType: 'button_click' | 'list_selection' | 'text_response';
      contextMessageId?: string;
      timestamp: Date;
      textContent?: string;
    }
  ): Promise<void> {
    console.log(`🔍 Looking for workflow execution:`);
    console.log(`   Workflow ID: ${workflowId}`);
    console.log(`   Contact ID: ${contactId}`);
    console.log(`   User input:`, userInput);

    // Log all current executions for debugging
    const allExecutions = Array.from(this.executions.values());
    console.log(`   📋 Total executions in memory: ${allExecutions.length}`);
    allExecutions.forEach((exec, index) => {
      console.log(`   Execution ${index + 1}: WorkflowID=${exec.workflowId}, ContactID=${exec.contactId}, Status=${exec.status}`);
    });

    // Find matching execution from the Map - try multiple ways to find it
    let execution = Array.from(this.executions.values()).find(
      exec => exec.workflowId === workflowId &&
        exec.contactId === contactId &&
        (exec.status === 'running' || exec.status === 'paused')
    );

    // If not found by exact match, try by contact ID only for recent executions
    if (!execution) {
      console.log(`❌ No exact match found, searching by contact ID only...`);
      const candidateExecutions = Array.from(this.executions.values()).filter(
        exec => exec.contactId === contactId &&
          (exec.status === 'running' || exec.status === 'paused') &&
          (Date.now() - exec.lastActivity.getTime()) < 30 * 60 * 1000 // Within last 30 minutes
      );

      console.log(`   Found ${candidateExecutions.length} candidate executions by contact ID`);
      candidateExecutions.forEach((exec, index) => {
        console.log(`   Candidate ${index + 1}: WorkflowID=${exec.workflowId}, Status=${exec.status}, LastActivity=${exec.lastActivity}`);
      });

      // Take the most recent one
      if (candidateExecutions.length > 0) {
        execution = candidateExecutions.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())[0];
        console.log(`✅ Found candidate execution: ${execution.workflowId} (${execution.status})`);
      }
    }

    if (!execution) {
      console.log('❌ No running/paused execution found to continue');
      return;
    }

    console.log(`🔄 Continuing workflow execution: ${execution.workflowId}`);
    console.log(`   Current node: ${execution.currentNodeId}`);
    console.log(`   Execution status: ${execution.status}`);
    console.log(`   Variables:`, execution.variables);

    try {
      const workflow = await Workflow.findById(execution.workflowId);
      if (!workflow) {
        throw new Error('Workflow not found');
      }

      // Handle text responses for paused condition nodes
      if (execution.status === 'paused' &&
        execution.variables.waitingForCondition &&
        userInput.messageType === 'text_response') {

        console.log(`📝 Resuming paused workflow with text response: "${userInput.textContent}"`);

        execution.variables.userReply = userInput.textContent;
        execution.status = 'running';
        delete execution.variables.waitingForCondition;
        execution.lastActivity = new Date();

        const executionId = Array.from(this.executions.entries())
          .find(([_, exec]) => exec === execution)?.[0];

        if (executionId) {
          await this.executeNextNode(executionId);
        }
        return;
      }

      // Handle button clicks for paused button nodes
      if (execution.status === 'paused' &&
        (execution.variables.waitingForButtonInput || execution.variables.waitingForListInput) &&
        (userInput.messageType === 'button_click' || userInput.messageType === 'list_selection')) {

        console.log(`🔘 Resuming paused workflow with button/list interaction: "${userInput.buttonId}"`);

        // Find the next node based on button/list ID
        const nextNodeId = this.findNextNodeForButtonClick(
          workflow,
          execution.currentNodeId,
          userInput.buttonId || ''
        );

        if (nextNodeId) {
          console.log(`➡️ Moving to next node based on interaction: ${nextNodeId}`);
          execution.currentNodeId = nextNodeId;
          execution.executionPath.push(nextNodeId);
          execution.status = 'running';
          delete execution.variables.waitingForButtonInput;
          delete execution.variables.waitingForListInput;
          execution.lastActivity = new Date();

          const executionId = Array.from(this.executions.entries())
            .find(([_, exec]) => exec === execution)?.[0];
          if (executionId) {
            await this.executeNextNode(executionId);
          }
        } else {
          console.log('🏁 No next node found for interaction, completing execution');
          execution.status = 'completed';
          execution.completedAt = new Date();
          delete execution.variables.waitingForButtonInput;
          delete execution.variables.waitingForListInput;
        }
        return;
      }

      // Handle button/list interactions for running workflows (legacy support)
      if (execution.status === 'running') {
        console.log(`🔄 Handling interaction for running workflow`);

        const contact = await Contact.findById(contactId);
        if (!contact) {
          throw new Error('Contact not found');
        }

        const user = await User.findById(workflow.userId);
        if (!user) {
          throw new Error('User not found');
        }

        const wabaAccount = user.wabaAccounts?.find((acc: any) => acc.wabaId === workflow.wabaId);
        if (!wabaAccount) {
          throw new Error('WABA account not found');
        }

        const currentNode = workflow.nodes.find((node: any) => node.id === execution.currentNodeId);
        if (!currentNode) {
          throw new Error('Current node not found');
        }

        let nextNodeId: string | null = null;

        if (currentNode.type === 'action' &&
          (currentNode.data.config?.actionType === 'send_button' ||
            currentNode.data.config?.actionType === 'send_list')) {

          nextNodeId = this.findNextNodeForButtonClick(
            workflow,
            currentNode.id,
            userInput.buttonId || ''
          );
        }

        if (nextNodeId) {
          console.log(`➡️ Moving to next node: ${nextNodeId}`);
          execution.currentNodeId = nextNodeId;
          execution.executionPath.push(nextNodeId);
          execution.lastActivity = new Date();

          const executionId = Array.from(this.executions.entries())
            .find(([_, exec]) => exec === execution)?.[0];
          if (executionId) {
            await this.executeNextNode(executionId);
          }
        } else {
          console.log('🏁 No next node found, completing execution');
          execution.status = 'completed';
          execution.completedAt = new Date();
        }
      }

    } catch (error) {
      console.error('❌ Error continuing workflow:', error);
      execution.status = 'failed';
      execution.variables.error = error instanceof Error ? error.message : 'Unknown error';
    }
  }
  // Helper method to find next node based on button click
  private findNextNodeForButtonClick(
    workflow: any,
    currentNodeId: string,
    buttonId: string
  ): string | null {
    // Look for edges that start from the current node and have the button ID as a label or condition
    const matchingEdge = workflow.edges.find((edge: any) =>
      edge.source === currentNodeId &&
      (edge.sourceHandle === buttonId || edge.label === buttonId)
    );

    return matchingEdge?.target || null;
  }

  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId);
  }

  getAllExecutions(): WorkflowExecution[] {
    return Array.from(this.executions.values());
  }
}

export default WorkflowEngine;