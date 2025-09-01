import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import InstagramAccount from '@/models/InstagramAccount';
import { InstagramService } from '@/lib/instagram';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
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

    const { 
      pageId, 
      pageAccessToken, 
      pageName,
      instagramBusinessId,
      longLivedToken 
    } = await req.json();

    if (!pageId || !pageAccessToken || !instagramBusinessId) {
      return NextResponse.json({ 
        error: 'Missing required fields: pageId, pageAccessToken, instagramBusinessId' 
      }, { status: 400 });
    }

    // Get Instagram Business Account details
    const accountResult = await InstagramService.getBusinessAccount(pageAccessToken, pageId);
    
    if (!accountResult.success) {
      return NextResponse.json({ 
        error: 'Failed to fetch Instagram account details',
        details: accountResult.error 
      }, { status: 400 });
    }

    const igAccount = accountResult.account;

    // Check if account already exists
    const existingAccount = await InstagramAccount.findOne({
      instagramBusinessId: igAccount.id
    });

    if (existingAccount && existingAccount.userId.toString() !== decoded.id) {
      return NextResponse.json({ 
        error: 'This Instagram account is already connected to another user' 
      }, { status: 409 });
    }

    // Create or update Instagram account
    const instagramAccount = await InstagramAccount.findOneAndUpdate(
      { instagramBusinessId: igAccount.id },
      {
        userId: decoded.id,
        companyId: user.companyId,
        instagramBusinessId: igAccount.id,
        instagramAccountId: igAccount.id,
        username: igAccount.username,
        name: igAccount.name,
        profilePictureUrl: igAccount.profile_picture_url,
        followersCount: igAccount.followers_count,
        mediaCount: igAccount.media_count,
        biography: igAccount.biography,
        website: igAccount.website,
        accessToken: longLivedToken || pageAccessToken,
        pageId,
        pageName,
        pageAccessToken,
        connectedAt: new Date(),
        status: 'active',
        permissions: ['instagram_basic', 'instagram_manage_messages', 'instagram_manage_comments'],
        tokenExpiresAt: longLivedToken ? new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) : undefined // 60 days for long-lived tokens
      },
      { upsert: true, new: true }
    );

    // Update user's Instagram accounts array
    const userUpdate = await User.findByIdAndUpdate(
      decoded.id,
      {
        $addToSet: {
          instagramAccounts: {
            instagramBusinessId: igAccount.id,
            username: igAccount.username,
            name: igAccount.name,
            profilePictureUrl: igAccount.profile_picture_url,
            pageId,
            pageName,
            connectedAt: new Date(),
            status: 'active',
            followersCount: igAccount.followers_count,
            lastSyncAt: new Date()
          }
        }
      },
      { new: true }
    );

    // Set up webhook subscriptions (this should be done via Meta App settings)
    console.log(`Instagram account connected: ${igAccount.username} (${igAccount.id})`);

    return NextResponse.json({
      success: true,
      account: {
        id: instagramAccount._id,
        instagramBusinessId: igAccount.id,
        username: igAccount.username,
        name: igAccount.name,
        profilePictureUrl: igAccount.profile_picture_url,
        followersCount: igAccount.followers_count,
        connectedAt: instagramAccount.connectedAt
      }
    });

  } catch (error) {
    console.error('Instagram connection error:', error);
    return NextResponse.json({
      error: 'Failed to connect Instagram account',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}