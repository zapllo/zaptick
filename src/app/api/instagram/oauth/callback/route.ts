import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import InstagramAccount from '@/models/InstagramAccount';
import { InstagramService } from '@/lib/instagram';

// Update these lines at the top:
const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID;
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET;

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

        const { code } = await req.json();

        if (!code) {
            return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
        }

        const redirectUri = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/instagram/callback`;

        // Change the token exchange to use Instagram credentials:
        const tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: INSTAGRAM_APP_ID!, // Changed from FACEBOOK_APP_ID
                client_secret: INSTAGRAM_APP_SECRET!, // Changed from FACEBOOK_APP_SECRET
                redirect_uri: redirectUri,
                code: code,
            }),
        });

        // Also update the long-lived token exchange:
        const longLivedUrl = `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${INSTAGRAM_APP_ID}&client_secret=${INSTAGRAM_APP_SECRET}&fb_exchange_token=${shortLivedToken}`;

        const longLivedTokenResponse = await fetch(longLivedUrl);
        const longLivedTokenData = await longLivedTokenResponse.json();

        if (longLivedTokenData.error) {
            console.warn('Long-lived token exchange failed, using short-lived token');
        }

        const accessToken = longLivedTokenData.access_token || shortLivedToken;
        const expiresIn = longLivedTokenData.expires_in;

        // Step 3: Get user's Facebook pages
        const pagesResponse = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`);
        const pagesData = await pagesResponse.json();

        if (pagesData.error) {
            throw new Error(`Failed to fetch pages: ${pagesData.error.message}`);
        }

        const pages = pagesData.data;
        if (!pages || pages.length === 0) {
            return NextResponse.json({
                error: 'No Facebook pages found',
                message: 'You need to have a Facebook page connected to an Instagram Business account to proceed.'
            }, { status: 400 });
        }

        // Step 4: Find pages with Instagram Business accounts
        const instagramPages = [];

        for (const page of pages) {
            try {
                const pageInstagramResponse = await fetch(
                    `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account{id,username,name,biography,website,followers_count,media_count,profile_picture_url}&access_token=${page.access_token}`
                );

                const pageInstagramData = await pageInstagramResponse.json();

                if (pageInstagramData.instagram_business_account) {
                    instagramPages.push({
                        page: page,
                        instagram: pageInstagramData.instagram_business_account,
                        pageAccessToken: page.access_token
                    });
                }
            } catch (error) {
                console.log(`No Instagram account found for page: ${page.name}`);
            }
        }

        if (instagramPages.length === 0) {
            return NextResponse.json({
                error: 'No Instagram Business accounts found',
                message: 'None of your Facebook pages have an Instagram Business account connected. Please connect an Instagram Business account to your Facebook page first.'
            }, { status: 400 });
        }

        // Step 5: Connect the first Instagram Business account found (or let user choose)
        const selectedPage = instagramPages[0];
        const igAccount = selectedPage.instagram;

        // Check if account already exists
        const existingAccount = await InstagramAccount.findOne({
            instagramBusinessId: igAccount.id
        });

        if (existingAccount && existingAccount.userId.toString() !== decoded.id) {
            return NextResponse.json({
                error: 'Instagram account already connected',
                message: 'This Instagram account is already connected to another ZapTick account.'
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
                accessToken: accessToken,
                pageId: selectedPage.page.id,
                pageName: selectedPage.page.name,
                pageAccessToken: selectedPage.pageAccessToken,
                connectedAt: new Date(),
                status: 'active',
                permissions: ['instagram_basic', 'instagram_manage_messages', 'instagram_manage_comments'],
                tokenExpiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined
            },
            { upsert: true, new: true }
        );

        // Update user's Instagram accounts
        await User.findByIdAndUpdate(
            decoded.id,
            {
                $pull: { instagramAccounts: { instagramBusinessId: igAccount.id } }, // Remove if exists
            }
        );

        await User.findByIdAndUpdate(
            decoded.id,
            {
                $push: {
                    instagramAccounts: {
                        instagramBusinessId: igAccount.id,
                        username: igAccount.username,
                        name: igAccount.name,
                        profilePictureUrl: igAccount.profile_picture_url,
                        pageId: selectedPage.page.id,
                        pageName: selectedPage.page.name,
                        connectedAt: new Date(),
                        status: 'active',
                        followersCount: igAccount.followers_count,
                        lastSyncAt: new Date()
                    }
                }
            }
        );

        console.log(`✅ Instagram account connected: @${igAccount.username} (ID: ${igAccount.id})`);

        return NextResponse.json({
            success: true,
            account: {
                id: instagramAccount._id,
                instagramBusinessId: igAccount.id,
                username: igAccount.username,
                name: igAccount.name,
                profilePictureUrl: igAccount.profile_picture_url,
                followersCount: igAccount.followers_count,
                connectedAt: instagramAccount.connectedAt,
                pageId: selectedPage.page.id,
                pageName: selectedPage.page.name
            },
            message: 'Instagram Business account connected successfully!'
        });

    } catch (error) {
        console.error('Instagram OAuth callback error:', error);
        return NextResponse.json({
            error: 'Failed to connect Instagram account',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}