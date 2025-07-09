"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  Download,
  Upload,
  Settings,
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Grid3X3,
  Move,
  MousePointer,
  Hand,
  RotateCcw,
  FileText,
  MessageSquare,
  Clock,
  GitBranch,
  Webhook,
  Bot,
  Send,
  Timer,
  Filter,
  Zap
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Custom node components
import TriggerNode from "@/components/workflow/nodes/TriggerNode";
import ConditionNode from "@/components/workflow/nodes/ConditionNode";
import ActionNode from "@/components/workflow/nodes/ActionNode";
import DelayNode from "@/components/workflow/nodes/DelayNode";
import WebhookNode from "@/components/workflow/nodes/WebhookNode";

const nodeTypes = {
  trigger: TriggerNode,
  condition: ConditionNode,
  action: ActionNode,
  delay: DelayNode,
  webhook: WebhookNode,
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
    description: "Start workflow when a message is received",
    color: "bg-green-100 border-green-300 text-green-700",
  },
  {
    type: "condition",
    label: "Condition",
    icon: GitBranch,
    description: "Branch workflow based on conditions",
    color: "bg-blue-100 border-blue-300 text-blue-700",
  },
  {
    type: "action",
    label: "Send Message",
    icon: Send,
    description: "Send a message to the customer",
    color: "bg-purple-100 border-purple-300 text-purple-700",
  },
  {
    type: "delay",
    label: "Delay",
    icon: Timer,
    description: "Wait for a specified amount of time",
    color: "bg-amber-100 border-amber-300 text-amber-700",
  },
  {
    type: "webhook",
    label: "Webhook",
    icon: Webhook,
    description: "Send data to external service",
    color: "bg-red-100 border-red-300 text-red-700",
  },
];

function WorkflowBuilderContent() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const {
    project,
    getViewport,
    setViewport,
    fitView,
    zoomIn,
    zoomOut,
    zoomTo
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
  const [draggedNode, setDraggedNode] = useState<any>(null);

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
          setNodes(data.workflow.nodes || []);
          setEdges(data.workflow.edges || []);

          if (data.workflow.viewport) {
            setViewport(data.workflow.viewport);
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

    if (params.id) {
      loadWorkflow();
    }
  }, [params.id, router, toast, setNodes, setEdges, setViewport]);

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

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (nodes.length > 0 || edges.length > 0) {
        saveWorkflow();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [saveWorkflow, nodes, edges]);

  // History management
  const addToHistory = useCallback(() => {
    const newHistoryItem = { nodes: [...nodes], edges: [...edges] };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newHistoryItem);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [nodes, edges, history, historyIndex]);

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
  });

  useHotkeys("ctrl+z, cmd+z", (e) => {
    e.preventDefault();
    undo();
  });

  useHotkeys("ctrl+y, cmd+y, ctrl+shift+z, cmd+shift+z", (e) => {
    e.preventDefault();
    redo();
  });

  useHotkeys("ctrl+1, cmd+1", (e) => {
    e.preventDefault();
    fitView();
  });

  useHotkeys("ctrl+plus, cmd+plus", (e) => {
    e.preventDefault();
    zoomIn();
  });

  useHotkeys("ctrl+minus, cmd+minus", (e) => {
    e.preventDefault();
    zoomOut();
  });

  // Handle connection
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = addEdge(params, edges);
      setEdges(newEdge);
      addToHistory();
    },
    [edges, setEdges, addToHistory]
  );

  // Handle node drag
  const onNodeDrag = useCallback((event: any, node: Node) => {
    if (snapToGrid) {
      node.position.x = Math.round(node.position.x / 20) * 20;
      node.position.y = Math.round(node.position.y / 20) * 20;
    }
  }, [snapToGrid]);

  // Add new node
  const addNode = useCallback(
    (type: string, position?: { x: number; y: number }) => {
      const nodeTemplate = nodeTemplates.find(t => t.type === type);
      if (!nodeTemplate) return;

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position: position || { x: 100, y: 100 },
        data: {
          label: nodeTemplate.label,
          config: {},
        },
      };

      setNodes((nds) => [...nds, newNode]);
      addToHistory();
    },
    [setNodes, addToHistory]
  );

  // Handle drag over
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Handle drop
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!draggedNode || !reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      addNode(draggedNode.type, position);
      setDraggedNode(null);
    },
    [draggedNode, project, addNode]
  );

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
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
    }
  }, [selectedNodeId, setNodes, setEdges, addToHistory]);

  useHotkeys("delete, backspace", deleteSelectedNodes);

  const selectedNode = nodes.find(node => node.id === selectedNodeId);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Bot className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium">Loading workflow builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/automations/workflows")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Workflows
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="text-lg font-semibold">{workflow?.name}</h1>
            <p className="text-sm text-muted-foreground">
              v{workflow?.version} • {nodes.length} nodes • {edges.length} connections
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 border rounded-md p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => zoomOut()}
              className="h-7 w-7 p-0"
            >
              <ZoomOut className="h-3 w-3" />
            </Button>
            <span className="text-xs px-2 min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => zoomIn()}
              className="h-7 w-7 p-0"
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
          </div>

          {/* Action Buttons */}
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={historyIndex <= 0}
            className="h-8"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="h-8"
          >
            <Redo className="h-4 w-4" />
          </Button>

          <div className="h-6 w-px bg-border" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => fitView()}
            className="h-8"
          >
            <Maximize className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
            className="h-8"
          >
            <Settings className="h-4 w-4" />
          </Button>

          <Button
            onClick={saveWorkflow}
            disabled={isSaving}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save"}
          </Button>

          <Button
            variant={workflow?.isActive ? "destructive" : "default"}
            size="sm"
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
          >
            {workflow?.isActive ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold mb-2">Node Library</h3>
            <p className="text-sm text-muted-foreground">
              Drag nodes onto the canvas to build your workflow
            </p>
          </div>

          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {nodeTemplates.map((nodeTemplate) => (
              <Card
                key={nodeTemplate.type}
                className={cn(
                  "cursor-grab border-2 transition-all hover:shadow-md",
                  nodeTemplate.color
                )}
                draggable
                onDragStart={() => setDraggedNode(nodeTemplate)}
                onDragEnd={() => setDraggedNode(null)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <nodeTemplate.icon className="h-4 w-4" />
                    <span className="font-medium text-sm">{nodeTemplate.label}</span>
                  </div>
                  <p className="text-xs opacity-75">{nodeTemplate.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="p-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm">Grid</Label>
              <Switch
                checked={showGrid}
                onCheckedChange={setShowGrid}
                size="sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Snap to Grid</Label>
              <Switch
                checked={snapToGrid}
                onCheckedChange={setSnapToGrid}
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
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
              onNodeClick={onNodeClick}
              onMove={(event, viewport) => setZoom(viewport.zoom)}
              nodeTypes={nodeTypes}
              snapToGrid={snapToGrid}
              snapGrid={[20, 20]}
              defaultViewport={{ x: 0, y: 0, zoom: 1 }}
              attributionPosition="bottom-left"
              className="bg-gray-50"
            >
              <Controls
                position="bottom-right"
                showInteractive={false}
                className="bg-white border shadow-lg"
              />
              <MiniMap
                position="bottom-left"
                className="bg-white border shadow-lg"
                maskColor="rgba(0,0,0,0.1)"
                nodeColor="#e5e7eb"
              />
              {showGrid && (
                <Background
                  variant={BackgroundVariant.Dots}
                  gap={20}
                  size={1}
                  className="opacity-30"
                />
              )}

              {/* Empty state */}
              {nodes.length === 0 && (
                <Panel position="center">
                  <div className="text-center p-8 bg-white rounded-lg border shadow-sm max-w-md">
                    <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Start Building Your Workflow</h3>
                    <p className="text-muted-foreground mb-4">
                      Drag nodes from the sidebar to create your automation sequence
                    </p>
                    <Button
                      onClick={() => addNode("trigger", { x: 250, y: 200 })}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Trigger Node
                    </Button>
                  </div>
                </Panel>
              )}
            </ReactFlow>
          </div>
        </div>

        {/* Node Properties Panel */}
        <Sheet open={isNodePanelOpen} onOpenChange={setIsNodePanelOpen}>
          <SheetContent className="w-96">
            <SheetHeader>
              <SheetTitle>Node Properties</SheetTitle>
              <SheetDescription>
                Configure the selected node
              </SheetDescription>
            </SheetHeader>

            {selectedNode && (
              <div className="mt-6 space-y-4">
                <div>
                  <Label htmlFor="node-label">Label</Label>
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
                  />
                </div>

                <div>
                  <Label>Node Type</Label>
                  <Badge variant="outline" className="capitalize">
                    {selectedNode.type}
                  </Badge>
                </div>

                {/* Node-specific configuration would go here */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Configuration</h4>
                  <p className="text-sm text-muted-foreground">
                    Node configuration panels will be implemented based on node type.
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={deleteSelectedNodes}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Node
                  </Button>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Settings Dialog */}
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Workflow Settings</DialogTitle>
              <DialogDescription>
                Configure workflow preferences and properties
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="workflow-name">Workflow Name</Label>
                <Input
                  id="workflow-name"
                  value={workflow?.name || ""}
                  onChange={(e) => {
                    if (workflow) {
                      setWorkflow({ ...workflow, name: e.target.value });
                    }
                  }}
                />
              </div>

              <div>
                <Label htmlFor="workflow-description">Description</Label>
                <Textarea
                  id="workflow-description"
                  value={workflow?.description || ""}
                  onChange={(e) => {
                    if (workflow) {
                      setWorkflow({ ...workflow, description: e.target.value });
                    }
                  }}
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="workflow-active">Active Workflow</Label>
                <Switch
                  id="workflow-active"
                  checked={workflow?.isActive || false}
                  onCheckedChange={(checked) => {
                    if (workflow) {
                      setWorkflow({ ...workflow, isActive: checked });
                    }
                  }}
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
              >
                Save Settings
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function WorkflowBuilder() {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderContent />
    </ReactFlowProvider>
  );
}
