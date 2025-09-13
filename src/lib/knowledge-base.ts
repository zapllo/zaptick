import { v4 as uuidv4 } from 'uuid';
import { uploadToS3 } from './s3';

// Document processing utilities
export class KnowledgeBaseService {
  
  // Extract text from different file types with fallback approach
  static async extractTextFromFile(file: Buffer, fileType: string, filename: string): Promise<string> {
    try {
      console.log(`📄 Extracting text from ${fileType.toLowerCase()} file: ${filename}`);
      
      switch (fileType.toLowerCase()) {
        case 'txt':
          const textContent = file.toString('utf-8');
          console.log(`✅ Extracted ${textContent.length} characters from TXT file`);
          return textContent;
        
        case 'pdf':
          try {
            // Try dynamic import first
            if (typeof window === 'undefined') {
              const pdfParse = (await import('pdf-parse')).default;
              const pdfData = await pdfParse(file);
              const extractedText = pdfData.text;
              console.log(`✅ Extracted ${extractedText.length} characters from PDF (${pdfData.numpages} pages)`);
              return extractedText;
            } else {
              throw new Error('PDF processing not available in browser');
            }
          } catch (pdfError) {
            console.error('PDF parsing error:', pdfError);
            throw new Error(`PDF processing failed. Please try converting to TXT format first.`);
          }
        
        case 'doc':
        case 'docx':
          try {
            // Try dynamic import first
            if (typeof window === 'undefined') {
              const mammoth = (await import('mammoth')).default;
              const result = await mammoth.extractRawText({ buffer: file });
              const docText = result.value;
              
              if (result.messages.length > 0) {
                console.warn('Word document parsing warnings:', result.messages);
              }
              
              console.log(`✅ Extracted ${docText.length} characters from ${fileType.toUpperCase()} file`);
              return docText;
            } else {
              throw new Error('Word document processing not available in browser');
            }
          } catch (docError) {
            console.error('Word document parsing error:', docError);
            throw new Error(`${fileType.toUpperCase()} processing failed. Please try converting to TXT format first.`);
          }
        
        case 'csv':
          try {
            const csvText = this.extractTextFromCSVSimple(file);
            console.log(`✅ Extracted ${csvText.length} characters from CSV file`);
            return csvText;
          } catch (csvError) {
            console.error('CSV parsing error:', csvError);
            throw new Error(`Failed to parse CSV: ${csvError instanceof Error ? csvError.message : 'Unknown error'}`);
          }

        case 'json':
          try {
            const jsonContent = JSON.parse(file.toString('utf-8'));
            const jsonText = this.extractTextFromJSON(jsonContent);
            console.log(`✅ Extracted ${jsonText.length} characters from JSON file`);
            return jsonText;
          } catch (jsonError) {
            console.error('JSON parsing error:', jsonError);
            throw new Error(`Failed to parse JSON: Invalid JSON format`);
          }

        case 'md':
        case 'markdown':
          const markdownContent = file.toString('utf-8');
          // Remove markdown formatting for better text extraction
          const cleanMarkdown = markdownContent
            .replace(/^#{1,6}\s+/gm, '') // Remove headers
            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
            .replace(/\*(.*?)\*/g, '$1') // Remove italic
            .replace(/`(.*?)`/g, '$1') // Remove inline code
            .replace(/```[\s\S]*?```/g, '') // Remove code blocks
            .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Remove links, keep text
            .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1'); // Remove images, keep alt text
          
          console.log(`✅ Extracted ${cleanMarkdown.length} characters from Markdown file`);
          return cleanMarkdown;
        
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }
    } catch (error) {
      console.error('Error extracting text from file:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to extract text from ${fileType} file`);
    }
  }

  // Simple CSV parsing without external dependencies
  private static extractTextFromCSVSimple(buffer: Buffer): string {
    const csvContent = buffer.toString('utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }
    
    // Parse headers
    const headers = this.parseCSVLine(lines[0]);
    let csvText = `CSV Data with Headers: ${headers.join(', ')}\n\n`;
    
    // Parse data rows
    lines.slice(1).forEach((line, index) => {
      const values = this.parseCSVLine(line);
      if (values.length > 0) {
        csvText += `Row ${index + 1}:\n`;
        headers.forEach((header, i) => {
          if (values[i] && values[i].trim()) {
            csvText += `${header}: ${values[i].trim()}\n`;
          }
        });
        csvText += '\n';
      }
    });
    
    return csvText;
  }

  // Simple CSV line parser
  private static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result.map(item => item.replace(/^"(.*)"$/, '$1')); // Remove surrounding quotes
  }

  // Helper method to extract text from JSON
  private static extractTextFromJSON(obj: any, prefix: string = ''): string {
    let text = '';
    
    if (typeof obj === 'string') {
      return obj + ' ';
    }
    
    if (typeof obj === 'number' || typeof obj === 'boolean') {
      return obj.toString() + ' ';
    }
    
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        text += this.extractTextFromJSON(item, `${prefix}[${index}]`);
      });
      return text;
    }
    
    if (typeof obj === 'object' && obj !== null) {
      Object.entries(obj).forEach(([key, value]) => {
        const newPrefix = prefix ? `${prefix}.${key}` : key;
        text += `${key}: `;
        text += this.extractTextFromJSON(value, newPrefix);
        text += '\n';
      });
    }
    
    return text;
  }

  // Enhanced text chunking with better sentence boundary detection
  static chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
    const chunks: string[] = [];
    
    // Clean and normalize text
    const cleanText = text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single newline
      .trim();
    
    if (cleanText.length === 0) {
      return [];
    }
    
    // Split into sentences with better regex
    const sentences = cleanText.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
    
    if (sentences.length === 0) {
      return cleanText.length > 50 ? [cleanText] : [];
    }
    
    let currentChunk = '';
    let currentLength = 0;
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      const sentenceLength = sentence.length;
      
      // If adding this sentence would exceed chunk size and we have content
      if (currentLength + sentenceLength > chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        
        // Create overlap by keeping the last few sentences
        const overlapSentences = currentChunk.split(/(?<=[.!?])\s+/).slice(-Math.ceil(overlap / 100));
        currentChunk = overlapSentences.join(' ') + ' ' + sentence;
        currentLength = currentChunk.length;
      } else {
        currentChunk += (currentChunk.length > 0 ? ' ' : '') + sentence;
        currentLength = currentChunk.length;
      }
    }
    
    // Add the last chunk if it has content
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }
    
    // Filter out very small chunks and return
    return chunks.filter(chunk => chunk.length > 50);
  }

  // Enhanced document processing with better error handling
  static async processDocument(
    fileBuffer: Buffer,
    filename: string,
    fileType: string,
    fileSize: number,
    settings: any
  ) {
    const documentId = uuidv4();
    let textContent = '';
    let chunks: string[] = [];
    
    try {
      console.log(`🚀 Processing document: ${filename} (${fileType}, ${fileSize} bytes)`);
      
      // Upload original file to S3 first
      const s3Url = await uploadToS3(
        fileBuffer,
        this.getMimeType(fileType),
        'knowledge-base',
        `${documentId}_${filename}`
      );
      
      console.log(`☁️ Uploaded to S3: ${s3Url}`);

      // Extract text content with retry logic
      let extractionAttempts = 0;
      const maxAttempts = 2; // Reduced attempts for simpler approach
      
      while (extractionAttempts < maxAttempts) {
        try {
          textContent = await this.extractTextFromFile(fileBuffer, fileType, filename);
          break;
        } catch (extractionError) {
          extractionAttempts++;
          console.warn(`⚠️ Text extraction attempt ${extractionAttempts} failed:`, extractionError);
          
          if (extractionAttempts >= maxAttempts) {
            throw new Error(`Failed to extract text after ${maxAttempts} attempts: ${extractionError instanceof Error ? extractionError.message : 'Unknown error'}`);
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (!textContent || textContent.trim().length === 0) {
        throw new Error('No text content could be extracted from the document');
      }
      
      // Create text chunks
      chunks = this.chunkText(
        textContent,
        settings.chunkSize || 1000,
        settings.chunkOverlap || 200
      );
      
      if (chunks.length === 0) {
        throw new Error('Document could not be chunked - content too short or invalid');
      }

      console.log(`✅ Successfully processed document: ${chunks.length} chunks created`);
      
      return {
        id: documentId,
        filename: `${documentId}_${filename}`,
        originalName: filename,
        fileType,
        fileSize,
        chunks: chunks.length,
        s3Url,
        processedChunks: chunks,
        textPreview: textContent.substring(0, 500) + (textContent.length > 500 ? '...' : ''),
        processingStats: {
          originalLength: textContent.length,
          chunksCount: chunks.length,
          averageChunkSize: Math.round(chunks.reduce((sum, chunk) => sum + chunk.length, 0) / chunks.length)
        }
      };

    } catch (error) {
      console.error('❌ Error processing document:', error);
      
      // Return error document record
      return {
        id: documentId,
        filename: `${documentId}_${filename}`,
        originalName: filename,
        fileType,
        fileSize,
        chunks: 0,
        s3Url: '', // Empty if upload failed
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown processing error',
        processedChunks: []
      };
    }
  }

  // Helper to get proper MIME type
  private static getMimeType(fileType: string): string {
    const mimeTypes: { [key: string]: string } = {
      'pdf': 'application/pdf',
      'txt': 'text/plain',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'csv': 'text/csv',
      'json': 'application/json',
      'md': 'text/markdown',
      'markdown': 'text/markdown'
    };
    
    return mimeTypes[fileType.toLowerCase()] || 'application/octet-stream';
  }

  // Enhanced search with better keyword matching and scoring
  static async searchKnowledgeBase(
    query: string,
    documents: any[],
    maxResults: number = 3
  ): Promise<{ content: string; relevance: number; source: string; chunkIndex: number }[]> {
    try {
      console.log(`🔍 Searching knowledge base for: "${query}"`);
      console.log(`📚 Searching through ${documents.length} documents`);
      
      const results: { content: string; relevance: number; source: string; chunkIndex: number }[] = [];
      
      // Enhanced query processing
      const queryWords = query.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2)
        .filter(word => !['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'].includes(word));
      
      console.log(`🔤 Query keywords: ${queryWords.join(', ')}`);
      
      for (const doc of documents) {
        if (doc.status !== 'processed' || !doc.processedChunks || doc.processedChunks.length === 0) {
          console.log(`⏭️ Skipping document ${doc.originalName}: not processed or no chunks`);
          continue;
        }
        
        console.log(`📖 Searching in document: ${doc.originalName} (${doc.processedChunks.length} chunks)`);
        
        doc.processedChunks.forEach((chunk: string, chunkIndex: number) => {
          const chunkLower = chunk.toLowerCase();
          let relevanceScore = 0;
          
          // Exact phrase matching (highest score)
          if (chunkLower.includes(query.toLowerCase())) {
            relevanceScore += 100;
          }
          
          // Individual keyword matching with different weights
          queryWords.forEach(word => {
            const wordRegex = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = chunkLower.match(wordRegex);
            if (matches) {
              // Weight longer words higher
              const wordWeight = Math.min(word.length, 10);
              relevanceScore += matches.length * wordWeight;
            }
          });
          
          // Bonus for multiple keywords in same chunk
          const uniqueWordsFound = queryWords.filter(word => 
            chunkLower.includes(word)
          ).length;
          
          if (uniqueWordsFound > 1) {
            relevanceScore += uniqueWordsFound * 5;
          }
          
          // Only include chunks with some relevance
          if (relevanceScore > 0) {
            results.push({
              content: chunk,
              relevance: relevanceScore,
              source: doc.originalName,
              chunkIndex
            });
          }
        });
      }
      
      // Sort by relevance and return top results
      const sortedResults = results
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, maxResults);
      
      console.log(`✅ Found ${sortedResults.length} relevant chunks`);
      sortedResults.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.source} (score: ${result.relevance}) - ${result.content.substring(0, 100)}...`);
      });
      
      return sortedResults;
        
    } catch (error) {
      console.error('❌ Error searching knowledge base:', error);
      return [];
    }
  }

  // Generate enhanced system prompt with better context formatting
  static generateEnhancedSystemPrompt(
    originalPrompt: string,
    relevantContent: { content: string; source: string; relevance?: number }[]
  ): string {
    if (!relevantContent.length) {
      return originalPrompt;
    }

    const contextSection = relevantContent
      .map((item, index) => 
        `[Source ${index + 1}: ${item.source}${item.relevance ? ` (Relevance: ${item.relevance})` : ''}]\n${item.content.trim()}`
      )
      .join('\n\n' + '─'.repeat(50) + '\n\n');

    return `${originalPrompt}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 KNOWLEDGE BASE CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You have access to relevant information from the company's knowledge base. Use this information to provide accurate, contextual responses.

${contextSection}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 INSTRUCTIONS:
1. **PRIORITIZE** knowledge base information when relevant to the user's question
2. **CITE SOURCES** naturally when referencing specific information (e.g., "According to our documentation...")
3. **COMBINE** knowledge base info with your general knowledge for comprehensive answers
4. **ADMIT LIMITATIONS** if the knowledge base doesn't cover the user's specific question
5. **MAINTAIN TONE** - Keep responses helpful, professional, and conversational
6. **DIRECT TO SUPPORT** for complex issues not covered in the knowledge base

Remember: The knowledge base contains ${relevantContent.length} relevant piece(s) of information for this query.`;
  }

  // Utility method to validate file before processing
  static validateFile(file: File, settings: any): { valid: boolean; error?: string } {
    const maxFileSize = (settings.maxFileSize || 10) * 1024 * 1024; // Convert MB to bytes
    const allowedTypes = settings.allowedFileTypes || ['pdf', 'txt', 'doc', 'docx', 'csv', 'json', 'md'];
    
    // Check file size
    if (file.size > maxFileSize) {
      return {
        valid: false,
        error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds limit of ${settings.maxFileSize || 10}MB`
      };
    }
    
    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedTypes.includes(fileExtension)) {
      return {
        valid: false,
        error: `File type '${fileExtension}' not supported. Allowed types: ${allowedTypes.join(', ')}`
      };
    }
    
    // Check file name
    if (file.name.length > 255) {
      return {
        valid: false,
        error: 'File name too long (max 255 characters)'
      };
    }
    
    return { valid: true };
  }

  // Get file statistics
  static getDocumentStats(documents: any[]): {
    totalDocuments: number;
    totalChunks: number;
    totalSize: number;
    byFileType: { [key: string]: number };
    processingStatus: { [key: string]: number };
  } {
    const stats = {
      totalDocuments: documents.length,
      totalChunks: 0,
      totalSize: 0,
      byFileType: {} as { [key: string]: number },
      processingStatus: {} as { [key: string]: number }
    };
    
    documents.forEach(doc => {
      stats.totalChunks += doc.chunks || 0;
      stats.totalSize += doc.fileSize || 0;
      
      // Count by file type
      const fileType = doc.fileType || 'unknown';
      stats.byFileType[fileType] = (stats.byFileType[fileType] || 0) + 1;
      
      // Count by status
      const status = doc.status || 'unknown';
      stats.processingStatus[status] = (stats.processingStatus[status] || 0) + 1;
    });
    
    return stats;
  }
}