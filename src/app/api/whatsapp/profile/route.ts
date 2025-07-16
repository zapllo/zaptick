import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Company from '@/models/Company';

const INT_TOKEN = process.env.INTERAKT_API_TOKEN;

export async function GET(req: NextRequest) {
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

        const company = await Company.findById(user.companyId);
        if (!company) {
            return NextResponse.json({ error: 'Company not found' }, { status: 404 });
        }

        // Get WhatsApp profile data from company
        const profileData = {
            about: company.whatsappProfile?.about || '',
            profilePictureUrl: company.whatsappProfile?.profilePictureUrl || '',
            profilePictureHandle: company.whatsappProfile?.profilePictureHandle || '',
            email: company.whatsappProfile?.email || '',
            website: company.whatsappProfile?.website || '',
            address: company.whatsappProfile?.address || '',
            businessCategory: company.whatsappProfile?.businessCategory || '',
            businessDescription: company.whatsappProfile?.businessDescription || '',
            lastUpdated: company.whatsappProfile?.lastUpdated,
            // Include user's WABA accounts directly
            wabaAccounts: user.wabaAccounts || []
        };

        return NextResponse.json({
            success: true,
            profile: profileData
        });

    } catch (error) {
        console.error('Error fetching WhatsApp profile:', error);
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}

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

        const company = await Company.findById(user.companyId);
        if (!company) {
            return NextResponse.json({ error: 'Company not found' }, { status: 404 });
        }

        const {
            about,
            profilePictureHandle,
            email,
            website,
            address,
            businessCategory,
            businessDescription
        } = await req.json();

        console.log('Profile update request:', {
            about: about ? 'Present' : 'Missing',
            profilePictureHandle: profilePictureHandle || 'Missing',
            userWabaAccounts: user.wabaAccounts?.map((acc: any) => acc.wabaId) || []
        });

        // Update company WhatsApp profile
        company.whatsappProfile = {
            ...company.whatsappProfile,
            about: about || company.whatsappProfile?.about,
            profilePictureHandle: profilePictureHandle || company.whatsappProfile?.profilePictureHandle,
            email: email || company.whatsappProfile?.email,
            website: website || company.whatsappProfile?.website,
            address: address || company.whatsappProfile?.address,
            businessCategory: businessCategory || company.whatsappProfile?.businessCategory,
            businessDescription: businessDescription || company.whatsappProfile?.businessDescription,
            lastUpdated: new Date()
        };

        await company.save();

        // Get all user's WABA accounts
        const wabaAccounts: any[] = user.wabaAccounts || [];

        if (wabaAccounts.length === 0) {
            return NextResponse.json({
                error: 'No WhatsApp Business accounts found. Please connect a WhatsApp Business account first.'
            }, { status: 400 });
        }

        console.log('Updating all WABA accounts:', wabaAccounts.map((acc: any) => acc.wabaId));

        // Update WhatsApp Business Profile for all user's accounts
        const updatePromises = wabaAccounts.map(async (wabaAccount: any) => {
            try {
                await updateWhatsAppBusinessProfile(wabaAccount, {
                    about,
                    profilePictureHandle,
                    email,
                    website,
                    address,
                    businessCategory,
                    businessDescription
                });
                return { wabaId: wabaAccount.wabaId, success: true };
            } catch (error) {
                console.error(`Failed to update WABA ${wabaAccount.wabaId}:`, error);
                return {
                    wabaId: wabaAccount.wabaId,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }
        });

        const results = await Promise.allSettled(updatePromises);
        const updateResults = results.map((result, index) => {
            if (result.status === 'fulfilled') {
                return result.value;
            } else {
                return {
                    wabaId: wabaAccounts[index].wabaId,
                    success: false,
                    error: result.reason instanceof Error ? result.reason.message : 'Unknown error'
                };
            }
        });

        const successCount = updateResults.filter(r => r.success).length;
        const failureCount = updateResults.filter(r => !r.success).length;

        if (successCount > 0) {
            return NextResponse.json({
                success: true,
                message: `WhatsApp profile updated successfully for ${successCount} of ${wabaAccounts.length} account(s)`,
                results: updateResults,
                summary: {
                    total: wabaAccounts.length,
                    successful: successCount,
                    failed: failureCount
                }
            });
        } else {
            return NextResponse.json({
                success: false,
                message: 'Failed to update WhatsApp profile for all accounts',
                results: updateResults,
                summary: {
                    total: wabaAccounts.length,
                    successful: successCount,
                    failed: failureCount
                }
            }, { status: 500 });
        }

    } catch (error) {
        console.error('Error updating WhatsApp profile:', error);
        return NextResponse.json({
            error: 'Failed to update profile',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// Helper function to update WhatsApp Business Profile
async function updateWhatsAppBusinessProfile(wabaAccount: any, profileData: any) {
    if (!INT_TOKEN) {
        throw new Error('Interakt API token not configured');
    }

    try {
        // Prepare the profile update payload
        const updatePayload: any = {
            messaging_product: 'whatsapp'
        };

        // Add fields that are provided
        if (profileData.about) {
            updatePayload.about = profileData.about;
        }

        if (profileData.email) {
            updatePayload.email = profileData.email;
        }

        if (profileData.website) {
            updatePayload.websites = [profileData.website];
        }

        if (profileData.address) {
            updatePayload.address = profileData.address;
        }

        if (profileData.businessDescription) {
            updatePayload.description = profileData.businessDescription;
        }

        if (profileData.businessCategory) {
            updatePayload.vertical = profileData.businessCategory;
        }

      // Add profile picture handle if provided - ensure it's a valid media handle
        if (profileData.profilePictureHandle) {
            // Media handles from the media_handle endpoint should start with a pattern like "2:c2FtcGxl..."
            updatePayload.profile_picture_handle = profileData.profilePictureHandle;
        }

        console.log('Updating WhatsApp Business Profile:', {
            wabaId: wabaAccount.wabaId,
            phoneNumberId: wabaAccount.phoneNumberId,
            payload: updatePayload
        });

        // Update business profile with all fields including profile picture
        const profileResponse = await fetch(
            `https://amped-express.interakt.ai/api/v17.0/${wabaAccount.phoneNumberId}/whatsapp_business_profile`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': INT_TOKEN,
                    'x-waba-id': wabaAccount.wabaId,
                },
                body: JSON.stringify(updatePayload)
            }
        );

        const responseText = await profileResponse.text();
        console.log('WhatsApp Business Profile update response:', {
            status: profileResponse.status,
            statusText: profileResponse.statusText,
            response: responseText
        });

        if (!profileResponse.ok) {
            console.error('WhatsApp Business Profile update error:', responseText);
            throw new Error(`Failed to update business profile: ${responseText}`);
        }

        console.log('WhatsApp Business Profile updated successfully');

    } catch (error) {
        console.error('Error updating WhatsApp Business Profile:', error);
        throw error;
    }
}