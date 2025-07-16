import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Company from '@/models/Company';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const INT_TOKEN = process.env.INTERAKT_API_TOKEN;

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: string };
    if (!decoded?.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const company = await Company.findById(user.companyId);
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const contentLength = request.headers.get('content-length');
    const maxSize = 16 * 1024 * 1024; // 16 MB limit

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

    console.log('Upload request details:', {
      fileName: file.name,
      fileSize: file.size,
      type: type,
      userWabaAccounts: user.wabaAccounts?.map((acc: any) => ({
        wabaId: acc.wabaId,
        phoneNumberId: acc.phoneNumberId
      }))
    });

    // Use the first available WABA account
    const wabaAccount = user.wabaAccounts?.[0];

    if (!wabaAccount) {
      return NextResponse.json({ 
        error: 'No WhatsApp Business account found. Please connect a WhatsApp Business account first.'
      }, { status: 404 });
    }

    // For profile pictures, we need to use the media_handle endpoint
    if (type === 'profile_picture') {
      // Validate that it's an image
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type ${file.type} for profile picture. Only JPEG and PNG are supported.` },
          { status: 400 }
        );
      }

      // First, upload to S3
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: `profile-pictures/${user.companyId}/${Date.now()}-${file.name}`,
        Body: buffer,
        ContentType: file.type,
      };

      const command = new PutObjectCommand(uploadParams);
      await s3.send(command);

      const s3Url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;

      console.log('File uploaded to S3:', {
        url: s3Url,
        key: uploadParams.Key
      });

      // Upload to WhatsApp using media_handle endpoint
      const mediaFormData = new FormData();
      mediaFormData.append('file', file);
      mediaFormData.append('type', file.type);
      mediaFormData.append('messaging_product', 'whatsapp');

      console.log('Uploading profile picture to media_handle endpoint:', {
        url: `https://amped-express.interakt.ai/api/v17.0/${wabaAccount.phoneNumberId}/media_handle`,
        fileType: file.type,
        headers: {
          'x-waba-id': wabaAccount.wabaId,
          'x-access-token': INT_TOKEN ? 'Present' : 'Missing'
        }
      });

      const uploadResponse = await fetch(
        `https://amped-express.interakt.ai/api/v17.0/${wabaAccount.phoneNumberId}/media_handle`,
        {
          method: 'POST',
          headers: {
            'x-access-token': INT_TOKEN!,
            'x-waba-id': wabaAccount.wabaId,
          },
          body: mediaFormData
        }
      );

      const responseText = await uploadResponse.text();
      console.log('Media handle API response:', {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        response: responseText
      });

      if (!uploadResponse.ok) {
        console.error('Media handle upload error:', responseText);
        return NextResponse.json(
          { error: `Failed to upload profile picture: ${responseText}` },
          { status: 500 }
        );
      }

      let uploadData;
      try {
        uploadData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse upload response:', parseError);
        return NextResponse.json(
          { error: 'Invalid response from WhatsApp API' },
          { status: 500 }
        );
      }

      const mediaHandle = uploadData.h;
      if (!mediaHandle) {
        console.error('No media handle in response:', uploadData);
        return NextResponse.json(
          { error: 'No media handle received from WhatsApp' },
          { status: 500 }
        );
      }

      // Update company profile with both S3 URL and media handle
      company.whatsappProfile = {
        ...company.whatsappProfile,
        profilePictureUrl: s3Url,
        profilePictureHandle: mediaHandle,
        lastUpdated: new Date()
      };

      await company.save();

      console.log('Profile picture upload successful:', {
        mediaHandle: mediaHandle,
        s3Url: s3Url,
        fileName: file.name,
        wabaAccount: wabaAccount.wabaId
      });

      return NextResponse.json({
        success: true,
        message: 'Profile picture uploaded successfully',
        mediaHandle: mediaHandle,
        s3Url: s3Url,
        type: type,
        fileName: file.name,
        fileSize: file.size,
        wabaAccount: {
          wabaId: wabaAccount.wabaId,
          phoneNumberId: wabaAccount.phoneNumberId
        }
      });

    } else {
      // For other media types, use the regular media endpoint
      const allowedTypes: Record<string, string[]> = {
        'image': ['image/jpeg', 'image/png', 'image/jpg'],
        'video': ['video/mp4', 'video/3gpp'],
        'document': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        'audio': ['audio/mpeg', 'audio/ogg', 'audio/aac', 'audio/amr']
      };

      if (!allowedTypes[type]?.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type ${file.type} for selected media type ${type}. Allowed types: ${allowedTypes[type]?.join(', ')}` },
          { status: 400 }
        );
      }

      // Upload to S3
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: `media/${type}/${user.companyId}/${Date.now()}-${file.name}`,
        Body: buffer,
        ContentType: file.type,
      };

      const command = new PutObjectCommand(uploadParams);
      await s3.send(command);

      const s3Url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;

      // Upload to WhatsApp
      const mediaFormData = new FormData();
      mediaFormData.append('file', file);
      mediaFormData.append('type', file.type);
      mediaFormData.append('messaging_product', 'whatsapp');

      const uploadResponse = await fetch(
        `https://amped-express.interakt.ai/api/v17.0/${wabaAccount.phoneNumberId}/media`,
        {
          method: 'POST',
          headers: {
            'x-access-token': INT_TOKEN!,
            'x-waba-id': wabaAccount.wabaId,
          },
          body: mediaFormData
        }
      );

      const responseText = await uploadResponse.text();
      console.log('Regular media API response:', {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        response: responseText
      });

      if (!uploadResponse.ok) {
        console.error('Media upload error:', responseText);
        return NextResponse.json(
          { error: `Failed to upload media: ${responseText}` },
          { status: 500 }
        );
      }

      let uploadData;
      try {
        uploadData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse upload response:', parseError);
        return NextResponse.json(
          { error: 'Invalid response from WhatsApp API' },
          { status: 500 }
        );
      }

      const mediaId = uploadData.id;
      if (!mediaId) {
        console.error('No media ID in response:', uploadData);
        return NextResponse.json(
          { error: 'No media ID received from WhatsApp' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Media uploaded successfully',
        mediaId: mediaId,
        s3Url: s3Url,
        type: type,
        fileName: file.name,
        fileSize: file.size,
        wabaAccount: {
          wabaId: wabaAccount.wabaId,
          phoneNumberId: wabaAccount.phoneNumberId
        }
      });
    }

  } catch (error) {
    console.error('Media upload error:', error);
    return NextResponse.json({ 
      error: 'File upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}