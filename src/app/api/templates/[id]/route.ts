import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import Template from '@/models/Template';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    const template = await Template.findOne({
      _id: params.id,
      userId: decoded.id
    }).lean();

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // If template has a WhatsApp template ID, fetch status from Interakt
    let updatedTemplate = template;
    if (template.whatsappTemplateId && template.wabaId) {
      try {
        const interaktResponse = await fetch(
          `https://amped-express.interakt.ai/api/v17.0/${template.wabaId}/message_templates/id/${template.whatsappTemplateId}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${process.env.INTERAKT_API_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (interaktResponse.ok) {
          const interaktData = await interaktResponse.json();

          // Map Interakt status to our database status
          const interaktStatus = interaktData.status?.toUpperCase();
          let mappedStatus = template.status;

          // Map Interakt statuses to our statuses
          switch (interaktStatus) {
            case 'APPROVED':
              mappedStatus = 'APPROVED';
              break;
            case 'PENDING':
              mappedStatus = 'PENDING';
              break;
            case 'REJECTED':
              mappedStatus = 'REJECTED';
              break;
            case 'DISABLED':
              mappedStatus = 'DISABLED';
              break;
            default:
              // Keep existing status if unknown
              break;
          }

          // Update database if status has changed
          if (mappedStatus !== template.status) {
            const updateData: any = {
              status: mappedStatus,
              updatedAt: new Date()
            };

            // Set approvedAt if status changed to APPROVED
            if (mappedStatus === 'APPROVED' && template.status !== 'APPROVED') {
              updateData.approvedAt = new Date();
            }

            // Set rejection reason if available
            if (mappedStatus === 'REJECTED' && interaktData.rejection_reason) {
              updateData.rejectionReason = interaktData.rejection_reason;
            }

            await Template.findByIdAndUpdate(template._id, updateData);

            // Update our template object with new status
            updatedTemplate = {
              ...template,
              ...updateData
            };

            console.log(`Template ${template._id} status updated from ${template.status} to ${mappedStatus}`);
          }
        } else {
          console.warn(`Failed to fetch template status from Interakt: ${interaktResponse.status}`);
          // Continue with existing data if Interakt API fails
        }
      } catch (interaktError) {
        console.error('Error fetching template status from Interakt:', interaktError);
        // Continue with existing data if Interakt API fails
      }
    }

    // Transform the template data
    const hasMediaHeader = updatedTemplate.components.some(c => c.type === 'HEADER' && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(c.format));

    return NextResponse.json({
      success: true,
      template: {
        id: updatedTemplate._id,
        name: updatedTemplate.name,
        category: updatedTemplate.category.toLowerCase(),
        language: updatedTemplate.language,
        status: updatedTemplate.status.toLowerCase(),
        content: updatedTemplate.components.find(c => c.type === 'BODY')?.text || '',
        variables: updatedTemplate.components
          .find(c => c.type === 'BODY')?.text
          ?.match(/\{\{(\d+)\}\}/g)?.length || 0,
        createdAt: updatedTemplate.createdAt,
        updatedAt: updatedTemplate.updatedAt,
        approvedAt: updatedTemplate.approvedAt,
        lastUsed: updatedTemplate.lastUsed,
        useCount: updatedTemplate.useCount || 0,
        rejectionReason: updatedTemplate.rejectionReason,
        type: hasMediaHeader ? 'media' : 'text',
        mediaType: hasMediaHeader ? updatedTemplate.components.find(c => c.type === 'HEADER')?.format : null,
        components: updatedTemplate.components,
        whatsappTemplateId: updatedTemplate.whatsappTemplateId,
        wabaId: updatedTemplate.wabaId
      }
    });

  } catch (error) {
    console.error('Template fetch error:', error);
    return NextResponse.json({
      error: 'Failed to fetch template'
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    const template = await Template.findOne({
      _id: params.id,
      userId: decoded.id
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // If template has a WhatsApp template ID, delete it from Interakt using the correct endpoint
    if (template.whatsappTemplateId && template.wabaId && template.name) {
      try {
        const deleteUrl = `https://amped-express.interakt.ai/api/v17.0/${template.wabaId}/message_templates?hsm_id=${template.whatsappTemplateId}&name=${encodeURIComponent(template.name)}`;

        const interaktResponse = await fetch(deleteUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${process.env.INTERAKT_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });

        if (!interaktResponse.ok) {
          console.warn(`Failed to delete template from Interakt: ${interaktResponse.status}`);
          // Continue with local deletion even if Interakt deletion fails
        }
      } catch (interaktError) {
        console.error('Error deleting template from Interakt:', interaktError);
        // Continue with local deletion even if Interakt deletion fails
      }
    }

    // Update status to DELETED instead of deleting from database
    await Template.findByIdAndUpdate(template._id, {
      status: 'DELETED',
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully'
    });

  } catch (error) {
    console.error('Template deletion error:', error);
    return NextResponse.json({
      error: 'Failed to delete template'
    }, { status: 500 });
  }
}
