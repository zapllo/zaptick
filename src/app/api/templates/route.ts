import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Template from '@/models/Template';
import { sendTemplateCreationNotification } from '@/lib/notifications';

const INT_TOKEN = process.env.INTERAKT_API_TOKEN;

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: string };
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const {
      name,
      category,
      language,
      wabaId,
      components,
      authSettings
    } = body;

    // Validate required fields
    if (!name || !category || !language || !wabaId) {
      return NextResponse.json({
        error: 'Missing required fields: name, category, language, wabaId'
      }, { status: 400 });
    }

    // Find the WABA account
    const wabaAccount = user.wabaAccounts.find((account: any) => account.wabaId === wabaId);
    if (!wabaAccount) {
      return NextResponse.json({ error: 'WABA account not found' }, { status: 404 });
    }

    // Prepare payload based on template type
    let interaktPayload: any = {
      name: name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      category: category.toUpperCase(),
      allow_category_change: true,
      language: language
    };

    // For authentication templates, create a default component set
    if (category === 'AUTHENTICATION') {
      // Add authentication specific fields
      if (authSettings) {
        if (authSettings.codeExpirationMinutes) {
          interaktPayload.code_expiration_minutes = authSettings.codeExpirationMinutes;
        }
        if (authSettings.codeLength) {
          interaktPayload.code_length = authSettings.codeLength;
        }
      }

      // Create minimal required components for authentication template
      interaktPayload.components = [
        {
          type: 'BODY',
          text: 'Your verification code is: {{1}}'
        }
      ];

      // Add button component if code entry option is enabled
      if (authSettings && authSettings.addCodeEntryOption) {
        interaktPayload.components.push({
          type: 'BUTTONS',
          buttons: [
            {
              type: 'COPY_CODE',
              text: 'Enter code',
              copy_code: '{{1}}'
            }
          ]
        });
      }
    } else // For carousel templates - match the exact working example structure
      if (category === 'CAROUSEL' || category === 'CAROUSEL_UTILITY') {
        // Use appropriate category based on selection
        if (category === 'CAROUSEL') {
          interaktPayload.category = 'MARKETING';
        } else if (category === 'CAROUSEL_UTILITY') {
          interaktPayload.category = 'UTILITY';
        }

        if (!components || !Array.isArray(components) || components.length === 0) {
          return NextResponse.json({
            error: 'Components must be a non-empty array for carousel templates'
          }, { status: 400 });
        }

        const finalComponents = [];

        components.forEach(component => {
          if (component.type === 'BODY') {
            finalComponents.push({
              type: 'BODY',
              text: component.text,
              ...(component.example && { example: component.example })
            });
          } else if (component.type === 'CAROUSEL') {
            // Build carousel with exact structure from working example
            const carouselComponent = {
              type: 'CAROUSEL',
              cards: []
            };

            // Process each card to match exactly
            component.cards.forEach((card: any, cardIndex: number) => {
              const cardData = {
                components: []
              };

              // Add header component if present
              if (card.header && card.header.example && card.header.example.header_handle) {
                cardData.components.push({
                  type: 'HEADER',
                  format: card.header.format,
                  example: {
                    header_handle: card.header.example.header_handle
                  }
                });
              }

              // Add body component - only add what's actually provided
              const bodyComponent: any = {
                type: 'BODY',
                text: card.body.text
              };

              // Only add examples if there are actual variables in the text
              const variableMatches = card.body.text.match(/\{\{(\d+)\}\}/g);
              if (variableMatches && variableMatches.length > 0) {
                // Use the parent body examples if they exist
                const parentBodyComponent = components.find(c => c.type === 'BODY');
                if (parentBodyComponent && parentBodyComponent.example && parentBodyComponent.example.body_text) {
                  bodyComponent.example = {
                    body_text: parentBodyComponent.example.body_text
                  };
                }
                // If no parent examples but variables exist, we might need examples
                // But only add if we have actual example data from the UI
              }
              // Don't add default variables or examples if none exist

              cardData.components.push(bodyComponent);

              // Add buttons - Only if buttons are actually provided by the user
              if (card.buttons && card.buttons.length > 0) {
                const buttonsComponent = {
                  type: 'BUTTONS',
                  buttons: card.buttons.map((button: any) => {
                    if (button.type === 'URL') {
                      return {
                        type: 'URL',
                        text: button.text,
                        url: button.url
                      };
                    } else {
                      return {
                        type: 'QUICK_REPLY',
                        text: button.text
                      };
                    }
                  })
                };
                cardData.components.push(buttonsComponent);
              }

              carouselComponent.cards.push(cardData);
            });

            finalComponents.push(carouselComponent);
          } else if (component.type === 'FOOTER') {
            // Only add footer if text is provided
            if (component.text) {
              finalComponents.push({
                type: 'FOOTER',
                text: component.text
              });
            }
          } else {
            // For other component types, add them as-is but clean up empty fields
            const cleanComponent = { ...component };

            // Remove empty or undefined fields
            Object.keys(cleanComponent).forEach(key => {
              if (cleanComponent[key] === undefined || cleanComponent[key] === null || cleanComponent[key] === '') {
                delete cleanComponent[key];
              }
            });

            finalComponents.push(cleanComponent);
          }
        });

        interaktPayload.components = finalComponents;
      } else {
        // For other templates, include components
        if (!components || !Array.isArray(components) || components.length === 0) {
          return NextResponse.json({
            error: 'Components must be a non-empty array for non-authentication templates'
          }, { status: 400 });
        }

        interaktPayload.components = components.map(component => {
          // Handle media header components
          if (component.type === 'HEADER' && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(component.format)) {
            return {
              type: 'HEADER',
              format: component.format,
              example: {
                header_handle: [component.mediaHandle || component.example?.header_handle?.[0]]
              }
            };
          }
          return component;
        });
      }

    console.log('Sending payload to Interakt:', JSON.stringify(interaktPayload, null, 2));
    console.log('Using WABA ID:', wabaId);

    // Call Interakt API
    const interaktResponse = await fetch(
      `https://amped-express.interakt.ai/api/v17.0/${wabaId}/message_templates`,
      {
        method: 'POST',
        headers: {
          'x-access-token': INT_TOKEN || '',
          'x-waba-id': String(wabaId),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(interaktPayload)
      }
    );

    console.log('Interakt response status:', interaktResponse.status);
    console.log('Interakt response headers:', Object.fromEntries(interaktResponse.headers.entries()));

    // Get response text first to handle both JSON and non-JSON responses
    const responseText = await interaktResponse.text();
    console.log('Interakt response text:', responseText);

    let interaktData;
    try {
      interaktData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Interakt response as JSON:', parseError);
      return NextResponse.json({
        error: 'Invalid response from WhatsApp API',
        details: responseText,
        status: interaktResponse.status
      }, { status: 400 });
    }

    if (!interaktResponse.ok) {
      console.error('Interakt API error:', interaktData);
      return NextResponse.json({
        error: 'Failed to create template in WhatsApp',
        details: interaktData,
        status: interaktResponse.status
      }, { status: 400 });
    }

    // Prepare the template object for database
    const templateData: any = {
      name: interaktPayload.name,
      category: interaktPayload.category,
      language: interaktPayload.language,
      components: interaktPayload.components, // Always include components now
      wabaId,
      phoneNumberId: wabaAccount.phoneNumberId,
      userId: decoded.id,
      whatsappTemplateId: interaktData.id,
      status: 'PENDING'
    };

    // Add auth settings for authentication templates
    if (category === 'AUTHENTICATION' && authSettings) {
      templateData.authSettings = {
        codeExpirationMinutes: authSettings.codeExpirationMinutes || 10,
        codeLength: authSettings.codeLength || 6,
        addCodeEntryOption: authSettings.addCodeEntryOption !== false
      };
    }

    // Save template to database
    const template = new Template(templateData);
    await template.save();

    // Update template count
    wabaAccount.templateCount = (wabaAccount.templateCount || 0) + 1;
    await user.save();

    // Send email notifications (async, don't wait for it)
    sendTemplateCreationNotification(decoded.id, {
      name: template.name,
      category: template.category,
      language: template.language,
      status: template.status,
      wabaId: template.wabaId
    }).catch(error => {
      console.error('Email notification failed:', error);
    });

    return NextResponse.json({
      success: true,
      template: {
        id: template._id,
        name: template.name,
        category: template.category,
        language: template.language,
        status: template.status,
        whatsappTemplateId: template.whatsappTemplateId,
        createdAt: template.createdAt,
        components: template.components,
        authSettings: template.authSettings
      }
    });

  } catch (error) {
    console.error('Template creation error:', error);
    return NextResponse.json({
      error: 'Failed to create template',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: string };
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const wabaId = searchParams.get('wabaId');
    const includeDeleted = searchParams.get('includeDeleted') === 'true';

    // Build query
    const query: any = { userId: decoded.id };
    if (category && category !== 'All') query.category = category.toUpperCase();
    if (wabaId) query.wabaId = wabaId;

    // By default, don't include deleted templates unless specifically requested
    if (!includeDeleted) {
      query.status = { $ne: 'DELETED' };
    }

    // Get templates from database
    const templates = await Template.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // If wabaId is provided, sync with Interakt
    let updatedTemplates = templates;
    if (wabaId) {
      try {
        // Fetch templates from Interakt
        const interaktResponse = await fetch(
          `https://amped-express.interakt.ai/api/v17.0/${wabaId}/message_templates?fields=id,name,status,category,language,quality_score,rejection_reason`,
          {
            method: 'GET',
            headers: {
              'x-access-token': INT_TOKEN || '',
              'x-waba-id': String(wabaId),
              'Content-Type': 'application/json'
            }
          }
        );

        if (interaktResponse.ok) {
          const responseText = await interaktResponse.text();
          let interaktData;

          try {
            interaktData = JSON.parse(responseText);
            const whatsappTemplates = interaktData.data || [];

            // Create a map of WhatsApp template IDs to their statuses
            const whatsappTemplateMap = new Map();
            whatsappTemplates.forEach((wTemplate: any) => {
              whatsappTemplateMap.set(wTemplate.id, {
                status: wTemplate.status.toUpperCase(),
                rejectionReason: wTemplate.rejection_reason
              });
            });

            // Update templates that have different statuses
            const templatesToUpdate = [];
            for (const template of templates) {
              if (template.whatsappTemplateId && whatsappTemplateMap.has(template.whatsappTemplateId)) {
                const whatsappTemplate = whatsappTemplateMap.get(template.whatsappTemplateId);
                const newStatus = whatsappTemplate.status;

                if (template.status !== newStatus) {
                  const updateData: any = {
                    status: newStatus,
                    updatedAt: new Date()
                  };

                  // Set approvedAt if status changed to APPROVED
                  if (newStatus === 'APPROVED' && template.status !== 'APPROVED') {
                    updateData.approvedAt = new Date();
                  }

                  // Set rejection reason if available
                  if (newStatus === 'REJECTED' && whatsappTemplate.rejectionReason) {
                    updateData.rejectionReason = whatsappTemplate.rejectionReason;
                  }

                  templatesToUpdate.push({
                    id: template._id,
                    updateData
                  });

                  console.log(`Template ${template._id} status will be updated from ${template.status} to ${newStatus}`);
                }
              }
            }
            console.log(templatesToUpdate, 'templates to update after Interakt sync');

            // Perform bulk updates if needed
            if (templatesToUpdate.length > 0) {
              for (const { id, updateData } of templatesToUpdate) {
                await Template.findByIdAndUpdate(id, updateData);
              }

              // Refetch templates with updated data
              updatedTemplates = await Template.find(query)
                .sort({ createdAt: -1 })
                .lean();

              console.log(`Updated ${templatesToUpdate.length} templates with new statuses`);
            }

          } catch (parseError) {
            console.error('Failed to parse Interakt response:', parseError);
            // Continue with database templates if Interakt sync fails
          }
        } else {
          console.warn(`Failed to fetch templates from Interakt: ${interaktResponse.status}`);
          // Continue with database templates if Interakt API fails
        }
      } catch (interaktError) {
        console.error('Error syncing with Interakt:', interaktError);
        // Continue with database templates if Interakt API fails
      }
    }

    // Apply status filter after potential updates
    let filteredTemplates = updatedTemplates;
    if (status && status !== 'All' && status !== 'ANY') {
      filteredTemplates = updatedTemplates.filter(template =>
        template.status === status.toUpperCase()
      );
    }
    console.log(`Found ${filteredTemplates.length} templates after filtering`);

    return NextResponse.json({
      success: true,
      templates: filteredTemplates.map(template => {
        const hasMediaHeader = template.components.some((c: any) => c.type === 'HEADER' && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(c.format));
        const isCarousel = template.category === 'CAROUSEL';

        return {
          id: template._id,
          name: template.name,
          category: template.category.toLowerCase(),
          language: template.language,
          status: template.status.toLowerCase(),
          content: isCarousel
            ? `${template.components.find((c: any) => c.type === 'CAROUSEL')?.cards?.length || 0} cards`
            : template.components.find((c: any) => c.type === 'BODY')?.text || '',
          variables: isCarousel
            ? 0
            : template.components.find((c: any) => c.type === 'BODY')?.text?.match(/\{\{(\d+)\}\}/g)?.length || 0,
          createdAt: template.createdAt,
          updatedAt: template.updatedAt,
          approvedAt: template.approvedAt,
          lastUsed: template.lastUsed,
          useCount: template.useCount,
          rejectionReason: template.rejectionReason,
          type: isCarousel ? 'carousel' : hasMediaHeader ? 'media' : 'text',
          mediaType: hasMediaHeader ? template.components.find((c: any) => c.type === 'HEADER')?.format : null,
          createdBy: template.createdBy || "Unknown",
          components: template.components
        };
      })
    });

  } catch (error) {
    console.error('Templates fetch error:', error);
    return NextResponse.json({
      error: 'Failed to fetch templates'
    }, { status: 500 });
  }
}