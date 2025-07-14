import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Company from '@/models/Company';

const INT_TOKEN = process.env.INTERAKT_API_TOKEN;
const phoneNumberId = process.env.PHONE_NUMBER_ID;

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

        // Add fields that are provided (excluding profile picture for now)
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

        console.log('Updating WhatsApp Business Profile:', {
            wabaId: wabaAccount.wabaId,
            phoneNumberId: wabaAccount.phoneNumberId,
            payload: updatePayload
        });

        // Update business profile (without profile picture first)
        const profileResponse = await fetch(
            `https://amped-express.interakt.ai/api/v17.0/${phoneNumberId}/whatsapp_business_profile`,
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

        if (!profileResponse.ok) {
            const errorData = await profileResponse.text();
            console.error('WhatsApp Business Profile update error:', errorData);
            throw new Error(`Failed to update business profile: ${errorData}`);
        }

        console.log('WhatsApp Business Profile updated successfully');

        // Update profile picture separately if provided
        if (profileData.profilePictureHandle) {
            await updateProfilePictureDirectly(wabaAccount, profileData.profilePictureHandle);
        }

    } catch (error) {
        console.error('Error updating WhatsApp Business Profile:', error);
        throw error;
    }
}

// Helper function to update profile picture directly
async function updateProfilePictureDirectly(wabaAccount: any, mediaHandle: string) {
    try {
        console.log('Updating profile picture directly:', {
            wabaId: wabaAccount.wabaId,
            phoneNumberId: wabaAccount.phoneNumberId,
            mediaHandle: mediaHandle
        });

        // Update profile picture in a separate request
        const picturePayload = {
            messaging_product: 'whatsapp',
            profile_picture_handle: mediaHandle
        };

        const pictureResponse = await fetch(
            `https://amped-express.interakt.ai/api/v17.0/${phoneNumberId}/whatsapp_business_profile`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': INT_TOKEN!,
                    'x-waba-id': wabaAccount.wabaId,
                },
                body: JSON.stringify(picturePayload)
            }
        );

        const responseText = await pictureResponse.text();
        console.log('Profile picture update response:', {
            status: pictureResponse.status,
            statusText: pictureResponse.statusText,
            response: responseText
        });

        if (!pictureResponse.ok) {
            console.error('Profile picture update error:', responseText);
            throw new Error(`Failed to update profile picture: ${responseText}`);
        }

        console.log('Profile picture updated successfully');
        return { success: true, mediaHandle };

    } catch (error) {
        console.error('Error updating profile picture:', error);
        throw error;
    }
}