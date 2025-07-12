import Workflow from '@/models/Workflow';
import Contact from '@/models/Contact';
import Conversation from '@/models/Conversation';
import { v4 as uuidv4 } from 'uuid';

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
    // Send message logic would go here
    // For now, just find the next node
    const nextEdge = workflow.edges.find((edge: any) => edge.source === node.id);
    return nextEdge?.target || null;
  }

  private async executeConditionNode(
    execution: WorkflowExecution,
    node: any,
    workflow: any
  ): Promise<string | null> {
    // Evaluate condition logic would go here
    // For now, randomly choose yes/no path
    const result = Math.random() > 0.5 ? 'yes' : 'no';

    const nextEdge = workflow.edges.find((edge: any) =>
      edge.source === node.id && edge.sourceHandle === result
    );
    return nextEdge?.target || null;
  }

  private async executeDelayNode(
    execution: WorkflowExecution,
    node: any,
    workflow: any
  ): Promise<void> {
    const delayMs = node.data.config?.delayMs || 300000; // 5 minutes default

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
    // Webhook execution logic would go here
    const nextEdge = workflow.edges.find((edge: any) => edge.source === node.id);
    return nextEdge?.target || null;
  }

  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId);
  }

  getAllExecutions(): WorkflowExecution[] {
    return Array.from(this.executions.values());
  }
}

export default WorkflowEngine;
