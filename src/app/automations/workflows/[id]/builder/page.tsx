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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

// Define node types
const nodeTypes = {
  trigger: SimpleNode,
  condition: SimpleNode,
  action: SimpleNode,
  delay: SimpleNode,
  webhook: SimpleNode,
};

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
    type: "action",
    label: "Send Message",
    icon: Send,
    color: "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100",
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [isExecuting, setIsExecuting] = useState(false);

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

  // Add keyboard shortcut for sidebar toggle
  useHotkeys("ctrl+b, cmd+b", (e) => {
    e.preventDefault();
    setSidebarVisible(!sidebarVisible);
  }, [sidebarVisible]);

  // Handle connection with improved condition node support
  const onConnect = useCallback(
    (params: Connection) => {
      console.log('Connecting nodes:', params);
      
      // Check if source node is a condition node
      const sourceNode = nodes.find(n => n.id === params.source);
      let newEdge = {
        ...params,
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 },
      };

      // If connecting from a condition node, we need to specify which output (yes/no)
      if (sourceNode?.type === 'condition' && !params.sourceHandle) {
        // For now, default to 'yes' - in a real implementation, you'd want to show a UI to select
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
  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (snapToGrid) {
        const gridSize = 20;
        const snappedX = Math.round(node.position.x / gridSize) * gridSize;
        const snappedY = Math.round(node.position.y / gridSize) * gridSize;

        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id
              ? { ...n, position: { x: snappedX, y: snappedY } }
              : n
          )
        );
      }
      addToHistory();
    },
    [snapToGrid, setNodes, addToHistory]
  );

  // Add new node function
  const addNode = useCallback(
    (type: string, position?: { x: number; y: number }) => {
      const nodeTemplate = nodeTemplates.find(t => t.type === type);
      if (!nodeTemplate) return;

      let defaultPosition = position || {
        x: 300 + Math.random() * 200,
        y: 200 + Math.random() * 200
      };

      if (snapToGrid) {
        const gridSize = 20;
        defaultPosition.x = Math.round(defaultPosition.x / gridSize) * gridSize;
        defaultPosition.y = Math.round(defaultPosition.y / gridSize) * gridSize;
      }

      const newNode: Node = {
        id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        position: defaultPosition,
        data: {
          label: nodeTemplate.label,
          type: type,
          config: {},
        },
      };

      setNodes((currentNodes) => [...currentNodes, newNode]);
      addToHistory();

      toast({
        title: "Node Added",
        description: `${nodeTemplate.label} added to workflow`,
      });
    },
    [setNodes, addToHistory, toast, snapToGrid]
  );

  // Drag and drop handlers
  const onDragStart = useCallback((event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
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
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position);
    },
    [screenToFlowPosition, addNode]
  );

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.stopPropagation();
    setSelectedNodeId(node.id);
    setIsNodePanelOpen(true);
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

  // Handle grid toggle
  const handleGridToggle = useCallback((checked: boolean) => {
    setShowGrid(checked);
  }, []);

  // Handle snap-to-grid toggle
  const handleSnapToggle = useCallback((checked: boolean) => {
    setSnapToGrid(checked);
  }, []);

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
                      ? "bg-green-100 text-green-800 border-green-200": "bg-gray-100 text-gray-600 border-gray-200"
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
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
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
          {/* Collapsible Sidebar */}
          {sidebarVisible && (
            <div className={cn(
              "bg-white/80 backdrop-blur-lg border-r border-gray-200/60 flex flex-col transition-all duration-300 shadow-lg",
              sidebarCollapsed ? "w-16" : "w-64"
            )}>
              {/* Sidebar Header */}
              <div className="p-4 border-b border-gray-200/60 flex items-center justify-between">
                {!sidebarCollapsed && (
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Nodes
                  </h3>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                  title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                  {sidebarCollapsed ? <Maximize className="h-4 w-4" /> : <Move className="h-4 w-4" />}
                </Button>
              </div>

              {!sidebarCollapsed && (
                <>
                  {/* Node Templates */}
                  <div className="flex-1 p-3 overflow-y-auto">
                    <div className="space-y-2">
                      {nodeTemplates.map((template) => (
                        <div
                          key={template.type}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-sm group",
                            template.color
                          )}
                          draggable
                          onDragStart={(event) => onDragStart(event, template.type)}
                        >
                          <div className="p-1.5 bg-white/60 rounded-md group-hover:bg-white/80 transition-colors">
                            <template.icon className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium truncate">{template.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="p-3 border-t border-gray-200/60 space-y-2">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                      Quick Actions
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addNode("trigger")}
                        className="h-8 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Trigger
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addNode("action")}
                        className="h-8 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Action
                      </Button>
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="p-3 border-t border-gray-200/60">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                      Canvas
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-700">Grid</span>
                        <Switch
                          checked={showGrid}
                          onCheckedChange={handleGridToggle}
                          className="scale-75"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-700">Snap</span>
                        <Switch
                          checked={snapToGrid}
                          onCheckedChange={handleSnapToggle}
                          className="scale-75"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="p-3 border-t border-gray-200/60">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{nodes.length}</div>
                        <div className="text-gray-500">Nodes</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{edges.length}</div>
                        <div className="text-gray-500">Edges</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{Math.round(zoom * 100)}%</div>
                        <div className="text-gray-500">Zoom</div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Collapsed Sidebar */}
              {sidebarCollapsed && (
                <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                  {nodeTemplates.map((template) => (
                    <div
                      key={template.type}
                      className={cn(
                        "p-2 rounded-lg border cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-sm group",
                        template.color
                      )}
                      draggable
                      onDragStart={(event) => onDragStart(event, template.type)}
                      title={template.label}
                    >
                      <template.icon className="h-4 w-4 mx-auto" />
                    </div>
                  ))}
                </div>
              )}
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
                    const template = nodeTemplates.find(t => t.type === node.type);
                    return template?.color?.includes('emerald') ? '#10b981' :
                           template?.color?.includes('blue') ? '#3b82f6' :
                           template?.color?.includes('purple') ? '#8b5cf6' :
                           template?.color?.includes('amber') ? '#f59e0b' :
                           template?.color?.includes('rose') ? '#f43f5e' : '#6b7280';
                  }}
                />

                {/* Enhanced Background */}
                {showGrid && (
                  <Background
                    variant={BackgroundVariant.Dots}
                    gap={20}
                    size={1.5}
                    className="opacity-40"
                    color="#e5e7eb"
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
                            onClick={() => addNode("action", { x: 400, y: 350 })}
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
                    <CardContent className="px-3 py-1">
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
            <SheetContent className="w-96 p-6">
              <SheetHeader className="pb-6">
                <SheetTitle className="text-xl font-bold text-gray-900">Node Properties</SheetTitle>
                <SheetDescription className="text-gray-600">
                  Configure the selected node settings and behavior
                </SheetDescription>
              </SheetHeader>

              {selectedNode && (
                <div className="h-full pb-6 overflow-y-auto">
                  <div className="space-y-6">
                    {/* Node Info */}
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            {nodeTemplates.find(t => t.type === selectedNode.type)?.icon && (
                              React.createElement(nodeTemplates.find(t => t.type === selectedNode.type)!.icon, {
                                className: "h-5 w-5 text-gray-700"
                              })
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{selectedNode.data.label}</h4>
                            <Badge variant="outline" className="mt-1 capitalize">
                              {selectedNode.type}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Basic Settings */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="node-label" className="text-sm font-medium text-gray-700">
                          Node Label
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
                          className="mt-1"
                        />
                      </div>

                      {/* Type-specific configuration */}
                      {selectedNode.type === 'trigger' && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Trigger Configuration</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <Label htmlFor="trigger-keywords" className="text-sm font-medium">
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
                                className="mt-1"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {selectedNode.type === 'action' && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Action Configuration</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <Label htmlFor="action-message" className="text-sm font-medium">
                                Message Content
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
                                className="mt-1"
                                rows={4}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {selectedNode.type === 'delay' && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Delay Configuration</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <Label htmlFor="delay-duration" className="text-sm font-medium">
                                Duration (minutes)
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
                                className="mt-1"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {selectedNode.type === 'condition' && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Condition Configuration</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <Label htmlFor="condition-type" className="text-sm font-medium">
                                Condition Type
                              </Label>
                              <select
                                id="condition-type"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                                value={selectedNode.data.config?.conditionType || ''}
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
                                                conditionType: e.target.value
                                              }
                                            }
                                          }
                                        : node
                                    )
                                  );
                                }}
                              >
                                <option value="">Select condition</option>
                                <option value="contains">Message contains</option>
                                <option value="equals">Message equals</option>
                                <option value="starts_with">Message starts with</option>
                                <option value="ends_with">Message ends with</option>
                              </select>
                            </div>
                            <div>
                              <Label htmlFor="condition-value" className="text-sm font-medium">
                                Condition Value
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
                                className="mt-1"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {selectedNode.type === 'webhook' && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Webhook Configuration</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <Label htmlFor="webhook-url" className="text-sm font-medium">
                                Webhook URL
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
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="webhook-method" className="text-sm font-medium">
                                HTTP Method
                              </Label>
                              <select
                                id="webhook-method"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                                value={selectedNode.data.config?.webhookMethod || 'POST'}
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
                                                webhookMethod: e.target.value
                                              }
                                            }
                                          }
                                        : node
                                    )
                                  );
                                }}
                              >
                                <option value="GET">GET</option>
                              <option value="POST">POST</option>
                                <option value="PUT">PUT</option>
                                <option value="DELETE">DELETE</option>
                              </select>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Danger Zone */}
                    <Card className="border-red-200 bg-red-50">
                      <CardHeader>
                        <CardTitle className="text-sm text-red-800">Danger Zone</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button
                          variant="destructive"
                          onClick={deleteSelectedNodes}
                          className="w-full bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Node
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
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
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
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