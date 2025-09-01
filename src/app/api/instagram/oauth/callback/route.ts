import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import InstagramAccount from '@/models/InstagramAccount';

const META_APP_ID = process.env.META_APP_ID || process.env.NEXT_PUBLIC_META_APP_ID;
const META_APP_SECRET = process.env.META_APP_SECRET;

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

        console.log('Starting Instagram OAuth...');

        // Step 1: Get access token
        const redirectUri = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/callback`;
        
        const tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: META_APP_ID!,
                client_secret: META_APP_SECRET!,
                redirect_uri: redirectUri,
                code: code,
            }),
        });

        const tokenData = await tokenResponse.json();
        
        if (tokenData.error) {
            console.error('Token error:', tokenData.error);
            return NextResponse.json({
                error: 'Failed to get access token',
                details: tokenData.error.message
            }, { status: 400 });
        }

        const accessToken = tokenData.access_token;
        console.log('Got access token');

        // Step 2: Get user's pages
        const pagesResponse = await fetch(
            `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
        );
        const pagesData = await pagesResponse.json();

        if (pagesData.error) {
            console.error('Pages error:', pagesData.error);
            return NextResponse.json({
                error: 'Failed to get pages',
                details: pagesData.error.message
            }, { status: 400 });
        }

        const pages = pagesData.data || [];
        if (pages.length === 0) {
            return NextResponse.json({
                error: 'No Facebook pages found',
                message: 'You need a Facebook page connected to an Instagram Business account'
            }, { status: 400 });
        }

        // Step 3: Find Instagram accounts
        let instagramAccount = null;
        let selectedPage = null;

        for (const page of pages) {
            try {
                const igResponse = await fetch(
                    `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account{id,username,name,profile_picture_url,followers_count}&access_token=${page.access_token}`
                );
                const igData = await igResponse.json();

                if (igData.instagram_business_account) {
                    instagramAccount = igData.instagram_business_account;
                    selectedPage = page;
                    console.log('Found Instagram account:', instagramAccount.username);
                    break;
                }
            } catch (error) {
                continue;
            }
        }

        if (!instagramAccount || !selectedPage) {
            return NextResponse.json({
                error: 'No Instagram Business accounts found',
                message: 'Connect an Instagram Business account to your Facebook page first'
            }, { status: 400 });
        }

        // Step 4: Save to database
        const savedAccount = await InstagramAccount.findOneAndUpdate(
            { instagramBusinessId: instagramAccount.id },
            {
                userId: decoded.id,
                companyId: user.companyId,
                instagramBusinessId: instagramAccount.id,
                instagramAccountId: instagramAccount.id,
                username: instagramAccount.username,
                name: instagramAccount.name,
                profilePictureUrl: instagramAccount.profile_picture_url,
                followersCount: instagramAccount.followers_count,
                accessToken: accessToken,
                pageId: selectedPage.id,
                pageName: selectedPage.name,
                pageAccessToken: selectedPage.access_token,
                connectedAt: new Date(),
                status: 'active'
            },
            { upsert: true, new: true }
        );

        // Step 5: Update user record
        await User.findByIdAndUpdate(decoded.id, {
            $push: {
                instagramAccounts: {
                    instagramBusinessId: instagramAccount.id,
                    username: instagramAccount.username,
                    name: instagramAccount.name,
                    profilePictureUrl: instagramAccount.profile_picture_url,
                    followersCount: instagramAccount.followers_count,
                    connectedAt: new Date(),
                    status: 'active'
                }
            }
        });

        console.log('Instagram account connected successfully');

        return NextResponse.json({
            success: true,
            account: {
                username: instagramAccount.username,
                name: instagramAccount.name,
                profilePictureUrl: instagramAccount.profile_picture_url,
                followersCount: instagramAccount.followers_count
            }
        });

    } catch (error) {
        console.error('Instagram OAuth error:', error);
        return NextResponse.json({
            error: 'Failed to connect Instagram account',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}