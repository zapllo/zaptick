"use client";

import { useState, useCallback } from "react";
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, Upload, FileText, Image, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileSelect?: (file: File) => void;
  onUploadComplete: (url: string, type: 'IMAGE' | 'VIDEO' | 'DOCUMENT') => void;
  accept?: string;
  maxSize?: number;
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
}

export default function FileUpload({
  onFileSelect,
  onUploadComplete,
  accept,
  maxSize = 16,
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

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', type);
  const response = await fetch('/api/upload-media', {
        method: 'POST',
        body: formData,});

          if (!response.ok) {
        throw new Error('Upload failed');
      }

 

      // Start upload - Use the correct endpoint
      xhr.open('POST', '/api/upload-media');
      xhr.send(formData);

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      setUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  const getFileTypesText = () => {
    switch (type) {
      case 'DOCUMENT':
        return 'PDF, DOC, XLS, PPT, TXT, CSV';
      case 'IMAGE':
        return 'JPG, PNG, GIF, WebP';
      case 'VIDEO':
        return 'MP4, MOV, AVI';
      default:
        return 'All files';
    }
  };

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-primary hover:bg-gray-50'
            }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-700">
              {isDragActive
                ? `Drop your ${type.toLowerCase()} here`
                : `Upload ${type.toLowerCase()}`}
            </p>
            <p className="text-sm text-gray-500">
              Drag and drop or click to browse
            </p>
            <p className="text-xs text-gray-400">
              Max size: {maxSize}MB • Supported: {getFileTypesText()}
            </p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {getFileIcon(selectedFile)}
              <div>
                <p className="font-medium text-gray-700">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            {!uploading && (
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="text-gray-500 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Uploading...</span>
                <span className="text-gray-600">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {!uploading && (
            <div className="flex space-x-2 mt-4">
              <Button onClick={uploadFile} className="flex-1">
                <Upload className="h-4 w-4 mr-2" />
                Upload & Send
              </Button>
              <Button variant="outline" onClick={removeFile}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}