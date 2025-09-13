import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import Chatbot from '@/models/Chatbot';
import User from '@/models/User';
import { KnowledgeBaseService } from '@/lib/knowledge-base';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const chatbot = await Chatbot.findOne({
      _id: params.id,
      userId: decoded.id
    });

    if (!chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    }

    // Get knowledge base statistics
    const stats = KnowledgeBaseService.getDocumentStats(chatbot.knowledgeBase?.documents || []);

    return NextResponse.json({
      success: true,
      knowledgeBase: chatbot.knowledgeBase,
      stats
    });

  } catch (error) {
    console.error('Error fetching knowledge base:', error);
    return NextResponse.json({
      error: 'Failed to fetch knowledge base'
    }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const chatbot = await Chatbot.findOne({
      _id: params.id,
      userId: decoded.id
    });

    if (!chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    }

    // Verify user has access and check subscription limits
    const user = await User.findById(decoded.id).populate('companyId');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const company = user.companyId as any;
    if (company?.subscriptionStatus !== 'active') {
      return NextResponse.json({
        error: 'Active subscription required for knowledge base features',
        code: 'SUBSCRIPTION_REQUIRED'
      }, { status: 403 });
    }

    // Parse form data
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Initialize knowledge base if not exists
    if (!chatbot.knowledgeBase) {
      chatbot.knowledgeBase = {
        enabled: false,
        documents: [],
        settings: {
          maxDocuments: 10,
          maxFileSize: 10,
          allowedFileTypes: ['pdf', 'txt', 'doc', 'docx', 'csv', 'json', 'md'],
          chunkSize: 1000,
          chunkOverlap: 200,
          searchMode: 'semantic',
          maxRelevantChunks: 3
        }
      };
    }

    const settings = chatbot.knowledgeBase.settings;
    const currentDocuments = chatbot.knowledgeBase.documents?.length || 0;
    const results = [];
    const errors = [];

    // Process each file
    for (const file of files) {
      try {
        // Check document limit
        if (currentDocuments + results.length >= settings.maxDocuments) {
          errors.push({
            filename: file.name,
            error: `Document limit reached. Maximum ${settings.maxDocuments} documents allowed.`
          });
          continue;
        }

        // Validate file
        const validation = KnowledgeBaseService.validateFile(file, settings);
        if (!validation.valid) {
          errors.push({
            filename: file.name,
            error: validation.error
          });
          continue;
        }

        // Check for duplicate filename
        const existingDoc = chatbot.knowledgeBase.documents?.find(
          doc => doc.originalName === file.name
        );
        if (existingDoc) {
          errors.push({
            filename: file.name,
            error: 'File with this name already exists'
          });
          continue;
        }

        // Convert file to buffer
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

        console.log(`📄 Processing file: ${file.name} (${fileExtension}, ${file.size} bytes)`);

        // Process document
        const processedDoc = await KnowledgeBaseService.processDocument(
          fileBuffer,
          file.name,
          fileExtension,
          file.size,
          settings
        );

        if (processedDoc.status === 'failed') {
          errors.push({
            filename: file.name,
            error: processedDoc.errorMessage || 'Processing failed'
          });
          continue;
        }

        // In the POST method, update the results.push section:
        results.push({
          ...processedDoc,
          status: 'processed',
          processedAt: new Date(),
          // 🔥 ENSURE processedChunks are saved to database
          processedChunks: processedDoc.processedChunks || [], // Save the actual chunks
          textPreview: processedDoc.textPreview,
          processingStats: processedDoc.processingStats
        });

        console.log(`✅ Successfully processed: ${file.name}`);

      } catch (fileError) {
        console.error(`❌ Error processing file ${file.name}:`, fileError);
        errors.push({
          filename: file.name,
          error: fileError instanceof Error ? fileError.message : 'Unknown processing error'
        });
      }
    }

    // Update chatbot with new documents
    if (results.length > 0) {
      await Chatbot.findByIdAndUpdate(
        params.id,
        {
          $push: {
            'knowledgeBase.documents': { $each: results }
          },
          $set: {
            'knowledgeBase.enabled': true
          }
        }
      );
    }

    // Get updated chatbot data
    const updatedChatbot = await Chatbot.findById(params.id);
    const stats = KnowledgeBaseService.getDocumentStats(updatedChatbot?.knowledgeBase?.documents || []);

    return NextResponse.json({
      success: true,
      processed: results.length,
      errors: errors.length,
      results,
      errors,
      knowledgeBase: updatedChatbot?.knowledgeBase,
      stats
    });

  } catch (error) {
    console.error('Error uploading documents:', error);
    return NextResponse.json({
      error: 'Failed to upload documents'
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

    const decoded = verifyToken(token) as { id: string };
    if (!decoded?.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }

    await dbConnect();

    const updatedChatbot = await Chatbot.findOneAndUpdate(
      {
        _id: params.id,
        userId: decoded.id
      },
      {
        $pull: {
          'knowledgeBase.documents': { id: documentId }
        }
      },
      { new: true }
    );

    if (!updatedChatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    }

    // If no documents left, disable knowledge base
    if (!updatedChatbot.knowledgeBase?.documents?.length) {
      await Chatbot.findByIdAndUpdate(params.id, {
        $set: {
          'knowledgeBase.enabled': false
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({
      error: 'Failed to delete document'
    }, { status: 500 });
  }
}

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
    if (!decoded?.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    const { enabled, settings } = await req.json();

    const updatedChatbot = await Chatbot.findOneAndUpdate(
      {
        _id: params.id,
        userId: decoded.id
      },
      {
        $set: {
          'knowledgeBase.enabled': enabled,
          ...(settings && { 'knowledgeBase.settings': settings })
        }
      },
      { new: true }
    );

    if (!updatedChatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      knowledgeBase: updatedChatbot.knowledgeBase
    });

  } catch (error) {
    console.error('Error updating knowledge base settings:', error);
    return NextResponse.json({
      error: 'Failed to update knowledge base settings'
    }, { status: 500 });
  }
}