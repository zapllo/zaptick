"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Loader2, 
  DollarSign, 
  Calendar, 
  Target, 
  User, 
  Phone, 
  Mail, 
  MessageSquare,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Plus,
  Zap
} from 'lucide-react';

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
    source: 'Zaptick'
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
        description: `Potential lead from WhatsApp conversation with ${contact?.name || 'contact'}.`,
        closeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
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
        contactId: contactId,
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
          title: "Success! 🎉",
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
          source: 'Zaptick'
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
        <DialogContent className="sm:max-w-2xl max-h-[95vh] flex flex-col p-0">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-2 mt-6">
              <h3 className="text-lg font-semibold text-slate-900">Loading Pipelines</h3>
              <p className="text-sm text-muted-foreground">Fetching your CRM pipelines...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (pipelines.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg p-0">
          <div className="p-8">
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-500/10 to-amber-600/20 rounded-2xl flex items-center justify-center mx-auto">
                  <AlertCircle className="h-12 w-12 text-amber-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center">
                  <Plus className="h-4 w-4 text-white" />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-bold text-slate-900">No Pipelines Available</h3>
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                  You need to create at least one pipeline in your CRM before creating leads. Pipelines help organize your sales process.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => window.open('https://crm.zapllo.com/pipelines', '_blank')}
                  className="gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                >
                  <ExternalLink className="h-4 w-4" />
                  Create Pipeline in CRM
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl max-h-[95vh] flex flex-col p-0">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b border-slate-200 flex-shrink-0 bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-slate-900">
                  Create Lead in CRM
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                  Convert {contact?.name || 'this contact'} into a qualified lead in your Zapllo CRM
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-8">
              {/* Contact Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Contact Information
                  </h3>
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                        {contact?.name?.charAt(0)?.toUpperCase() || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-blue-900">{contact?.name}</h4>
                        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                          WhatsApp Contact
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-blue-700">
                          <Phone className="h-4 w-4" />
                          <span>{contact?.phone}</span>
                        </div>
                        {contact?.email && (
                          <div className="flex items-center gap-2 text-blue-700">
                            <Mail className="h-4 w-4" />
                            <span>{contact.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {process.env.NODE_ENV === 'development' && (
                  <div className="p-3 bg-slate-100 rounded-lg text-xs text-slate-600 space-y-1">
                    <div><strong>Contact ID:</strong> {contact?._id}</div>
                    <div><strong>WABA ID:</strong> {wabaId}</div>
                  </div>
                )}
              </div>

              {/* Pipeline & Stage Selection */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Pipeline & Stage
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="pipeline" className="text-sm font-medium text-slate-700">
                      Select Pipeline <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={selectedPipeline?.id || ''}
                      onValueChange={handlePipelineChange}
                    >
                      <SelectTrigger className="bg-white border-slate-200 focus:border-purple-500/50 focus:ring-purple-500/20">
                        <SelectValue placeholder="Choose a sales pipeline" />
                      </SelectTrigger>
                      <SelectContent>
                        {pipelines.map((pipeline) => (
                          <SelectItem key={pipeline.id} value={pipeline.id}>
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-purple-600" />
                              <span>{pipeline.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500">
                      Choose which sales pipeline to add this lead to
                    </p>
                  </div>

                  {selectedPipeline && (
                    <div className="space-y-2">
                      <Label htmlFor="stage" className="text-sm font-medium text-slate-700">
                        Initial Stage <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={leadData.stage}
                        onValueChange={(value) => {
                          console.log('Stage changed to:', value);
                          setLeadData(prev => ({ ...prev, stage: value }));
                        }}
                      >
                        <SelectTrigger className="bg-white border-slate-200 focus:border-purple-500/50 focus:ring-purple-500/20">
                          <SelectValue placeholder="Select starting stage" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedPipeline.openStages?.map((stage: any) => (
                            <SelectItem key={stage.name} value={stage.name}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: stage.color }}
                                />
                                <span>{stage.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-slate-500">
                        Lead will start in this stage of your pipeline
                      </p>
                    </div>
                  )}
                </div>

                {selectedPipeline && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <Target className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-purple-900 mb-2">Pipeline: {selectedPipeline.name}</h4>
                        <div className="text-sm text-purple-700 space-y-2">
                          {selectedPipeline.openStages?.length > 0 && (
                            <div>
                              <span className="font-medium">Available Stages: </span>
                              <span>{selectedPipeline.openStages.map((s: any) => s.name).join(', ')}</span>
                            </div>
                          )}
                          <div className="text-xs text-purple-600">
                            This pipeline has {(selectedPipeline.openStages?.length || 0) + (selectedPipeline.closeStages?.length || 0)} total stages
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Lead Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Lead Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium text-slate-700">
                      Lead Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., Website Development Project"
                      value={leadData.title}
                      onChange={(e) => setLeadData(prev => ({ ...prev, title: e.target.value }))}
                      className="bg-white border-slate-200 focus:border-green-500/50 focus:ring-green-500/20"
                    />
                    <p className="text-xs text-slate-500">
                      A clear, descriptive title for this lead opportunity
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-sm font-medium text-slate-700">
                      Expected Value
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        className="pl-9 bg-white border-slate-200 focus:border-green-500/50 focus:ring-green-500/20"
                        value={leadData.amount}
                        onChange={(e) => setLeadData(prev => ({ ...prev, amount: e.target.value }))}
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Estimated deal value (optional)
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                    Lead Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the lead opportunity, requirements, or any relevant details..."
                    value={leadData.description}
                    onChange={(e) => setLeadData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="bg-white border-slate-200 focus:border-green-500/50 focus:ring-green-500/20 resize-none"
                  />
                  <p className="text-xs text-slate-500">
                    Provide context about this lead opportunity
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="closeDate" className="text-sm font-medium text-slate-700">
                      Expected Close Date
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="closeDate"
                        type="date"
                        className="pl-9 bg-white border-slate-200 focus:border-green-500/50 focus:ring-green-500/20"
                        value={leadData.closeDate}
                        onChange={(e) => setLeadData(prev => ({ ...prev, closeDate: e.target.value }))}
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      When do you expect to close this deal?
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                      Lead Source
                    </Label>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        <span className="font-medium text-slate-900">Zaptick WhatsApp</span>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          Verified Source
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">
                      This lead originated from WhatsApp via Zaptick
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remarks" className="text-sm font-medium text-slate-700">
                    Additional Notes
                  </Label>
                  <Textarea
                    id="remarks"
                    placeholder="Any additional information, special requirements, or notes about this lead..."
                    value={leadData.remarks}
                    onChange={(e) => setLeadData(prev => ({ ...prev, remarks: e.target.value }))}
                    rows={3}
                    className="bg-white border-slate-200 focus:border-green-500/50 focus:ring-green-500/20 resize-none"
                  />
                  <p className="text-xs text-slate-500">
                    Internal notes that will help you manage this lead
                  </p>
                </div>
              </div>

              {/* Preview Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Lead Preview
                  </h3>
                </div>

                <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-lg border border-amber-200">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-amber-900">
                        {leadData.title || 'Lead Title'}
                      </h4>
                      {leadData.amount && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          ${parseFloat(leadData.amount).toLocaleString()}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-amber-600 font-medium">Pipeline:</span>
                        <span className="ml-2 text-amber-800">{selectedPipeline?.name || 'Not selected'}</span>
                      </div>
                      <div>
                        <span className="text-amber-600 font-medium">Stage:</span>
                        <span className="ml-2 text-amber-800">{leadData.stage || 'Not selected'}</span>
                      </div>
                      <div>
                        <span className="text-amber-600 font-medium">Contact:</span>
                        <span className="ml-2 text-amber-800">{contact?.name}</span>
                      </div>
                      <div>
                        <span className="text-amber-600 font-medium">Source:</span>
                        <span className="ml-2 text-amber-800">Zaptick WhatsApp</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 flex-shrink-0 bg-white">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 sm:flex-none hover:bg-slate-50"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateLead}
                disabled={isLoading || !leadData.title.trim() || !selectedPipeline || !leadData.stage}
                className="flex-1 gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Lead...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Create Lead in CRM
                  </>
                )}
              </Button>
            </div>

            {/* Success Indicator */}
            {/* {!isLoading && leadData.title.trim() && selectedPipeline && leadData.stage && (
              <div className="flex items-center justify-center gap-2 mt-3 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Ready to create lead</span>
              </div>
            )} */}
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}