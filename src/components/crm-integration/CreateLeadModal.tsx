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
  onLeadCreated?: () => void;
}

export default function CreateLeadModal({
  open,
  onOpenChange,
  contact,
  wabaId,
  onLeadCreated
}: CreateLeadModalProps) {
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
    if (open && contact) {
      console.log('Modal opened with contact:', contact);
      console.log('WABA ID:', wabaId);

      fetchPipelines();

      // Set default title and description
      setLeadData(prev => ({
        ...prev,
        title: `Lead for ${contact?.name || 'Contact'}`,
        description: `Potential lead from WhatsApp conversation with ${contact?.name || 'contact'}.`
      }));
    }
  }, [open, contact]);

  const fetchPipelines = async () => {
    setIsLoadingPipelines(true);
    try {
      console.log('Fetching pipelines for WABA:', wabaId);
      const response = await fetch(`/api/crm-integration/pipelines?wabaId=${wabaId}`);
      const data = await response.json();

      console.log('Pipelines response:', data);

      if (data.success && data.pipelines) {
        setPipelines(data.pipelines);
        if (data.pipelines.length > 0) {
          const defaultPipeline = data.pipelines[0];
          console.log('Setting default pipeline:', defaultPipeline);
          setSelectedPipeline(defaultPipeline);

          const defaultStage = defaultPipeline.openStages?.[0]?.name || '';
          console.log('Setting default stage:', defaultStage);
          setLeadData(prev => ({
            ...prev,
            stage: defaultStage
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
      console.error('Error fetching pipelines:', error);
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
    console.log('Pipeline changed to ID:', pipelineId);
    const pipeline = pipelines.find(p => p.id === pipelineId);
    console.log('Found pipeline:', pipeline);

    setSelectedPipeline(pipeline);

    const defaultStage = pipeline?.openStages?.[0]?.name || '';
    console.log('Setting new default stage:', defaultStage);

    setLeadData(prev => ({
      ...prev,
      stage: defaultStage
    }));
  };

  const handleCreateLead = async () => {
    console.log('=== CREATE LEAD CLICKED ===');
    console.log('Current form data:', leadData);
    console.log('Selected pipeline:', selectedPipeline);
    console.log('Contact:', contact);
    console.log('WABA ID:', wabaId);

    // Get the contact ID - handle both _id and id formats
    const contactId = contact?._id || contact?.id;
    console.log('Contact ID to use:', contactId);

    // Validation
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

    if (!leadData.stage) {
      toast({
        title: "Stage Required",
        description: "Please select a stage",
        variant: "destructive"
      });
      return;
    }

    if (!contactId) {
      toast({
        title: "Contact Error",
        description: "Contact ID is missing",
        variant: "destructive"
      });
      return;
    }

    if (!wabaId) {
      toast({
        title: "WABA Error",
        description: "WhatsApp Business Account ID is missing",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Prepare the request payload
      const payload = {
        contactId: contactId, // Use the resolved contact ID
        leadData: {
          title: leadData.title,
          description: leadData.description || `Lead for ${contact.name} from WhatsApp conversation`,
          amount: parseFloat(leadData.amount) || 0,
          stage: leadData.stage,
          closeDate: leadData.closeDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          remarks: leadData.remarks || `Lead created from Zaptick WhatsApp conversation with ${contact.name}`,
          source: leadData.source || 'Zaptick'
        },
        pipelineData: {
          name: selectedPipeline.name,
          openStages: selectedPipeline.openStages || [],
          closeStages: selectedPipeline.closeStages || []
        },
        wabaId: wabaId
      };

      console.log('=== SENDING PAYLOAD ===');
      console.log('Payload:', JSON.stringify(payload, null, 2));

      const response = await fetch('/api/crm-integration/create-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      console.log('=== RESPONSE RECEIVED ===');
      console.log('Status:', response.status);
      console.log('Response text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response:', e);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (data.success) {
        toast({
          title: "Success!",
          description: `Lead "${leadData.title}" has been created in your CRM`,
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
        setSelectedPipeline(null);

        // Call callback if provided
        if (onLeadCreated) {
          onLeadCreated();
        }
      } else {
        console.error('Lead creation failed:', data);
        toast({
          title: "Failed to Create Lead",
          description: data.error || "An error occurred while creating the lead",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error in handleCreateLead:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create lead in CRM",
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

  if (pipelines.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>No Pipelines Available</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              You need to create at least one pipeline in your CRM before creating leads.
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={() => window.open('https://crm.zapllo.com/pipelines', '_blank')}>
                Create Pipeline in CRM
              </Button>
            </div>
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
          {/* Contact Info Display */}
          <div className="bg-muted/50 p-3 rounded-md">
            <h4 className="font-medium text-sm mb-2">Contact Information</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Name:</strong> {contact?.name}</p>
              <p><strong>Phone:</strong> {contact?.phone}</p>
              {contact?.email && <p><strong>Email:</strong> {contact.email}</p>}
              <p className="text-xs"><strong>Contact ID:</strong> {contact?._id}</p>
              <p className="text-xs"><strong>WABA ID:</strong> {wabaId}</p>
            </div>
          </div>

          {/* Pipeline Selection */}
          <div className="space-y-2">
            <Label htmlFor="pipeline">Pipeline *</Label>
            <Select
              value={selectedPipeline?.id || ''}
              onValueChange={handlePipelineChange}
            >
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
              <Label htmlFor="stage">Stage *</Label>
              <Select
                value={leadData.stage}
                onValueChange={(value) => {
                  console.log('Stage changed to:', value);
                  setLeadData(prev => ({ ...prev, stage: value }));
                }}
              >
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

          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-100 p-2 rounded text-xs">
              <strong>Debug:</strong>
              <div>Pipeline: {selectedPipeline?.name || 'None'}</div>
              <div>Stage: {leadData.stage || 'None'}</div>
              <div>Title: {leadData.title || 'Empty'}</div>
            </div>
          )}
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
            disabled={isLoading || !leadData.title.trim() || !selectedPipeline || !leadData.stage}
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