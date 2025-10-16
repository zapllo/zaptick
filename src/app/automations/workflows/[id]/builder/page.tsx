"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  Panel,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import { useHotkeys } from "react-hotkeys-hook";
import {
  Save,
  Play,
  Pause,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize,
  Settings,
  ArrowLeft,
  Plus,
  Trash2,
  MessageSquare,
  GitBranch,
  Webhook,
  Bot,
  Send,
  Timer,
  Grid3X3,
  Move,
  Download,
  Copy,
  Eye,
  Zap,
  Layers,
  Sparkles,
  Activity,
  Circle,
  PlayCircle,
  StopCircle,
  Gauge,
  Workflow,
  FileText,
  Image,
  Video,
  List,
  MousePointer,
  Upload,
  Link,
  Type,
  Users,
  CheckCircle,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Layout from "@/components/layout/Layout";

// Import the simple node for testing
import SimpleNode from "@/components/workflow/nodes/SimpleNode";
import TriggerNode from "@/components/workflow/nodes/TriggerNode";
import ConditionNode from "@/components/workflow/nodes/ConditionNode";
import ActionNode from "@/components/workflow/nodes/ActionNode";

// Import DelayNode
import DelayNode from "@/components/workflow/nodes/DelayNode";

// Define node types
const nodeTypes = {
  trigger: TriggerNode,
  condition: ConditionNode,
  action: ActionNode,
  delay: DelayNode,
  webhook: ActionNode, // Use ActionNode for webhook as well
}

interface WorkflowData {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  nodes: Node[];
  edges: Edge[];
  viewport: { x: number; y: number; zoom: number };
  version: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

const nodeTemplates = [
  {
    type: "trigger",
    label: "Message Trigger",
    icon: MessageSquare,
    color: "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100",
  },
  {
    type: "condition",
    label: "Condition",
    icon: GitBranch,
    color: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
  },
  {
    type: "delay",
    label: "Delay",
    icon: Timer,
    color: "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100",
  },
  {
    type: "webhook",
    label: "Webhook",
    icon: Webhook,
    color: "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100",
  },
];

const actionTemplates = [
  {
    type: "send_message",
    label: "Text Message",
    icon: Type,
    color: "bg-green-50 border-green-200 text-green-700 hover:bg-green-100",
  },
  {
    type: "send_button",
    label: "Button Message",
    icon: MousePointer,
    color: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
  },
  {
    type: "send_media",
    label: "Media Message",
    icon: Image,
    color: "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100",
  },
  {
    type: "send_video",
    label: "Video Message",
    icon: Video,
    color: "bg-red-50 border-red-200 text-red-700 hover:bg-red-100",
  },
  {
    type: "send_list",
    label: "List Message",
    icon: List,
    color: "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100",
  },
  {
    type: "assign_conversation",
    label: "Assign Conversation",
    icon: Users,
    color: "bg-cyan-50 border-cyan-200 text-cyan-700 hover:bg-cyan-100",
  },
];

const allTemplates = [...nodeTemplates, ...actionTemplates];

function WorkflowBuilderContent() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const {
    getViewport,
    setViewport,
    fitView,
    zoomIn,
    zoomOut,
    screenToFlowPosition,
  } = useReactFlow();

  const [workflow, setWorkflow] = useState<WorkflowData | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [isNodePanelOpen, setIsNodePanelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [companyUsers, setCompanyUsers] = useState<User[]>([]);

  // History management
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [zoom, setZoom] = useState(1);

  // Load workflow data
  useEffect(() => {
    const loadWorkflow = async () => {
      try {
        const response = await fetch(`/api/workflows/${params.id}`);
        const data = await response.json();

        if (data.success) {
          setWorkflow(data.workflow);

          if (nodes.length === 0) {
            const workflowNodes = data.workflow.nodes || [];
            const workflowEdges = data.workflow.edges || [];

            console.log('Loading workflow nodes:', workflowNodes);
            setNodes(workflowNodes);
            setEdges(workflowEdges);
          }

          if (data.workflow.viewport) {
            setTimeout(() => {
              setViewport(data.workflow.viewport);
            }, 100);
          }
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to load workflow",
            variant: "destructive",
          });
          router.push("/automations/workflows");
        }
      } catch (error) {
        console.error("Error loading workflow:", error);
        toast({
          title: "Error",
          description: "Failed to load workflow",
          variant: "destructive",
        });
        router.push("/automations/workflows");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id && isLoading) {
      loadWorkflow();
    }
  }, [params.id, isLoading]);

  // Load company users
  useEffect(() => {
    const loadCompanyUsers = async () => {
      try {
        const response = await fetch('/api/auth/company-users');
        const data = await response.json();
        if (data.success) {
          setCompanyUsers(data.users);
        }
      } catch (error) {
        console.error('Failed to load company users:', error);
      }
    };
    loadCompanyUsers();
  }, []);

  // Save workflow
  const saveWorkflow = useCallback(async () => {
    if (!workflow) return;

    setIsSaving(true);
    try {
      const viewport = getViewport();
      const response = await fetch(`/api/workflows/${workflow._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nodes,
          edges,
          viewport,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Workflow saved successfully",
        });
        setWorkflow(data.workflow);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to save workflow",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving workflow:", error);
      toast({
        title: "Error",
        description: "Failed to save workflow",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [workflow, nodes, edges, getViewport, toast]);

  // History management
  const addToHistory = useCallback(() => {
    const newHistoryItem = { nodes: [...nodes], edges: [...edges] };
    setHistory(prev => [...prev, newHistoryItem]);
    setHistoryIndex(prev => prev + 1);
  }, [nodes, edges]);

  // Undo/Redo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // Keyboard shortcuts
  useHotkeys("ctrl+s, cmd+s", (e) => {
    e.preventDefault();
    saveWorkflow();
  }, [saveWorkflow]);

  useHotkeys("ctrl+z, cmd+z", (e) => {
    e.preventDefault();
    undo();
  }, [undo]);

  useHotkeys("ctrl+y, cmd+y, ctrl+shift+z, cmd+shift+z", (e) => {
    e.preventDefault();
    redo();
  }, [redo]);

  useHotkeys("ctrl+1, cmd+1", (e) => {
    e.preventDefault();
    fitView();
  }, [fitView]);

  useHotkeys("escape", (e) => {
    e.preventDefault();
    setSelectedNodeId(null);
    setIsNodePanelOpen(false);
  }, []);

  useHotkeys("ctrl+b, cmd+b", (e) => {
    e.preventDefault();
    setSidebarVisible(!sidebarVisible);
  }, [sidebarVisible]);

  // Handle connection with improved condition node support
  const onConnect = useCallback(
    (params: Connection) => {
      console.log('Connecting nodes:', params);

      const sourceNode = nodes.find(n => n.id === params.source);
      let newEdge = {
        ...params,
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 },
      };

      if (sourceNode?.type === 'condition' && !params.sourceHandle) {
        newEdge.sourceHandle = 'yes';
      }

      const updatedEdges = addEdge(newEdge, edges);
      setEdges(updatedEdges);
      addToHistory();
    },
    [edges, nodes, setEdges, addToHistory]
  );

  // Handle node drag
  const onNodeDrag = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (snapToGrid) {
        const gridSize = 20;
        node.position.x = Math.round(node.position.x / gridSize) * gridSize;
        node.position.y = Math.round(node.position.y / gridSize) * gridSize;
      }
    },
    [snapToGrid]
  );

  // Handle node drag end
  // Enhanced snap-to-grid functionality
  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (snapToGrid) {
        const gridSize = 20;
        const snappedX = Math.round(node.position.x / gridSize) * gridSize;
        const snappedY = Math.round(node.position.y / gridSize) * gridSize;

        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id
              ? {
                ...n,
                position: { x: snappedX, y: snappedY },
                // Add visual feedback for snapping
                style: {
                  ...n.style,
                  transition: 'all 0.1s ease-out'
                }
              }
              : n
          )
        );
      }
      addToHistory();
    },
    [snapToGrid, setNodes, addToHistory]
  );

  // Enhanced add node function with snap support
  const addNode = useCallback(
    (type: string, position?: { x: number; y: number }, actionType?: string) => {
      const nodeTemplate = nodeTemplates.find(t => t.type === type);
      const actionTemplate = actionTemplates.find(t => t.type === actionType);

      const template = nodeTemplate || actionTemplate;
      if (!template) return;

      let defaultPosition = position || {
        x: 300 + Math.random() * 200,
        y: 200 + Math.random() * 200
      };

      // Apply snap to grid if enabled
      if (snapToGrid) {
        const gridSize = 20;
        defaultPosition.x = Math.round(defaultPosition.x / gridSize) * gridSize;
        defaultPosition.y = Math.round(defaultPosition.y / gridSize) * gridSize;
      }

      const newNode: Node = {
        id: `${actionType || type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: actionType ? 'action' : type,
        position: defaultPosition,
        data: {
          label: template.label,
          type: actionType ? 'action' : type,
          config: {
            ...(actionType && { actionType }),
          },
        },
        style: {
          transition: 'all 0.2s ease-out'
        }
      };

      setNodes((currentNodes) => [...currentNodes, newNode]);
      addToHistory();

      toast({
        title: "Node Added",
        description: `${template.label} added to workflow`,
      });
    },
    [setNodes, addToHistory, toast, snapToGrid]
  );
  // Drag and drop handlers
  const onDragStart = useCallback((event: React.DragEvent, nodeType: string, actionType?: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    if (actionType) {
      event.dataTransfer.setData('application/actiontype', actionType);
    }
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      const actionType = event.dataTransfer.getData('application/actiontype');
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position, actionType);
    },
    [screenToFlowPosition, addNode]
  );

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.stopPropagation();
    setSelectedNodeId(node.id);
    setIsNodePanelOpen(true);
  }, []);

  // Handle canvas click
  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setIsNodePanelOpen(false);
  }, []);

  // Delete selected nodes
  const deleteSelectedNodes = useCallback(() => {
    if (selectedNodeId) {
      setNodes((nds) => nds.filter((node) => node.id !== selectedNodeId));
      setEdges((eds) => eds.filter((edge) =>
        edge.source !== selectedNodeId && edge.target !== selectedNodeId
      ));
      setSelectedNodeId(null);
      setIsNodePanelOpen(false);
      addToHistory();
      toast({
        title: "Node Deleted",
        description: "Node and its connections have been removed",
      });
    }
  }, [selectedNodeId, setNodes, setEdges, addToHistory, toast]);

  useHotkeys("delete, backspace", deleteSelectedNodes, [deleteSelectedNodes]);

  // Execute workflow
  const executeWorkflow = useCallback(async () => {
    if (!workflow) return;

    setIsExecuting(true);
    try {
      toast({
        title: "Workflow Executing",
        description: "Workflow execution started",
      });

      setTimeout(() => {
        setIsExecuting(false);
        toast({
          title: "Execution Complete",
          description: "Workflow executed successfully",
        });
      }, 3000);
    } catch (error) {
      setIsExecuting(false);
      toast({
        title: "Execution Failed",
        description: "Failed to execute workflow",
        variant: "destructive",
      });
    }
  }, [workflow, toast]);

const uploadMediaFile = useCallback(async (file: File, type: string) => {
  setIsUploadingMedia(true);
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type.toUpperCase());

    const response = await fetch('/api/upload-media', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (response.ok && data.success && data.url) {
      toast({
        title: "Media Uploaded",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} file uploaded successfully`,
      });
      return data.url;
    } else {
      throw new Error(data.error || 'Failed to upload media');
    }
  } catch (error) {
    console.error('Error uploading media:', error);
    toast({
      title: "Upload Failed",
      description: `Failed to upload ${type} file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      variant: "destructive",
    });
    return null;
  } finally {
    setIsUploadingMedia(false);
  }
}, [toast]);

// Add file type validation function
const validateFileType = (file: File, expectedType: string): boolean => {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'application/rtf'
  ];

  switch (expectedType) {
    case 'image':
      return file.type.startsWith('image/');
    case 'video':
      return file.type.startsWith('video/');
    case 'document':
      return documentTypes.includes(file.type);
    default:
      return true;
  }
};
  const selectedNode = nodes.find(node => node.id === selectedNodeId);

  if (isLoading) {
    return (
      <Layout>
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center">
            <div className="relative">
              <Workflow className="h-16 w-16 animate-pulse mx-auto mb-4 text-primary" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Workflow Builder</h2>
            <p className="text-gray-600">Preparing your automation canvas...</p>
          </div>
        </div>
      </Layout>
    );
  }


  return (
    <Layout>
      <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/60 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/automations/workflows")}
                  className="hover:bg-gray-100/80 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </div>

              <div className="h-8 w-px bg-gray-200" />

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg">
                    <Workflow className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{workflow?.name}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        v{workflow?.version}
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers className="h-3 w-3" />
                        {nodes.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {edges.length}
                      </span>
                    </div>
                  </div>
                </div>

                <Badge
                  variant={workflow?.isActive ? "default" : "secondary"}
                  className={cn(
                    "px-3 py-1 font-medium",
                    workflow?.isActive
                      ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"
                  )}
                >
                  <Circle className={cn("h-2 w-2 mr-1", workflow?.isActive ? "fill-green-600" : "fill-gray-400")} />
                  {workflow?.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Sidebar Toggle Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarVisible(!sidebarVisible)}
                className="h-8 w-8 p-0"
                title={sidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
              >
                <Layers className="h-4 w-4" />
              </Button>

              <div className="h-8 w-px bg-gray-200" />

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 p-1 bg-gray-100/80 rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => zoomOut()}
                  className="h-8 w-8 p-0"
                >
                  <ZoomOut className="h-3 w-3" />
                </Button>

                <div className="px-3 py-1 text-xs font-medium text-gray-600 min-w-[3rem] text-center">
                  {Math.round(zoom * 100)}%
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => zoomIn()}
                  className="h-8 w-8 p-0"
                >
                  <ZoomIn className="h-3 w-3" />
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="h-8 w-8 p-0"
                >
                  <Undo className="h-3 w-3" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="h-8 w-8 p-0"
                >
                  <Redo className="h-3 w-3" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fitView()}
                  className="h-8 w-8 p-0"
                >
                  <Maximize className="h-3 w-3" />
                </Button>
              </div>

              <div className="h-8 w-px bg-gray-200" />

              {/* Grid Toggle */}
              <div className="flex items-center gap-2">
                <Switch
                  checked={showGrid}
                  onCheckedChange={setShowGrid}
                  className="scale-75"
                />
                <span className="text-xs text-gray-600">Grid</span>
              </div>

              {/* Snap Toggle */}
              <div className="flex items-center gap-2">
                <Switch
                  checked={snapToGrid}
                  onCheckedChange={setSnapToGrid}
                  className="scale-75"
                />
                <span className="text-xs text-gray-600">Snap</span>
              </div>

              <div className="h-8 w-px bg-gray-200" />

              {/* More Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Settings className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Workflow Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={executeWorkflow} disabled={isExecuting}>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Test Run
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </DropdownMenuItem> */}
                  {/* <DropdownMenuItem>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem> */}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Save Button */}
              <Button
                onClick={saveWorkflow}
                disabled={isSaving}
                className="text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </Button>

              {/* Activate/Deactivate */}
              <Button
                variant={workflow?.isActive ? "destructive" : "default"}
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/workflows/${workflow?._id}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ isActive: !workflow?.isActive }),
                    });

                    const data = await response.json();
                    if (data.success) {
                      setWorkflow(data.workflow);
                      toast({
                        title: "Success",
                        description: `Workflow ${!workflow?.isActive ? 'activated' : 'deactivated'}`,
                      });
                    }
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to update workflow status",
                      variant: "destructive",
                    });
                  }
                }}
                className="shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {workflow?.isActive ? (
                  <>
                    <StopCircle className="h-4 w-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sleek Sidebar */}
          {/* Enhanced Collapsible Sidebar */}
          {sidebarVisible && (
            <div className="w-64 bg-white/95 backdrop-blur-lg border-r border-gray-200/60 flex flex-col shadow-lg relative">
              {/* Sidebar Header with Collapse Button */}
              <div className="p-4 border-b border-gray-200/60 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Workflow Nodes
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarVisible(false)}
                  className="h-7 w-7 p-0 hover:bg-gray-100/80 transition-colors"
                  title="Collapse Sidebar"
                >
                  <ArrowLeft className="h-3 w-3" />
                </Button>
              </div>

              {/* Node Templates */}
              <div className="flex-1 p-3 overflow-y-auto">
                <div className="space-y-2">
                  {allTemplates.map((template) => (
                    <div
                      key={`${template.type}-${template.label}`}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-sm group hover:scale-[1.02]",
                        template.color
                      )}
                      draggable
                      onDragStart={(event) => {
                        if (actionTemplates.some(t => t.type === template.type)) {
                          onDragStart(event, 'action', template.type);
                        } else {
                          onDragStart(event, template.type);
                        }
                      }}
                    >
                      <div className="p-1.5 bg-white/60 rounded-md group-hover:bg-white/80 transition-colors shadow-sm">
                        <template.icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium truncate">{template.label}</span>
                    </div>
                  ))}
                </div>

                {/* Quick Add Section */}
                <div className="mt-6 pt-4 border-t border-gray-200/60">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Quick Add</h4>
                  <div className="space-y-2">
                    <Button
                      onClick={() => addNode("trigger", { x: 400, y: 200 })}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                    >
                      <MessageSquare className="h-3 w-3 mr-2" />
                      Add Trigger
                    </Button>
                    <Button
                      onClick={() => addNode("action", { x: 400, y: 350 }, "send_message")}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-purple-700 border-purple-200 hover:bg-purple-50"
                    >
                      <Send className="h-3 w-3 mr-2" />
                      Add Action
                    </Button>
                  </div>
                </div>
              </div>

              {/* Sidebar Footer */}
              <div className="p-3 border-t border-gray-200/60 bg-gray-50/50">
                <div className="text-xs text-gray-500 text-center">
                  Drag nodes to canvas or use quick add
                </div>
              </div>
            </div>
          )}

          {/* Canvas */}
          <div className="flex-1 relative bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Floating Sidebar Toggle (when sidebar is hidden) */}
            {!sidebarVisible && (
              <div className="absolute top-4 left-4 z-10">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setSidebarVisible(true)}
                  className="shadow-lg hover:shadow-xl transition-all duration-200 bg-white/90 backdrop-blur-lg border border-gray-200/60 text-gray-700 hover:bg-white"
                >
                  <Layers className="h-4 w-4 mr-2" />
                  Show Nodes
                </Button>
              </div>
            )}

            <div ref={reactFlowWrapper} className="h-full">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onNodeDrag={onNodeDrag}
                onNodeDragStop={onNodeDragStop}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                onMove={(event, viewport) => setZoom(viewport.zoom)}
                nodeTypes={nodeTypes}
                snapToGrid={snapToGrid}
                snapGrid={[20, 20]}
                defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                attributionPosition="bottom-left"
                className="transition-all duration-300"
                proOptions={{ hideAttribution: true }}
                fitView
                fitViewOptions={{ padding: 0.2 }}
              >
                <Controls
                  position="bottom-right"
                  showInteractive={false}
                  className="bg-white/80 backdrop-blur-lg border border-gray-200/60 shadow-xl rounded-xl overflow-hidden"
                />
                <MiniMap
                  position="bottom-left"
                  className="bg-white/80 backdrop-blur-lg border border-gray-200/60 shadow-xl rounded-xl overflow-hidden"
                  maskColor="rgba(0,0,0,0.1)"
                  nodeColor={(node) => {
                    const template = allTemplates.find(t => t.type === node.type || (node.data.config?.actionType === t.type));
                    return template?.color?.includes('emerald') ? '#10b981' :
                      template?.color?.includes('blue') ? '#3b82f6' :
                        template?.color?.includes('purple') ? '#8b5cf6' :
                          template?.color?.includes('amber') ? '#f59e0b' :
                            template?.color?.includes('rose') ? '#f43f5e' :
                              template?.color?.includes('green') ? '#22c55e' :
                                template?.color?.includes('red') ? '#ef4444' :
                                  template?.color?.includes('orange') ? '#f97316' :
                                    template?.color?.includes('cyan') ? '#06b6d4' : '#6b7280';
                  }}
                />

                {/* Enhanced Background with working grid */}
                {showGrid && (
                  <Background
                    variant={showGrid ? BackgroundVariant.Dots : BackgroundVariant.Cross}
                    gap={20}
                    size={showGrid ? 2 : 0}
                    color={showGrid ? "#94a3b8" : "transparent"}
                    className={cn(
                      "transition-all duration-300",
                      showGrid ? "opacity-100" : "opacity-0"
                    )}
                  />
                )}

                {/* Empty state */}
                {nodes.length === 0 && (
                  <Panel position="top-center">
                    <Card className="text-center p-8 bg-white/90 backdrop-blur-lg border-gray-200/60 shadow-2xl max-w-md mx-auto">
                      <CardContent className="space-y-6">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-2xl" />
                          <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 p-4 rounded-2xl">
                            <Sparkles className="h-12 w-12 text-primary mx-auto" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-gray-900">Start Building</h3>
                          <p className="text-gray-600">
                            {sidebarVisible ? "Drag nodes from the sidebar to create your workflow" : "Show the sidebar to access nodes and start building"}
                          </p>
                        </div>

                        <div className="space-y-3">
                          {!sidebarVisible && (
                            <Button
                              onClick={() => setSidebarVisible(true)}
                              className="w-full bg-gradient-to-r from-primary/90 to-secondary/90 hover:from-primary hover:to-secondary text-white shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                              <Layers className="h-4 w-4 mr-2" />
                              Show Node Library
                            </Button>
                          )}
                          <Button
                            onClick={() => addNode("trigger", { x: 400, y: 200 })}
                            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Add Trigger
                          </Button>
                          <Button
                            onClick={() => addNode("action", { x: 400, y: 350 }, "send_message")}
                            variant="outline"
                            className="w-full border-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Add Action
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Panel>
                )}

                {/* Status Panel */}
                <Panel position="top-right" className={cn(!sidebarVisible && "top-16")}>
                  <Card className="bg-white/80 scale-90 backdrop-blur-lg border-gray-200/60 shadow-lg">
                    <CardContent className="px-3 py-0">
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <Activity className="h-3 w-3 text-blue-500" />
                          <span className="font-medium">{nodes.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="h-3 w-3 text-purple-500" />
                          <span className="font-medium">{edges.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Gauge className="h-3 w-3 text-green-500" />
                          <span className="font-medium">{Math.round(zoom * 100)}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Panel>

                {/* Execution Status */}
                {isExecuting && (
                  <Panel position="top-right" className={cn(!sidebarVisible ? "top-28" : "top-16")}>
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                          <span className="font-medium text-blue-700">Executing...</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Panel>
                )}
              </ReactFlow>
            </div>
          </div>

          {/* Node Properties Panel */}
          <Sheet open={isNodePanelOpen} onOpenChange={setIsNodePanelOpen}>
            <SheetContent className="sm:max-w-[800px] max-h-[100vh] flex flex-col p-0 overflow-hidden">
              <SheetHeader className="px-6 py-4 border-b border-slate-300 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                    <Settings className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <SheetTitle className="text-xl font-semibold text-slate-900">
                      Node Properties
                    </SheetTitle>
                    <SheetDescription className="text-slate-600">
                      Configure the selected node settings and behavior
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              {selectedNode && (
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  <div className="space-y-8">
                    {/* Node Information */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                          Node Information
                        </h3>
                      </div>

                      <Card className="bg-slate-50/50 border-slate-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200">
                              {selectedNode.type === 'action' ? (
                                actionTemplates.find(t => t.type === selectedNode.data.config?.actionType)?.icon ? (
                                  React.createElement(actionTemplates.find(t => t.type === selectedNode.data.config?.actionType)!.icon, {
                                    className: "h-5 w-5 text-slate-700"
                                  })
                                ) : (
                                  <Send className="h-5 w-5 text-slate-700" />
                                )
                              ) : (
                                nodeTemplates.find(t => t.type === selectedNode.type)?.icon && (
                                  React.createElement(nodeTemplates.find(t => t.type === selectedNode.type)!.icon, {
                                    className: "h-5 w-5 text-slate-700"
                                  })
                                )
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-900">{selectedNode.data.label}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="capitalize border-slate-300 text-slate-600">
                                  {selectedNode.type}
                                </Badge>
                                {selectedNode.data.config?.actionType && (
                                  <Badge variant="secondary" className="capitalize bg-slate-100 text-slate-700">
                                    {selectedNode.data.config.actionType.replace('_', ' ')}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Basic Settings */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                          Basic Settings
                        </h3>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="node-label" className="text-sm font-medium text-slate-700">
                          Node Label <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="node-label"
                          value={selectedNode.data.label}
                          onChange={(e) => {
                            setNodes((nds) =>
                              nds.map((node) =>
                                node.id === selectedNode.id
                                  ? { ...node, data: { ...node.data, label: e.target.value } }
                                  : node
                              )
                            );
                          }}
                          className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    {/* Type-specific Configuration */}
                    {selectedNode.type === 'trigger' && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                            Trigger Configuration
                          </h3>
                        </div>

                        <Card className="bg-white border-slate-200">
                          <CardContent className="p-4 space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="trigger-keywords" className="text-sm font-medium text-slate-700">
                                Keywords (comma-separated)
                              </Label>
                              <Input
                                id="trigger-keywords"
                                placeholder="hello, hi, start, help"
                                value={selectedNode.data.config?.keywords || ''}
                                onChange={(e) => {
                                  setNodes((nds) =>
                                    nds.map((node) =>
                                      node.id === selectedNode.id
                                        ? {
                                          ...node,
                                          data: {
                                            ...node.data,
                                            config: {
                                              ...node.data.config,
                                              keywords: e.target.value
                                            }
                                          }
                                        }
                                        : node
                                    )
                                  );
                                }}
                                className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                              />
                              <p className="text-xs text-slate-500">
                                Add keywords that will trigger this workflow
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {selectedNode.type === 'action' && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                            Action Configuration
                          </h3>
                        </div>

                        <Card className="bg-white border-slate-200">
                          <CardContent className="p-4 space-y-6">
                            {/* Action Type Selection */}
                            <div className="space-y-2">
                              <Label htmlFor="action-type" className="text-sm font-medium text-slate-700">
                                Action Type <span className="text-red-500">*</span>
                              </Label>
                              <Select
                                value={selectedNode.data.config?.actionType || 'send_message'}
                                onValueChange={(value) => {
                                  const actionTemplate = actionTemplates.find(t => t.type === value);
                                  setNodes((nds) =>
                                    nds.map((node) =>
                                      node.id === selectedNode.id
                                        ? {
                                          ...node,
                                          data: {
                                            ...node.data,
                                            label: actionTemplate?.label || node.data.label,
                                            config: {
                                              ...node.data.config,
                                              actionType: value
                                            }
                                          }
                                        }
                                        : node
                                    )
                                  );
                                }}
                              >
                                <SelectTrigger className="bg-white border-slate-200">
                                  <SelectValue placeholder="Select action type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {actionTemplates.map((template) => (
                                    <SelectItem key={template.type} value={template.type}>
                                      {template.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Send Message Configuration */}
                            {selectedNode.data.config?.actionType === 'send_message' && (
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="message-type" className="text-sm font-medium text-slate-700">
                                    Message Type
                                  </Label>
                                  <Select
                                    value={selectedNode.data.config?.messageType || 'text'}
                                    onValueChange={(value) => {
                                      setNodes((nds) =>
                                        nds.map((node) =>
                                          node.id === selectedNode.id
                                            ? {
                                              ...node,
                                              data: {
                                                ...node.data,
                                                config: {
                                                  ...node.data.config,
                                                  messageType: value
                                                }
                                              }
                                            }
                                            : node
                                        )
                                      );
                                    }}
                                  >
                                    <SelectTrigger className="bg-white border-slate-200">
                                      <SelectValue placeholder="Select message type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="text">Text Message</SelectItem>
                                      <SelectItem value="template">Template Message</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                {selectedNode.data.config?.messageType === 'template' ? (
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="template-name" className="text-sm font-medium text-slate-700">
                                        Template Name <span className="text-red-500">*</span>
                                      </Label>
                                      <Input
                                        id="template-name"
                                        placeholder="Enter template name"
                                        value={selectedNode.data.config?.templateName || ''}
                                        onChange={(e) => {
                                          setNodes((nds) =>
                                            nds.map((node) =>
                                              node.id === selectedNode.id
                                                ? {
                                                  ...node,
                                                  data: {
                                                    ...node.data,
                                                    config: {
                                                      ...node.data.config,
                                                      templateName: e.target.value
                                                    }
                                                  }
                                                }
                                                : node
                                            )
                                          );
                                        }}
                                        className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="template-language" className="text-sm font-medium text-slate-700">
                                        Template Language
                                      </Label>
                                      <Input
                                        id="template-language"
                                        placeholder="en"
                                        value={selectedNode.data.config?.templateLanguage || 'en'}
                                        onChange={(e) => {
                                          setNodes((nds) =>
                                            nds.map((node) =>
                                              node.id === selectedNode.id
                                                ? {
                                                  ...node,
                                                  data: {
                                                    ...node.data,
                                                    config: {
                                                      ...node.data.config,
                                                      templateLanguage: e.target.value
                                                    }
                                                  }
                                                }
                                                : node
                                            )
                                          );
                                        }}
                                        className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <Label htmlFor="action-message" className="text-sm font-medium text-slate-700">
                                      Message Content <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea
                                      id="action-message"
                                      placeholder="Enter your automated message..."
                                      value={selectedNode.data.config?.message || ''}
                                      onChange={(e) => {
                                        setNodes((nds) =>
                                          nds.map((node) =>
                                            node.id === selectedNode.id
                                              ? {
                                                ...node,
                                                data: {
                                                  ...node.data,
                                                  config: {
                                                    ...node.data.config,
                                                    message: e.target.value
                                                  }
                                                }
                                              }
                                              : node
                                          )
                                        );
                                      }}
                                      className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20 resize-none"
                                      rows={4}
                                    />
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Send Button Configuration */}
                            {selectedNode.data.config?.actionType === 'send_button' && (
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="button-text" className="text-sm font-medium text-slate-700">
                                    Button Message Text <span className="text-red-500">*</span>
                                  </Label>
                                  <Textarea
                                    id="button-text"
                                    placeholder="Please choose an option:"
                                    value={selectedNode.data.config?.text || ''}
                                    onChange={(e) => {
                                      setNodes((nds) =>
                                        nds.map((node) =>
                                          node.id === selectedNode.id
                                            ? {
                                              ...node,
                                              data: {
                                                ...node.data,
                                                config: {
                                                  ...node.data.config,
                                                  text: e.target.value
                                                }
                                              }
                                            }
                                            : node
                                        )
                                      );
                                    }}
                                    className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20 resize-none"
                                    rows={3}
                                  />
                                </div>
                                <div className="space-y-3">
                                  <Label className="text-sm font-medium text-slate-700">Buttons</Label>
                                  <div className="space-y-3">
                                    {(selectedNode.data.config?.buttons || []).map((button: any, index: number) => (
                                      <div key={index} className="p-4 border border-slate-200 rounded-lg bg-slate-50/30 space-y-3">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm font-medium text-slate-700">Button {index + 1}</span>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              const newButtons = [...(selectedNode.data.config?.buttons || [])];
                                              newButtons.splice(index, 1);
                                              setNodes((nds) =>
                                                nds.map((node) =>
                                                  node.id === selectedNode.id
                                                    ? {
                                                      ...node,
                                                      data: {
                                                        ...node.data,
                                                        config: {
                                                          ...node.data.config,
                                                          buttons: newButtons
                                                        }
                                                      }
                                                    }
                                                    : node
                                                )
                                              );
                                            }}
                                            className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>

                                        <div className="space-y-2">
                                          <Label className="text-xs font-medium text-slate-600">Button Type</Label>
                                          <Select
                                            value={button.type || 'QUICK_REPLY'}
                                            onValueChange={(value) => {
                                              const newButtons = [...(selectedNode.data.config?.buttons || [])];
                                              newButtons[index] = { ...button, type: value };
                                              setNodes((nds) =>
                                                nds.map((node) =>
                                                  node.id === selectedNode.id
                                                    ? {
                                                      ...node,
                                                      data: {
                                                        ...node.data,
                                                        config: {
                                                          ...node.data.config,
                                                          buttons: newButtons
                                                        }
                                                      }
                                                    }
                                                    : node
                                                )
                                              );
                                            }}
                                          >
                                            <SelectTrigger className="bg-white border-slate-200">
                                              <SelectValue placeholder="Select button type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="QUICK_REPLY">Quick Reply</SelectItem>
                                              <SelectItem value="URL">Website URL</SelectItem>
                                              <SelectItem value="PHONE_NUMBER">Phone Number</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>

                                        <div className="space-y-2">
                                          <Label className="text-xs font-medium text-slate-600">Button Text</Label>
                                          <Input
                                            placeholder="Button text"
                                            value={button.text || ''}
                                            onChange={(e) => {
                                              const newButtons = [...(selectedNode.data.config?.buttons || [])];
                                              const buttonId = button.id || e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_') || `btn_${index + 1}`;
                                              newButtons[index] = {
                                                ...button,
                                                text: e.target.value,
                                                id: buttonId
                                              };
                                              setNodes((nds) =>
                                                nds.map((node) =>
                                                  node.id === selectedNode.id
                                                    ? {
                                                      ...node,
                                                      data: {
                                                        ...node.data,
                                                        config: {
                                                          ...node.data.config,
                                                          buttons: newButtons
                                                        }
                                                      }
                                                    }
                                                    : node
                                                )
                                              );
                                            }}
                                            className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                                          />
                                        </div>

                                        {button.type === 'URL' && (
                                          <div className="space-y-2">
                                            <Label className="text-xs font-medium text-slate-600">URL</Label>
                                            <Input
                                              placeholder="https://example.com"
                                              value={button.url || ''}
                                              onChange={(e) => {
                                                const newButtons = [...(selectedNode.data.config?.buttons || [])];
                                                newButtons[index] = { ...button, url: e.target.value };
                                                setNodes((nds) =>
                                                  nds.map((node) =>
                                                    node.id === selectedNode.id
                                                      ? {
                                                        ...node,
                                                        data: {
                                                          ...node.data,
                                                          config: {
                                                            ...node.data.config,
                                                            buttons: newButtons
                                                          }
                                                        }
                                                      }
                                                      : node
                                                  )
                                                );
                                              }}
                                              className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                                            />
                                          </div>
                                        )}

                                        {button.type === 'PHONE_NUMBER' && (
                                          <div className="space-y-2">
                                            <Label className="text-xs font-medium text-slate-600">Phone Number</Label>
                                            <Input
                                              placeholder="+1234567890"
                                              value={button.phone_number || ''}
                                              onChange={(e) => {
                                                const newButtons = [...(selectedNode.data.config?.buttons || [])];
                                                newButtons[index] = { ...button, phone_number: e.target.value };
                                                setNodes((nds) =>
                                                  nds.map((node) =>
                                                    node.id === selectedNode.id
                                                      ? {
                                                        ...node,
                                                        data: {
                                                          ...node.data,
                                                          config: {
                                                            ...node.data.config,
                                                            buttons: newButtons
                                                          }
                                                        }
                                                      }
                                                      : node
                                                  )
                                                );
                                              }}
                                              className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                                            />
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const buttonIndex = (selectedNode.data.config?.buttons || []).length;
                                        const newButtons = [...(selectedNode.data.config?.buttons || []), {
                                          type: 'QUICK_REPLY',
                                          text: '',
                                          id: `btn_${buttonIndex + 1}`
                                        }];
                                        setNodes((nds) =>
                                          nds.map((node) =>
                                            node.id === selectedNode.id
                                              ? {
                                                ...node,
                                                data: {
                                                  ...node.data,
                                                  config: {
                                                    ...node.data.config,
                                                    buttons: newButtons
                                                  }
                                                }
                                              }
                                              : node
                                          )
                                        );
                                      }}
                                      className="w-full border-dashed border-slate-300 hover:border-primary/50 hover:bg-primary/5"
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      Add Button
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                            {selectedNode.data.config?.actionType === 'send_media' && (
                              <div className="space-y-4">
                                {/* Media Type Selection */}
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-slate-700">
                                    Media Type <span className="text-red-500">*</span>
                                  </Label>
                                  <div className="flex gap-2">
                                    {['image', 'video', 'document'].map((type) => (
                                      <Button
                                        key={type}
                                        variant={selectedNode.data.config?.mediaType === type ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => {
                                          setNodes((nds) =>
                                            nds.map((node) =>
                                              node.id === selectedNode.id
                                                ? {
                                                  ...node,
                                                  data: {
                                                    ...node.data,
                                                    config: {
                                                      ...node.data.config,
                                                      mediaType: type,
                                                      // Clear mediaUrl when type changes
                                                      mediaUrl: ''
                                                    }
                                                  }
                                                }
                                                : node
                                            )
                                          );
                                        }}
                                        className="capitalize"
                                      >
                                        {type === 'image' && <Image className="h-3 w-3 mr-1" />}
                                        {type === 'video' && <Video className="h-3 w-3 mr-1" />}
                                        {type === 'document' && <FileText className="h-3 w-3 mr-1" />}
                                        {type}
                                      </Button>
                                    ))}
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="media-url" className="text-sm font-medium text-slate-700">
                                    Media URL or Upload <span className="text-red-500">*</span>
                                  </Label>
                                  <div className="flex gap-2">
                                    <Input
                                      id="media-url"
                                      placeholder={
                                        selectedNode.data.config?.mediaType === 'document'
                                          ? "https://example.com/document.pdf or upload file"
                                          : selectedNode.data.config?.mediaType === 'video'
                                            ? "https://example.com/video.mp4 or upload file"
                                            : "https://example.com/image.jpg or upload file"
                                      }
                                      value={selectedNode.data.config?.mediaUrl || ''}
                                      onChange={(e) => {
                                        setNodes((nds) =>
                                          nds.map((node) =>
                                            node.id === selectedNode.id
                                              ? {
                                                ...node,
                                                data: {
                                                  ...node.data,
                                                  config: {
                                                    ...node.data.config,
                                                    mediaUrl: e.target.value
                                                  }
                                                }
                                              }
                                              : node
                                          )
                                        );
                                      }}
                                      className="flex-1 bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const input = document.createElement('input');
                                        input.type = 'file';

                                        // Set accept attribute based on media type
                                        const mediaType = selectedNode.data.config?.mediaType || 'image';
                                        switch (mediaType) {
                                          case 'image':
                                            input.accept = 'image/*';
                                            break;
                                          case 'video':
                                            input.accept = 'video/*';
                                            break;
                                          case 'document':
                                            input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.rtf';
                                            break;
                                          default:
                                            input.accept = '*/*';
                                        }

                                        input.onchange = async (e) => {
                                          const file = (e.target as HTMLInputElement).files?.[0];
                                          if (file) {
                                            // Validate file type
                                            const isValidType = validateFileType(file, mediaType);
                                            if (!isValidType) {
                                              toast({
                                                title: "Invalid File Type",
                                                description: `Please select a valid ${mediaType} file`,
                                                variant: "destructive",
                                              });
                                              return;
                                            }

                                            const mediaUrl = await uploadMediaFile(file, mediaType);
                                            if (mediaUrl) {
                                              setNodes((nds) =>
                                                nds.map((node) =>
                                                  node.id === selectedNode.id
                                                    ? {
                                                      ...node,
                                                      data: {
                                                        ...node.data,
                                                        config: {
                                                          ...node.data.config,
                                                          mediaUrl: mediaUrl,
                                                          // Store original filename for documents
                                                          originalFilename: mediaType === 'document' ? file.name : undefined
                                                        }
                                                      }
                                                    }
                                                    : node
                                                )
                                              );
                                            }
                                          }
                                        };
                                        input.click();
                                      }}
                                      disabled={isUploadingMedia || !selectedNode.data.config?.mediaType}
                                      className="border-slate-200 hover:bg-slate-50"
                                    >
                                      {isUploadingMedia ? (
                                        <div className="animate-spin h-3 w-3 border border-slate-400 border-t-transparent rounded-full" />
                                      ) : (
                                        <Upload className="h-3 w-3" />
                                      )}
                                    </Button>
                                  </div>
                                  <p className="text-xs text-slate-500">
                                    {selectedNode.data.config?.mediaType === 'document' &&
                                      "Supported: PDF, DOC, XLS, PPT, TXT, CSV (max 100MB)"
                                    }
                                    {selectedNode.data.config?.mediaType === 'image' &&
                                      "Supported: JPG, PNG, GIF, WebP (max 5MB)"
                                    }
                                    {selectedNode.data.config?.mediaType === 'video' &&
                                      "Supported: MP4, MOV, AVI (max 16MB)"
                                    }
                                  </p>
                                </div>

                                {/* Show filename for documents */}
                                {selectedNode.data.config?.mediaType === 'document' &&
                                  selectedNode.data.config?.originalFilename && (
                                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                                      <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <FileText className="h-4 w-4" />
                                        <span>File: {selectedNode.data.config.originalFilename}</span>
                                      </div>
                                    </div>
                                  )}

                                <div className="space-y-2">
                                  <Label htmlFor="media-caption" className="text-sm font-medium text-slate-700">
                                    Caption (Optional)
                                  </Label>
                                  <Textarea
                                    id="media-caption"
                                    placeholder={
                                      selectedNode.data.config?.mediaType === 'document'
                                        ? "Enter description for the document..."
                                        : "Enter caption for the media..."
                                    }
                                    value={selectedNode.data.config?.caption || ''}
                                    onChange={(e) => {
                                      setNodes((nds) =>
                                        nds.map((node) =>
                                          node.id === selectedNode.id
                                            ? {
                                              ...node,
                                              data: {
                                                ...node.data,
                                                config: {
                                                  ...node.data.config,
                                                  caption: e.target.value
                                                }
                                              }
                                            }
                                            : node
                                        )
                                      );
                                    }}
                                    className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20 resize-none"
                                    rows={3}
                                  />
                                </div>

                                {/* Media Preview */}
                                {selectedNode.data.config?.mediaUrl && (
                                  <div className="space-y-2">
                                    <Label className="text-sm font-medium text-slate-700">Preview</Label>
                                    <div className="p-3 bg-slate-50 rounded border border-slate-200">
                                      {selectedNode.data.config?.mediaType === 'image' && (
                                        <img
                                          src={selectedNode.data.config.mediaUrl}
                                          alt="Preview"
                                          className="max-w-full h-32 object-cover rounded"
                                          onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                          }}
                                        />
                                      )}
                                      {selectedNode.data.config?.mediaType === 'video' && (
                                        <video
                                          src={selectedNode.data.config.mediaUrl}
                                          className="max-w-full h-32 rounded"
                                          controls
                                        />
                                      )}
                                      {selectedNode.data.config?.mediaType === 'document' && (
                                        <div className="flex items-center gap-2 text-slate-600">
                                          <FileText className="h-8 w-8" />
                                          <div>
                                            <p className="font-medium">Document uploaded</p>
                                            <p className="text-sm text-slate-500">
                                              {selectedNode.data.config?.originalFilename || 'Document file'}
                                            </p>
                                          </div>
                                        </div>
                                      )}
                                      <div className="hidden text-slate-500 text-sm">
                                        Failed to load preview
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Send Video Configuration */}
                            {selectedNode.data.config?.actionType === 'send_video' && (
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="video-url" className="text-sm font-medium text-slate-700">
                                    Video URL or Handle <span className="text-red-500">*</span>
                                  </Label>
                                  <div className="flex gap-2">
                                    <Input
                                      id="video-url"
                                      placeholder="https://example.com/video.mp4 or video handle"
                                      value={selectedNode.data.config?.videoUrl || ''}
                                      onChange={(e) => {
                                        setNodes((nds) =>
                                          nds.map((node) =>
                                            node.id === selectedNode.id
                                              ? {
                                                ...node,
                                                data: {
                                                  ...node.data,
                                                  config: {
                                                    ...node.data.config,
                                                    videoUrl: e.target.value
                                                  }
                                                }
                                              }
                                              : node
                                          )
                                        );
                                      }}
                                      className="flex-1 bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.accept = 'video/*';
                                        input.onchange = async (e) => {
                                          const file = (e.target as HTMLInputElement).files?.[0];
                                          if (file) {
                                            const mediaHandle = await uploadMediaFile(file, 'video');
                                            if (mediaHandle) {
                                              setNodes((nds) =>
                                                nds.map((node) =>
                                                  node.id === selectedNode.id
                                                    ? {
                                                      ...node,
                                                      data: {
                                                        ...node.data,
                                                        config: {
                                                          ...node.data.config,
                                                          videoUrl: mediaHandle
                                                        }
                                                      }
                                                    }
                                                    : node
                                                )
                                              );
                                            }
                                          }
                                        };
                                        input.click();
                                      }}
                                      disabled={isUploadingMedia}
                                      className="border-slate-200 hover:bg-slate-50"
                                    >
                                      {isUploadingMedia ? (
                                        <div className="animate-spin h-3 w-3 border border-slate-400 border-t-transparent rounded-full" />
                                      ) : (
                                        <Upload className="h-3 w-3" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="video-caption" className="text-sm font-medium text-slate-700">
                                    Caption (Optional)
                                  </Label>
                                  <Textarea
                                    id="video-caption"
                                    placeholder="Enter caption for the video..."
                                    value={selectedNode.data.config?.caption || ''}
                                    onChange={(e) => {
                                      setNodes((nds) =>
                                        nds.map((node) =>
                                          node.id === selectedNode.id
                                            ? {
                                              ...node,
                                              data: {
                                                ...node.data,
                                                config: {
                                                  ...node.data.config,
                                                  caption: e.target.value
                                                }
                                              }
                                            }
                                            : node
                                        )
                                      );
                                    }}
                                    className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20 resize-none"
                                    rows={3}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Send List Configuration */}
                            {selectedNode.data.config?.actionType === 'send_list' && (
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="list-text" className="text-sm font-medium text-slate-700">
                                    List Message Text <span className="text-red-500">*</span>
                                  </Label>
                                  <Textarea
                                    id="list-text"
                                    placeholder="Please choose an option:"
                                    value={selectedNode.data.config?.text || ''}
                                    onChange={(e) => {
                                      setNodes((nds) =>
                                        nds.map((node) =>
                                          node.id === selectedNode.id
                                            ? {
                                              ...node,
                                              data: {
                                                ...node.data,
                                                config: {
                                                  ...node.data.config,
                                                  text: e.target.value
                                                }
                                              }
                                            }
                                            : node
                                        )
                                      );
                                    }}
                                    className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20 resize-none"
                                    rows={3}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="list-button-text" className="text-sm font-medium text-slate-700">
                                    Button Text <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id="list-button-text"
                                    placeholder="Select"
                                    value={selectedNode.data.config?.buttonText || ''}
                                    onChange={(e) => {
                                      setNodes((nds) =>
                                        nds.map((node) =>
                                          node.id === selectedNode.id
                                            ? {
                                              ...node,
                                              data: {
                                                ...node.data,
                                                config: {
                                                  ...node.data.config,
                                                  buttonText: e.target.value
                                                }
                                              }
                                            }
                                            : node
                                        )
                                      );
                                    }}
                                    className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                                  />
                                </div>
                                <div className="space-y-3">
                                  <Label className="text-sm font-medium text-slate-700">List Sections</Label>
                                  <div className="space-y-4">
                                    {(selectedNode.data.config?.sections || []).map((section: any, sectionIndex: number) => (
                                      <div key={sectionIndex} className="p-4 border border-slate-200 rounded-lg bg-slate-50/30 space-y-3">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm font-medium text-slate-700">Section {sectionIndex + 1}</span>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              const newSections = [...(selectedNode.data.config?.sections || [])];
                                              newSections.splice(sectionIndex, 1);
                                              setNodes((nds) =>
                                                nds.map((node) =>
                                                  node.id === selectedNode.id
                                                    ? {
                                                      ...node,
                                                      data: {
                                                        ...node.data,
                                                        config: {
                                                          ...node.data.config,
                                                          sections: newSections
                                                        }
                                                      }
                                                    }
                                                    : node
                                                )
                                              );
                                            }}
                                            className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                        <Input
                                          placeholder="Section Title"
                                          value={section.title || ''}
                                          onChange={(e) => {
                                            const newSections = [...(selectedNode.data.config?.sections || [])];
                                            newSections[sectionIndex] = { ...section, title: e.target.value };
                                            setNodes((nds) =>
                                              nds.map((node) =>
                                                node.id === selectedNode.id
                                                  ? {
                                                    ...node,
                                                    data: {
                                                      ...node.data,
                                                      config: {
                                                        ...node.data.config,
                                                        sections: newSections
                                                      }
                                                    }
                                                  }
                                                  : node
                                              )
                                            );
                                          }}
                                          className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                                        />
                                        <div className="space-y-3">
                                          <Label className="text-xs font-medium text-slate-600">Section Rows</Label>
                                          {(section.rows || []).map((row: any, rowIndex: number) => (
                                            <div key={rowIndex} className="flex gap-2">
                                              <Input
                                                placeholder="Row ID"
                                                value={row.id || ''}
                                                onChange={(e) => {
                                                  const newSections = [...(selectedNode.data.config?.sections || [])];
                                                  const newRows = [...(section.rows || [])];
                                                  newRows[rowIndex] = { ...row, id: e.target.value };
                                                  newSections[sectionIndex] = { ...section, rows: newRows };
                                                  setNodes((nds) =>
                                                    nds.map((node) =>
                                                      node.id === selectedNode.id
                                                        ? {
                                                          ...node,
                                                          data: {
                                                            ...node.data,
                                                            config: {
                                                              ...node.data.config,
                                                              sections: newSections
                                                            }
                                                          }
                                                        }
                                                        : node
                                                    )
                                                  );
                                                }}
                                                className="flex-1 bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                                              />
                                              <Input
                                                placeholder="Row Title"
                                                value={row.title || ''}
                                                onChange={(e) => {
                                                  const newSections = [...(selectedNode.data.config?.sections || [])];
                                                  const newRows = [...(section.rows || [])];
                                                  newRows[rowIndex] = { ...row, title: e.target.value };
                                                  newSections[sectionIndex] = { ...section, rows: newRows };
                                                  setNodes((nds) =>
                                                    nds.map((node) =>
                                                      node.id === selectedNode.id
                                                        ? {
                                                          ...node,
                                                          data: {
                                                            ...node.data,
                                                            config: {
                                                              ...node.data.config,
                                                              sections: newSections
                                                            }
                                                          }
                                                        }
                                                        : node
                                                    )
                                                  );
                                                }}
                                                className="flex-1 bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                                              />
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                  const newSections = [...(selectedNode.data.config?.sections || [])];
                                                  const newRows = [...(section.rows || [])];
                                                  newRows.splice(rowIndex, 1);
                                                  newSections[sectionIndex] = { ...section, rows: newRows };
                                                  setNodes((nds) =>
                                                    nds.map((node) =>
                                                      node.id === selectedNode.id
                                                        ? {
                                                          ...node,
                                                          data: {
                                                            ...node.data,
                                                            config: {
                                                              ...node.data.config,
                                                              sections: newSections
                                                            }
                                                          }
                                                        }
                                                        : node
                                                    )
                                                  );
                                                }}
                                                className="h-9 w-9 p-0 hover:bg-red-50 hover:text-red-600"
                                              >
                                                <X className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          ))}
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                              const newSections = [...(selectedNode.data.config?.sections || [])];
                                              const newRows = [...(section.rows || []), { id: '', title: '', description: '' }];
                                              newSections[sectionIndex] = { ...section, rows: newRows };
                                              setNodes((nds) =>
                                                nds.map((node) =>
                                                  node.id === selectedNode.id
                                                    ? {
                                                      ...node,
                                                      data: {
                                                        ...node.data,
                                                        config: {
                                                          ...node.data.config,
                                                          sections: newSections
                                                        }
                                                      }
                                                    }
                                                    : node
                                                )
                                              );
                                            }}
                                            className="w-full border-dashed border-slate-300 hover:border-primary/50 hover:bg-primary/5"
                                          >
                                            <Plus className="h-3 w-3 mr-1" />
                                            Add Row
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const newSections = [...(selectedNode.data.config?.sections || []), { title: '', rows: [] }];
                                        setNodes((nds) =>
                                          nds.map((node) =>
                                            node.id === selectedNode.id
                                              ? {
                                                ...node,
                                                data: {
                                                  ...node.data,
                                                  config: {
                                                    ...node.data.config,
                                                    sections: newSections
                                                  }
                                                }
                                              }
                                              : node
                                          )
                                        );
                                      }}
                                      className="w-full border-dashed border-slate-300 hover:border-primary/50 hover:bg-primary/5"
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      Add Section
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Assign Conversation Configuration */}
                            {selectedNode.data.config?.actionType === 'assign_conversation' && (
                              <div className="space-y-2">
                                <Label htmlFor="assigned-to" className="text-sm font-medium text-slate-700">
                                  Assign To User <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                  value={selectedNode.data.config?.assignedTo || ''}
                                  onValueChange={(value) => {
                                    setNodes((nds) =>
                                      nds.map((node) =>
                                        node.id === selectedNode.id
                                          ? {
                                            ...node,
                                            data: {
                                              ...node.data,
                                              config: {
                                                ...node.data.config,
                                                assignedTo: value
                                              }
                                            }
                                          }
                                          : node
                                      )
                                    );
                                  }}
                                >
                                  <SelectTrigger className="bg-white border-slate-200">
                                    <SelectValue placeholder="Select user to assign conversation to" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {companyUsers.map((user) => (
                                      <SelectItem key={user._id} value={user._id}>
                                        {user.name} ({user.email})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <p className="text-xs text-slate-500">
                                  Select a team member to handle this conversation
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {selectedNode.type === 'delay' && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                            Delay Configuration
                          </h3>
                        </div>

                        <Card className="bg-white border-slate-200">
                          <CardContent className="p-4 space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="delay-duration" className="text-sm font-medium text-slate-700">
                                Duration (minutes) <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="delay-duration"
                                type="number"
                                placeholder="5"
                                value={selectedNode.data.config?.duration || ''}
                                onChange={(e) => {
                                  setNodes((nds) =>
                                    nds.map((node) =>
                                      node.id === selectedNode.id
                                        ? {
                                          ...node,
                                          data: {
                                            ...node.data,
                                            config: {
                                              ...node.data.config,
                                              duration: parseInt(e.target.value) || 0
                                            }
                                          }
                                        }
                                        : node
                                    )
                                  );
                                }}
                                className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                              />
                              <p className="text-xs text-slate-500">
                                How long to wait before continuing to the next node
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {selectedNode.type === 'condition' && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                            Condition Configuration
                          </h3>
                        </div>

                        <Card className="bg-white border-slate-200">
                          <CardContent className="p-4 space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="condition-type" className="text-sm font-medium text-slate-700">
                                Condition Type <span className="text-red-500">*</span>
                              </Label>
                              <Select
                                value={selectedNode.data.config?.conditionType || ''}
                                onValueChange={(value) => {
                                  setNodes((nds) =>
                                    nds.map((node) =>
                                      node.id === selectedNode.id
                                        ? {
                                          ...node,
                                          data: {
                                            ...node.data,
                                            config: {
                                              ...node.data.config,
                                              conditionType: value
                                            }
                                          }
                                        }
                                        : node
                                    )
                                  );
                                }}
                              >
                                <SelectTrigger className="bg-white border-slate-200">
                                  <SelectValue placeholder="Select condition" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="contains">Message contains</SelectItem>
                                  <SelectItem value="equals">Message equals</SelectItem>
                                  <SelectItem value="starts_with">Message starts with</SelectItem>
                                  <SelectItem value="ends_with">Message ends with</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="condition-value" className="text-sm font-medium text-slate-700">
                                Condition Value <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="condition-value"
                                placeholder="Enter value to check"
                                value={selectedNode.data.config?.conditionValue || ''}
                                onChange={(e) => {
                                  setNodes((nds) =>
                                    nds.map((node) =>
                                      node.id === selectedNode.id
                                        ? {
                                          ...node,
                                          data: {
                                            ...node.data,
                                            config: {
                                              ...node.data.config,
                                              conditionValue: e.target.value
                                            }
                                          }
                                        }
                                        : node
                                    )
                                  );
                                }}
                                className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                              />
                              <p className="text-xs text-slate-500">
                                The text or pattern to match against incoming messages
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {selectedNode.type === 'webhook' && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                            Webhook Configuration
                          </h3>
                        </div>

                        <Card className="bg-white border-slate-200">
                          <CardContent className="p-4 space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="webhook-url" className="text-sm font-medium text-slate-700">
                                Webhook URL <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="webhook-url"
                                type="url"
                                placeholder="https://api.example.com/webhook"
                                value={selectedNode.data.config?.webhookUrl || ''}
                                onChange={(e) => {
                                  setNodes((nds) =>
                                    nds.map((node) =>
                                      node.id === selectedNode.id
                                        ? {
                                          ...node,
                                          data: {
                                            ...node.data,
                                            config: {
                                              ...node.data.config,
                                              webhookUrl: e.target.value
                                            }
                                          }
                                        }
                                        : node
                                    )
                                  );
                                }}
                                className="bg-white border-slate-200 focus:border-primary/50 focus:ring-primary/20"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="webhook-method" className="text-sm font-medium text-slate-700">
                                HTTP Method <span className="text-red-500">*</span>
                              </Label>
                              <Select
                                value={selectedNode.data.config?.webhookMethod || 'POST'}
                                onValueChange={(value) => {
                                  setNodes((nds) =>
                                    nds.map((node) =>
                                      node.id === selectedNode.id
                                        ? {
                                          ...node,
                                          data: {
                                            ...node.data,
                                            config: {
                                              ...node.data.config,
                                              webhookMethod: value
                                            }
                                          }
                                        }
                                        : node
                                    )
                                  );
                                }}
                              >
                                <SelectTrigger className="bg-white border-slate-200">
                                  <SelectValue placeholder="Select HTTP method" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="GET">GET</SelectItem>
                                  <SelectItem value="POST">POST</SelectItem>
                                  <SelectItem value="PUT">PUT</SelectItem>
                                  <SelectItem value="DELETE">DELETE</SelectItem>
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-slate-500">
                                The HTTP method to use when calling your webhook
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Danger Zone */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                          Danger Zone
                        </h3>
                      </div>

                      <Card className="border-red-200 bg-red-50/50">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div>
                              <h4 className="text-sm font-medium text-red-800">Delete Node</h4>
                              <p className="text-xs text-red-600">
                                This action cannot be undone. This will permanently delete the node and all its connections.
                              </p>
                            </div>
                            <Button
                              variant="destructive"
                              onClick={deleteSelectedNodes}
                              className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Node
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer with action buttons */}
              <div className="px-6 py-4 border-t border-slate-100 flex-shrink-0 bg-white">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setIsNodePanelOpen(false)}
                    className="hover:bg-slate-50"
                  >
                    Close
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Reset node to defaults
                        if (selectedNode) {
                          setNodes((nds) =>
                            nds.map((node) =>
                              node.id === selectedNode.id
                                ? {
                                  ...node,
                                  data: {
                                    ...node.data,
                                    config: {}
                                  }
                                }
                                : node
                            )
                          );
                        }
                      }}
                      className="hover:bg-slate-50"
                    >
                      Reset
                    </Button>
                    <Button
                      onClick={() => {
                        saveWorkflow();
                        setIsNodePanelOpen(false);
                      }}
                      className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          {/* Settings Dialog */}
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Workflow Settings</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Configure your workflow properties and behavior
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="workflow-name" className="text-sm font-medium">
                    Workflow Name
                  </Label>
                  <Input
                    id="workflow-name"
                    value={workflow?.name || ""}
                    onChange={(e) => {
                      if (workflow) {
                        setWorkflow({ ...workflow, name: e.target.value });
                      }
                    }}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workflow-description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="workflow-description"
                    value={workflow?.description || ""}
                    onChange={(e) => {
                      if (workflow) {
                        setWorkflow({ ...workflow, description: e.target.value });
                      }
                    }}
                    rows={3}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-1">
                    <Label htmlFor="workflow-active" className="text-sm font-medium">
                      Active Workflow
                    </Label>
                    <p className="text-xs text-gray-600">
                      Enable this workflow to start processing messages
                    </p>
                  </div>
                  <Switch
                    id="workflow-active"
                    checked={workflow?.isActive || false}
                    onCheckedChange={(checked) => {
                      if (workflow) {
                        setWorkflow({ ...workflow, isActive: checked });
                      }
                    }}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsSettingsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    await saveWorkflow();
                    setIsSettingsOpen(false);
                  }}
                  className=" hover:to-secondary/90"
                >
                  Save Settings
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Layout>
  );
}

function WorkflowBuilderPage() {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderContent />
    </ReactFlowProvider>
  );
}

export default WorkflowBuilderPage;
