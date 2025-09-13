"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  FileText,
  Trash2,
  Settings,
  AlertCircle,
  CheckCircle,
  Loader2,
  Info,
  Brain,
  Search,
  Eye,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Document {
  id: string;
  filename: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  processedAt?: string;
  status: 'uploading' | 'processing' | 'processed' | 'failed';
  errorMessage?: string;
  chunks?: number;
  textPreview?: string;
  processingStats?: {
    originalLength: number;
    chunksCount: number;
    averageChunkSize: number;
  };
}

interface KnowledgeBase {
  enabled: boolean;
  documents: Document[];
  settings: {
    maxDocuments: number;
    maxFileSize: number;
    allowedFileTypes: string[];
    chunkSize: number;
    chunkOverlap: number;
    searchMode: 'semantic' | 'keyword' | 'hybrid';
    maxRelevantChunks: number;
  };
}

interface KnowledgeBaseManagerProps {
  chatbotId: string;
  knowledgeBase: KnowledgeBase;
  onUpdate: (knowledgeBase: KnowledgeBase) => void;
}

export default function KnowledgeBaseManager({
  chatbotId,
  knowledgeBase,
  onUpdate
}: KnowledgeBaseManagerProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  // File upload with dropzone
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      acceptedFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`/api/chatbots/${chatbotId}/knowledge-base`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: `Processed ${data.processed} files successfully${data.errors.length > 0 ? `, ${data.errors.length} failed` : ''}`,
        });

        if (data.errors.length > 0) {
          console.log('Upload errors:', data.errors);
          data.errors.forEach((error: any) => {
            toast({
              title: "File Error",
              description: `${error.filename}: ${error.error}`,
              variant: "destructive",
            });
          });
        }

        onUpdate(data.knowledgeBase);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to upload documents",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload documents",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [chatbotId, onUpdate, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'text/markdown': ['.md']
    },
    maxSize: knowledgeBase.settings.maxFileSize * 1024 * 1024,
    maxFiles: knowledgeBase.settings.maxDocuments - knowledgeBase.documents.length,
    disabled: isUploading
  });

  // Delete document
  const handleDeleteDocument = async () => {
    if (!selectedDocument) return;

    try {
      const response = await fetch(
        `/api/chatbots/${chatbotId}/knowledge-base?documentId=${selectedDocument.id}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Document deleted successfully",
        });

        const updatedKnowledgeBase = {
          ...knowledgeBase,
          documents: knowledgeBase.documents.filter(doc => doc.id !== selectedDocument.id)
        };
        onUpdate(updatedKnowledgeBase);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete document",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedDocument(null);
    }
  };

  // Toggle knowledge base
  const handleToggleKnowledgeBase = async (enabled: boolean) => {
    try {
      const response = await fetch(`/api/chatbots/${chatbotId}/knowledge-base`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled }),
      });

      const data = await response.json();

      if (data.success) {
        onUpdate(data.knowledgeBase);
        toast({
          title: "Success",
          description: `Knowledge base ${enabled ? 'enabled' : 'disabled'}`,
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update knowledge base",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Toggle error:', error);
      toast({
        title: "Error",
        description: "Failed to update knowledge base",
        variant: "destructive",
      });
    }
  };

  // Get file icon
  const getFileIcon = (fileType: string) => {
    return <FileText className="h-4 w-4" />;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Knowledge Base
          </h3>
          <p className="text-sm text-muted-foreground">
            Upload documents to enhance your chatbot with specific knowledge
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            checked={knowledgeBase.enabled}
            onCheckedChange={handleToggleKnowledgeBase}
          />
          <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Knowledge Base Settings</DialogTitle>
                <DialogDescription>
                  Configure how your knowledge base processes and searches documents
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Max Documents</Label>
                    <Input
                      type="number"
                      value={knowledgeBase.settings.maxDocuments}
                      min="1"
                      max="100"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max File Size (MB)</Label>
                    <Input
                      type="number"
                      value={knowledgeBase.settings.maxFileSize}
                      min="1"
                      max="50"
                      readOnly
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Search Mode</Label>
                  <Select value={knowledgeBase.settings.searchMode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semantic">Semantic Search</SelectItem>
                      <SelectItem value="keyword">Keyword Search</SelectItem>
                      <SelectItem value="hybrid">Hybrid Search</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Max Relevant Results</Label>
                  <Input
                    type="number"
                    value={knowledgeBase.settings.maxRelevantChunks}
                    min="1"
                    max="10"
                    readOnly
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Documents</p>
                <p className="text-2xl font-bold">{knowledgeBase.documents.length}</p>
              </div>
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Chunks</p>
                <p className="text-2xl font-bold">
                  {knowledgeBase.documents.reduce((sum, doc) => sum + (doc.chunks || 0), 0)}
                </p>
              </div>
              <Search className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Size</p>
                <p className="text-2xl font-bold">
                  {(knowledgeBase.documents.reduce((sum, doc) => sum + doc.fileSize, 0) / 1024 / 1024).toFixed(1)}MB
                </p>
              </div>
              <Download className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Processed</p>
                <p className="text-2xl font-bold">
                  {knowledgeBase.documents.filter(doc => doc.status === 'processed').length}
                </p>
              </div>
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Area */}
      {knowledgeBase.enabled && (
        <Card>
          <CardContent className="p-6">
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50",
                isUploading && "opacity-50 cursor-not-allowed"
              )}
            >
              <input {...getInputProps()} />
              
              {isUploading ? (
                <div className="space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                  <div>
                    <p className="text-lg font-medium">Processing documents...</p>
                    <p className="text-sm text-muted-foreground">
                      Extracting text and creating searchable chunks
                    </p>
                  </div>
                  {uploadProgress > 0 && (
                    <div className="max-w-xs mx-auto">
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">
                      {isDragActive ? "Drop files here" : "Upload documents"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Drag & drop files or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Supports: PDF, TXT, DOC, DOCX, CSV, JSON, MD (max {knowledgeBase.settings.maxFileSize}MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Upload limits info */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium">Upload Limits</p>
                  <p>
                    {knowledgeBase.documents.length} / {knowledgeBase.settings.maxDocuments} documents used
                    • Max {knowledgeBase.settings.maxFileSize}MB per file
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents List */}
      {knowledgeBase.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Uploaded Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {knowledgeBase.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {getFileIcon(doc.fileType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{doc.originalName}</p>
                      <Badge variant="outline" className={getStatusColor(doc.status)}>
                        {doc.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                      <span>{doc.fileType.toUpperCase()}</span>
                      {doc.chunks && <span>{doc.chunks} chunks</span>}
                      {doc.status === 'failed' && (
                        <span className="text-red-600">{doc.errorMessage}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {doc.status === 'processed' && doc.textPreview && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedDocument(doc);
                        setPreviewDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedDocument(doc);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {knowledgeBase.enabled && knowledgeBase.documents.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium">No documents uploaded</h3>
                <p className="text-sm text-muted-foreground">
                  Upload your first document to start building your knowledge base
                </p>
                </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Knowledge Base Disabled State */}
      {!knowledgeBase.enabled && (
        <Card className="border-2 border-dashed">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Knowledge Base Disabled</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Enable knowledge base to upload documents and enhance your chatbot&apos;s responses with specific company information
                </p>
              </div>
              <Button
                onClick={() => handleToggleKnowledgeBase(true)}
                className="gap-2"
              >
                <Brain className="h-4 w-4" />
                Enable Knowledge Base
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedDocument?.originalName}
            </DialogTitle>
            <DialogDescription>
              Document preview and processing information
            </DialogDescription>
          </DialogHeader>
          {selectedDocument && (
            <div className="flex-1 overflow-hidden">
              <div className="space-y-4">
                {/* Document Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-blue-700">File Size</p>
                    <p className="text-sm text-blue-900">
                      {(selectedDocument.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-green-700">Chunks</p>
                    <p className="text-sm text-green-900">{selectedDocument.chunks || 0}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-purple-700">Type</p>
                    <p className="text-sm text-purple-900">{selectedDocument.fileType.toUpperCase()}</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-orange-700">Status</p>
                    <Badge className={getStatusColor(selectedDocument.status)}>
                      {selectedDocument.status}
                    </Badge>
                  </div>
                </div>

                {/* Processing Stats */}
                {selectedDocument.processingStats && (
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-medium text-sm mb-3">Processing Statistics</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Original Length</p>
                        <p className="font-medium">
                          {selectedDocument.processingStats.originalLength.toLocaleString()} characters
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Chunks Created</p>
                        <p className="font-medium">{selectedDocument.processingStats.chunksCount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Chunk Size</p>
                        <p className="font-medium">
                          {Math.round(selectedDocument.processingStats.averageChunkSize)} chars
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Text Preview */}
                {selectedDocument.textPreview && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Content Preview</h4>
                    <div className="bg-white border rounded-lg p-4 max-h-64 overflow-y-auto">
                      <pre className="text-sm whitespace-pre-wrap text-slate-700">
                        {selectedDocument.textPreview}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {selectedDocument.status === 'failed' && selectedDocument.errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-red-900">Processing Failed</h4>
                        <p className="text-sm text-red-700 mt-1">{selectedDocument.errorMessage}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Delete Document?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The document will be permanently removed from your knowledge base.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedDocument && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <FileText className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="font-medium">{selectedDocument.originalName}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedDocument.chunks || 0} chunks • {(selectedDocument.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDocument}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Document
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}