"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, DollarSign, Calendar } from 'lucide-react';

interface CreateLeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: any;
  wabaId: string;
}

export default function CreateLeadModal({ open, onOpenChange, contact, wabaId }: CreateLeadModalProps) {
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<any>(null);
  const [leadData, setLeadData] = useState({
    title: '',
    description: '',
    amount: '',
    stage: '',
    closeDate: '',
    remarks: '',
    source: 'WhatsApp - Zaptick'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPipelines, setIsLoadingPipelines] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchPipelines();
      // Set default title and description
      setLeadData(prev => ({
        ...prev,
        title: `Lead for ${contact?.name || 'Contact'}`,
        description: `Potential lead from WhatsApp conversation with ${contact?.name || 'contact'}`
      }));
    }
  }, [open, contact]);

  const fetchPipelines = async () => {
    setIsLoadingPipelines(true);
    try {
      const response = await fetch(`/api/crm-integration/pipelines?wabaId=${wabaId}`);
      const data = await response.json();
      
      if (data.success) {
        setPipelines(data.pipelines);
        if (data.pipelines.length > 0) {
          setSelectedPipeline(data.pipelines[0]);
          setLeadData(prev => ({
            ...prev,
            stage: data.pipelines[0].openStages?.[0]?.name || ''
          }));
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch pipelines",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch pipelines",
        variant: "destructive"
      });
    } finally {
      setIsLoadingPipelines(false);
    }
  };

  const handlePipelineChange = (pipelineId: string) => {
    const pipeline = pipelines.find(p => p.id === pipelineId);
    setSelectedPipeline(pipeline);
    setLeadData(prev => ({
      ...prev,
      stage: pipeline?.openStages?.[0]?.name || ''
    }));
  };

  const handleCreateLead = async () => {
    if (!leadData.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for the lead",
        variant: "destructive"
      });
      return;
    }

    if (!selectedPipeline) {
      toast({
        title: "Pipeline Required",
        description: "Please select a pipeline",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/crm-integration/create-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactId: contact._id,
          leadData: {
            ...leadData,
            amount: parseFloat(leadData.amount) || 0,
            closeDate: leadData.closeDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          },
          pipelineData: {
            name: selectedPipeline.name,
            openStages: selectedPipeline.openStages,
            closeStages: selectedPipeline.closeStages
          },
          wabaId
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Lead Created",
          description: `Lead "${leadData.title}" has been created in your CRM`
        });
        onOpenChange(false);
        // Reset form
        setLeadData({
          title: '',
          description: '',
          amount: '',
          stage: '',
          closeDate: '',
          remarks: '',
          source: 'WhatsApp - Zaptick'
        });
      } else {
        toast({
          title: "Failed to Create Lead",
          description: data.error || "An error occurred while creating the lead",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create lead in CRM",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingPipelines) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading pipelines...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Lead in CRM</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Convert {contact?.name || 'this contact'} into a lead in your Zapllo CRM
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Pipeline Selection */}
          <div className="space-y-2">
            <Label htmlFor="pipeline">Pipeline</Label>
            <Select value={selectedPipeline?.id || ''} onValueChange={handlePipelineChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a pipeline" />
              </SelectTrigger>
              <SelectContent>
                {pipelines.map((pipeline) => (
                  <SelectItem key={pipeline.id} value={pipeline.id}>
                    {pipeline.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stage Selection */}
          {selectedPipeline && (
            <div className="space-y-2">
              <Label htmlFor="stage">Stage</Label>
              <Select value={leadData.stage} onValueChange={(value) => setLeadData(prev => ({ ...prev, stage: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a stage" />
                </SelectTrigger>
                <SelectContent>
                  {selectedPipeline.openStages?.map((stage: any) => (
                    <SelectItem key={stage.name} value={stage.name}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: stage.color }}
                        />
                        {stage.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Lead Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Lead Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Website Development Project"
              value={leadData.title}
              onChange={(e) => setLeadData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the lead opportunity..."
              value={leadData.description}
              onChange={(e) => setLeadData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Expected Value</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                className="pl-9"
                value={leadData.amount}
                onChange={(e) => setLeadData(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>
          </div>

          {/* Close Date */}
          <div className="space-y-2">
            <Label htmlFor="closeDate">Expected Close Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="closeDate"
                type="date"
                className="pl-9"
                value={leadData.closeDate}
                onChange={(e) => setLeadData(prev => ({ ...prev, closeDate: e.target.value }))}
              />
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <Label htmlFor="remarks">Additional Notes</Label>
            <Textarea
              id="remarks"
              placeholder="Any additional information about this lead..."
              value={leadData.remarks}
              onChange={(e) => setLeadData(prev => ({ ...prev, remarks: e.target.value }))}
              rows={2}
            />
          </div>

          {/* Contact Info Display */}
          <div className="bg-muted/50 p-3 rounded-md">
            <h4 className="font-medium text-sm mb-2">Contact Information</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Name:</strong> {contact?.name}</p>
              <p><strong>Phone:</strong> {contact?.phone}</p>
              {contact?.email && <p><strong>Email:</strong> {contact.email}</p>}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateLead}
            disabled={isLoading || !leadData.title.trim() || !selectedPipeline}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Lead'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}