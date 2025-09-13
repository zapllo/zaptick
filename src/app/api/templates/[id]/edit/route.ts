import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import Template from '@/models/Template';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }


    const decoded = verifyToken(token) as { id: string };
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const { components, category } = body;

    console.log('Received update request:', { components, category });

    await dbConnect();

    const template = await Template.findOne({
      _id: params.id,
      userId: decoded.id
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    if (!template.whatsappTemplateId || !template.wabaId) {
      return NextResponse.json({ error: 'Template not submitted to WhatsApp' }, { status: 400 });
    }

    console.log('Template details:', {
      wabaId: template.wabaId,
      whatsappTemplateId: template.whatsappTemplateId,
      templateName: template.name
    });

    // Check if we have the API token
    if (!process.env.INTERAKT_API_TOKEN) {
      console.error('INTERAKT_API_TOKEN not found in environment variables');
      return NextResponse.json({ error: 'API token not configured' }, { status: 500 });
    }

    try {
      // First, let's fetch the template from Interakt to see if it exists and get its current state
      const getTemplateUrl = `https://amped-express.interakt.ai/api/v17.0/${template.wabaId}/message_templates/id/${template.whatsappTemplateId}`;

      console.log('Fetching template from Interakt to verify it exists:', getTemplateUrl);

      const getResponse = await fetch(getTemplateUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.INTERAKT_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      const getResponseText = await getResponse.text();
      console.log('=== GET TEMPLATE RESPONSE ===');
      console.log('Status:', getResponse.status);
      console.log('Response Body:', getResponseText);
      console.log('=== END GET TEMPLATE RESPONSE ===');

      if (!getResponse.ok) {
        return NextResponse.json({
          error: `Template not found in Interakt (${getResponse.status}). The template may have been deleted from WhatsApp.`,
          details: getResponseText,
          suggestion: 'Try creating a new template instead of editing this one.'
        }, { status: 400 });
      }

      let currentTemplate;
      try {
        currentTemplate = JSON.parse(getResponseText);
        console.log('Current template from Interakt:', JSON.stringify(currentTemplate, null, 2));
      } catch {
        console.error('Failed to parse template response:', getResponseText);
        return NextResponse.json({
          error: 'Invalid response from Interakt when fetching template'
        }, { status: 500 });
      }

      // Now try to update the template
      if (components) {
        // Let's try the update with the exact format from Interakt docs
        const updatePayload = { components };
        const updateUrl = `https://amped-express.interakt.ai/api/v17.0/${template.wabaId}/message_templates/id/${template.whatsappTemplateId}`;

        console.log('Making update request to Interakt:');
        console.log('URL:', updateUrl);
        console.log('Method: POST');
        console.log('Payload:', JSON.stringify(updatePayload, null, 2));

        const interaktResponse = await fetch(updateUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.INTERAKT_API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatePayload)
        });

        const responseText = await interaktResponse.text();
        console.log('=== UPDATE TEMPLATE RESPONSE ===');
        console.log('Status:', interaktResponse.status);
        console.log('Status Text:', interaktResponse.statusText);
        console.log('Response Body:', responseText);
        console.log('=== END UPDATE TEMPLATE RESPONSE ===');

        if (!interaktResponse.ok) {
          let errorData;
          try {
            errorData = JSON.parse(responseText);
          } catch {
            errorData = { message: responseText || 'Unknown error' };
          }

          console.error('Update failed:', {
            status: interaktResponse.status,
            statusText: interaktResponse.statusText,
            errorData,
            currentTemplateStatus: currentTemplate?.status,
            currentTemplateCategory: currentTemplate?.category
          });

          // Check if it's because the template can't be edited
          if (interaktResponse.status === 400) {
            let errorMessage = 'Template cannot be updated. ';

            if (currentTemplate?.status === 'APPROVED') {
              errorMessage += 'Approved templates have editing restrictions. ';
            } else if (currentTemplate?.status === 'PENDING') {
              errorMessage += 'Template is pending approval and cannot be edited. ';
            } else if (currentTemplate?.status === 'REJECTED') {
              errorMessage += 'Rejected templates may need to be recreated instead of edited. ';
            }

            errorMessage += `Current status: ${currentTemplate?.status || 'Unknown'}`;

            return NextResponse.json({
              error: errorMessage,
              interaktError: errorData,
              templateStatus: currentTemplate?.status,
              suggestion: 'You may need to create a new template instead of editing this one.'
            }, { status: 400 });
          }

          return NextResponse.json({
            error: `Interakt API Error (${interaktResponse.status}): ${errorData.error?.message || errorData.message || responseText || 'Unknown error'}`,
            interaktError: errorData,
            templateStatus: currentTemplate?.status
          }, { status: 400 });
        }

        // Parse successful response
        let updateResult;
        try {
          updateResult = JSON.parse(responseText);
          console.log('Update successful:', updateResult);
        } catch {
          updateResult = responseText;
          console.log('Update successful (text response):', updateResult);
        }
      }

      // Handle category update separately if needed
      if (category && category !== template.category) {
        // Category updates might need a different endpoint or approach
        console.log('Category update requested, but skipping for now as component update was successful');
      }

      // Update local database
      const updateData: any = {
        updatedAt: new Date(),
        status: 'PENDING', // Reset to pending after edit
        rejectionReason: undefined // Clear any previous rejection reason
      };

      if (components) {
        updateData.components = components;
      }

      if (category) {
        updateData.category = category;
      }

      console.log('Updating local database with:', updateData);

      const updatedTemplate = await Template.findByIdAndUpdate(
        template._id,
        updateData,
        { new: true }
      );

      console.log('Database update successful');

      return NextResponse.json({
        success: true,
        message: 'Template updated successfully and resubmitted for approval',
        template: updatedTemplate
      });

    } catch (interaktError: any) {
      console.error('Interakt API network error:', interaktError);
      return NextResponse.json({
        error: `Network error calling Interakt API: ${interaktError.message || 'Connection failed'}`,
        details: {
          message: interaktError.message,
          code: interaktError.code,
          cause: interaktError.cause
        }
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Template update error:', error);
    return NextResponse.json({
      error: `Server error: ${error.message || 'Unknown error'}`,
      stack: error.stack
    }, { status: 500 });
  }
}
