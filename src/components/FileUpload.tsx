import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Image, Video, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileSelect?: (file: File) => void;
  onUploadComplete: (url: string, type: 'IMAGE' | 'VIDEO' | 'DOCUMENT') => void;
  accept?: string;
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  maxSize?: number; // in MB
}

export default function FileUpload({ 
  onFileSelect, 
  onUploadComplete, 
  accept, 
  type,
  maxSize = 10 
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const getAcceptedFileTypes = () => {
    if (accept) return accept;
    
    switch (type) {
      case 'IMAGE':
        return 'image/*';
      case 'VIDEO':
        return 'video/*';
      case 'DOCUMENT':
        return '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt';
      default:
        return '*/*';
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-8 w-8 text-blue-500" />;
    if (file.type.startsWith('video/')) return <Video className="h-8 w-8 text-purple-500" />;
    return <FileText className="h-8 w-8 text-orange-500" />;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Check file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSize) {
      toast({
        title: "File too large",
        description: `File size must be less than ${maxSize}MB`,
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    if (onFileSelect) {
      onFileSelect(file);
    }
  }, [onFileSelect, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      [getAcceptedFileTypes()]: []
    },
    multiple: false,
    maxSize: maxSize * 1024 * 1024 // Convert MB to bytes
  });

  const uploadFile = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', type.toLowerCase());

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(progress);
        }
      });

      // Handle upload completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.success) {
              onUploadComplete(response.url, type);
              toast({
                title: "Upload successful",
                description: `${type.toLowerCase()} uploaded successfully`
              });
            } else {
              throw new Error(response.error || 'Upload failed');
            }
          } catch (error) {
            toast({
              title: "Upload failed",
              description: "Failed to parse upload response",
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: "Upload failed",
            description: `Server error: ${xhr.status}`,
            variant: "destructive"
          });
        }
        setUploading(false);
      });

      // Handle upload errors
      xhr.addEventListener('error', () => {
        toast({
          title: "Upload failed",
          description: "Network error occurred",
          variant: "destructive"
        });
        setUploading(false);
      });

      // Start upload
      xhr.open('POST', '/api/upload');
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

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
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
              Max size: {maxSize}MB
              {type === 'DOCUMENT' && ' • PDF, DOC, XLS, PPT, TXT'}
              {type === 'IMAGE' && ' • JPG, PNG, GIF, WebP'}
              {type === 'VIDEO' && ' • MP4, MOV, AVI'}
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