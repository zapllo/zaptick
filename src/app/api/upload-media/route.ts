// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import AWS from 'aws-sdk';

// Configure AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-south-1',
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'zapllo';

// Document MIME types that WhatsApp supports
const SUPPORTED_DOCUMENT_TYPES = [
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

function getFileTypeFromMime(mimeType: string): 'IMAGE' | 'VIDEO' | 'DOCUMENT' {
  if (mimeType.startsWith('image/')) return 'IMAGE';
  if (mimeType.startsWith('video/')) return 'VIDEO';
  return 'DOCUMENT';
}

function validateFileType(file: File, expectedType: string): boolean {
  const actualType = getFileTypeFromMime(file.type);
  
  switch (expectedType.toLowerCase()) {
    case 'image':
      return actualType === 'IMAGE';
    case 'video':
      return actualType === 'VIDEO';
    case 'document':
      return actualType === 'DOCUMENT' && SUPPORTED_DOCUMENT_TYPES.includes(file.type);
    default:
      return true;
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'document';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('🔍 Upload request:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      expectedType: type
    });

    // Validate file type
    if (!validateFileType(file, type)) {
      return NextResponse.json({ 
        error: `Invalid file type. Expected ${type}, got ${file.type}`,
        supportedTypes: type === 'document' ? SUPPORTED_DOCUMENT_TYPES : undefined
      }, { status: 400 });
    }

    // Check file size limits
    const maxSizes = {
      image: 5 * 1024 * 1024,    // 5MB for images
      video: 16 * 1024 * 1024,   // 16MB for videos  
      document: 100 * 1024 * 1024 // 100MB for documents (WhatsApp limit)
    };

    const maxSize = maxSizes[type.toLowerCase() as keyof typeof maxSizes] || maxSizes.document;
    
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File size too large. Max size for ${type}: ${maxSize / (1024 * 1024)}MB` 
      }, { status: 400 });
    }

    // Generate unique filename while preserving extension
    const fileExtension = file.name.split('.').pop() || '';
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const fileName = `${Date.now()}-${baseName}.${fileExtension}`;
    const key = `media/${type.toLowerCase()}/${fileName}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Set content type for documents
    let contentType = file.type;
    if (type.toLowerCase() === 'document' && !contentType) {
      // Fallback content types based on extension
      const ext = fileExtension.toLowerCase();
      const contentTypeMap: { [key: string]: string } = {
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'txt': 'text/plain',
        'csv': 'text/csv',
        'rtf': 'application/rtf'
      };
      contentType = contentTypeMap[ext] || 'application/octet-stream';
    }

    // Upload to S3
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read',
      // Add metadata for better file handling
      Metadata: {
        'original-name': file.name,
        'upload-type': type.toLowerCase(),
        'file-size': file.size.toString()
      }
    };

    console.log('🚀 Uploading to S3:', {
      key,
      contentType,
      size: file.size
    });

    const result = await s3.upload(uploadParams).promise();

    console.log('✅ Upload successful:', {
      location: result.Location,
      key: result.Key
    });

    return NextResponse.json({
      success: true,
      url: result.Location,
      key: result.Key,
      type: getFileTypeFromMime(file.type),
      filename: file.name,
      size: file.size,
      contentType: contentType
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    return NextResponse.json({
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}