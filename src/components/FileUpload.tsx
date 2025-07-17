"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, Upload, File, Image, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File, type: string) => void;
  onUploadComplete: (url: string, type: string, caption?: string) => void;
  accept: string;
  maxSize?: number;
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
}

export default function FileUpload({ 
  onFileSelect, 
  onUploadComplete, 
  accept, 
  maxSize = 16 * 1024 * 1024, // 16MB
  type 
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `File size must be less than ${maxSize / (1024 * 1024)}MB`,
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    onFileSelect(file, type);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', type);

      const response = await fetch('/api/upload-media', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      setUploadProgress(100);
      onUploadComplete(data.url, type, caption);
      
      toast({
        title: "File uploaded successfully",
        description: "Your file is ready to send"
      });

      // Reset
      setSelectedFile(null);
      setCaption("");
      setUploadProgress(0);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = () => {
    switch (type) {
      case 'IMAGE': return <Image className="h-8 w-8 text-blue-500" />;
      case 'VIDEO': return <Video className="h-8 w-8 text-purple-500" />;
      case 'DOCUMENT': return <File className="h-8 w-8 text-orange-500" />;
      default: return <Upload className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <div className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            id={`file-upload-${type}`}
          />
          <label
            htmlFor={`file-upload-${type}`}
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            {getFileIcon()}
            <p className="text-sm text-muted-foreground">
              Click to select {type.toLowerCase()}
            </p>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-accent/20 rounded-lg">
            {getFileIcon()}
            <div className="flex-1">
              <p className="text-sm font-medium truncate">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFile(null)}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {(type === 'IMAGE' || type === 'VIDEO') && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Caption (optional)</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption..."
                className="w-full p-2 border border-border/50 rounded-md resize-none"
                rows={2}
                disabled={uploading}
              />
            </div>
          )}

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1"
            >
              {uploading ? "Uploading..." : "Upload & Send"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedFile(null)}
              disabled={uploading}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}