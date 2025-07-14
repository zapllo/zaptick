import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

const INT_TOKEN = process.env.INTERAKT_API_TOKEN;

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

    // Validate file type based on intended use
    const allowedTypes: Record<string, string[]> = {
      'image': ['image/jpeg', 'image/png', 'image/jpg'],
      'video': ['video/mp4', 'video/3gpp'],
      'document': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      'audio': ['audio/mpeg', 'audio/ogg', 'audio/aac', 'audio/amr'],
      'profile_picture': ['image/jpeg', 'image/png', 'image/jpg']
    };

    if (!type || !allowedTypes[type]?.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type ${file.type} for selected media type ${type}. Allowed types: ${allowedTypes[type]?.join(', ')}` },
        { status: 400 }
      );
    }

    console.log('Using WABA account:', {
      wabaId: wabaAccount.wabaId,
      phoneNumberId: wabaAccount.phoneNumberId
    });

    // Upload to WhatsApp Media API via Interakt
    const mediaFormData = new FormData();
    mediaFormData.append('file', file);
    mediaFormData.append('type', type === 'profile_picture' ? 'image' : type);
    mediaFormData.append('messaging_product', 'whatsapp');

    console.log('Uploading to Interakt API:', {
      url: `https://amped-express.interakt.ai/api/v17.0/${wabaAccount.phoneNumberId}/media`,
      headers: {
        'x-waba-id': wabaAccount.wabaId,
        'x-access-token': INT_TOKEN ? 'Present' : 'Missing'
      }
    });

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
    console.log('Interakt API response:', {
      status: uploadResponse.status,
      statusText: uploadResponse.statusText,
      response: responseText
    });

    if (!uploadResponse.ok) {
      console.error('Media upload error:', responseText);
      return NextResponse.json(
        { error: `Failed to upload media to WhatsApp: ${responseText}` },
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

    // Get media URL for preview
    let mediaUrl = '';
    try {
      const mediaInfoResponse = await fetch(
        `https://amped-express.interakt.ai/api/v17.0/${mediaId}`,
        {
          method: 'GET',
          headers: {
            'x-access-token': INT_TOKEN!,
            'x-waba-id': wabaAccount.wabaId,
          }
        }
      );

      if (mediaInfoResponse.ok) {
        const mediaInfo = await mediaInfoResponse.json();
        mediaUrl = mediaInfo.url || '';
      }
    } catch (mediaInfoError) {
      console.warn('Failed to get media URL:', mediaInfoError);
      // Don't fail the upload if we can't get the URL
    }

    console.log('Upload successful:', {
      mediaId: mediaId,
      mediaUrl: mediaUrl,
      fileName: file.name,
      wabaAccount: wabaAccount.wabaId
    });

    return NextResponse.json({
      success: true,
      message: 'Media uploaded successfully',
      mediaId: mediaId,
      mediaUrl: mediaUrl,
      type: type,
      fileName: file.name,
      fileSize: file.size,
      wabaAccount: {
        wabaId: wabaAccount.wabaId,
        phoneNumberId: wabaAccount.phoneNumberId
      }
    });

  } catch (error) {
    console.error('Media upload error:', error);
    return NextResponse.json({ 
      error: 'File upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}