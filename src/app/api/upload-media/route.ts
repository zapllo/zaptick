import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const contentLength = request.headers.get('content-length');
    const maxSize = 16 * 1024 * 1024; // 16 MB limit for WhatsApp media

    if (contentLength && parseInt(contentLength) > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 16MB limit' },
        { status: 413 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = {
      'IMAGE': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      'VIDEO': ['video/mp4', 'video/avi', 'video/mov'],
      'DOCUMENT': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    };

    if (!type || !allowedTypes[type as keyof typeof allowedTypes]?.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type for selected media type' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: `template-media/${type.toLowerCase()}/${Date.now()}-${file.name}`,
      Body: buffer,
      ContentType: file.type,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);

    const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;

    // For WhatsApp templates, we need to return a handle that can be used in the API
    // This would typically be obtained from WhatsApp's media upload API
    // For now, we'll return the S3 URL as the handle
    const handle = `media::${type}:${uploadParams.Key}`;

    return NextResponse.json({
      message: 'File uploaded successfully',
      handle,
      url: fileUrl,
      type
    });

  } catch (error) {
    console.error('Media upload error:', error);
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
  }
}