import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export function generateSecretKey(): string {
  // Generate a more secure secret key with prefix for identification
  return `zaptick_${uuidv4().replace(/-/g, '')}_${Date.now()}`;
}

export function generateWebhookSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = generateWebhookSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

export interface WebhookPayload {
  event: string;
  timestamp: number;
  data: any;
  wabaId: string;
  userId: string;
}

export async function sendWebhook(
  webhookUrl: string,
  payload: WebhookPayload,
  secretKey: string
): Promise<boolean> {
  const startTime = Date.now();
  const deliveryId = uuidv4();
  
  try {
    // Validate webhook URL
    if (!isValidWebhookUrl(webhookUrl)) {
      console.error(`❌ Invalid webhook URL: ${webhookUrl}`);
      return false;
    }

    const payloadString = JSON.stringify(payload);
    const signature = generateWebhookSignature(payloadString, secretKey);

    console.log(`📡 [${deliveryId}] Sending webhook to: ${maskUrl(webhookUrl)}`);
    console.log(`🎯 [${deliveryId}] Event: ${payload.event}`);
    console.log(`📦 [${deliveryId}] Payload size: ${payloadString.length} bytes`);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.log(`⏰ [${deliveryId}] Webhook request timed out after 15 seconds`);
    }, 15000); // 15 second timeout

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Zaptick-Signature': signature,
        'X-Zaptick-Event': payload.event,
        'X-Zaptick-Timestamp': payload.timestamp.toString(),
        'X-Zaptick-Delivery-Id': deliveryId,
        'X-Zaptick-WABA-Id': payload.wabaId,
        'User-Agent': 'Zaptick-Webhook/1.0',
        'Accept': 'application/json, text/plain, */*',
        // Add retry information if this is a retry
        ...(payload.data.retryAttempt && {
          'X-Zaptick-Retry-Attempt': payload.data.retryAttempt.toString()
        })
      },
      body: payloadString,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    console.log(`📊 [${deliveryId}] Webhook response: ${response.status} ${response.statusText} (${responseTime}ms)`);

    if (response.ok) {
      // Log successful delivery
      console.log(`✅ [${deliveryId}] Webhook delivered successfully in ${responseTime}ms`);
      
      // Try to read response body for debugging (but don't fail if it's not JSON)
      try {
        const responseText = await response.text();
        if (responseText && responseText.length > 0 && responseText.length < 1000) {
          console.log(`📄 [${deliveryId}] Response body: ${responseText}`);
        }
      } catch (bodyError) {
        // Ignore response body read errors
        console.log(`📄 [${deliveryId}] Could not read response body (not critical)`);
      }

      return true;
    } else {
      // Handle HTTP error responses
      console.error(`❌ [${deliveryId}] Webhook delivery failed with status: ${response.status} ${response.statusText}`);
      
      try {
        const errorText = await response.text();
        if (errorText && errorText.length > 0) {
          console.error(`📄 [${deliveryId}] Error response: ${errorText.substring(0, 500)}${errorText.length > 500 ? '...' : ''}`);
        }
      } catch (errorBodyError) {
        console.error(`📄 [${deliveryId}] Could not read error response body`);
      }

      // Specific handling for common HTTP status codes
      switch (response.status) {
        case 400:
          console.error(`🔍 [${deliveryId}] Bad Request - Check webhook payload format`);
          break;
        case 401:
          console.error(`🔐 [${deliveryId}] Unauthorized - Check webhook signature or authentication`);
          break;
        case 403:
          console.error(`🚫 [${deliveryId}] Forbidden - Webhook endpoint rejected the request`);
          break;
        case 404:
          console.error(`🔍 [${deliveryId}] Not Found - Webhook URL may be incorrect`);
          break;
        case 408:
          console.error(`⏰ [${deliveryId}] Request Timeout - Endpoint took too long to respond`);
          break;
        case 429:
          console.error(`🚦 [${deliveryId}] Rate Limited - Too many requests to webhook endpoint`);
          break;
        case 500:
          console.error(`💥 [${deliveryId}] Internal Server Error - Webhook endpoint has an issue`);
          break;
        case 502:
        case 503:
        case 504:
          console.error(`🌐 [${deliveryId}] Service Unavailable - Webhook endpoint is down or overloaded`);
          break;
        default:
          console.error(`❓ [${deliveryId}] Unexpected HTTP status: ${response.status}`);
      }

      return false;
    }

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    if (error.name === 'AbortError') {
      console.error(`⏰ [${deliveryId}] Webhook delivery timed out after 15 seconds`);
    } else if (error.code === 'ECONNREFUSED') {
      console.error(`🔌 [${deliveryId}] Connection refused - Webhook endpoint is not reachable`);
    } else if (error.code === 'ENOTFOUND') {
      console.error(`🌐 [${deliveryId}] DNS lookup failed - Webhook URL hostname not found`);
    } else if (error.code === 'ECONNRESET') {
      console.error(`🔌 [${deliveryId}] Connection reset - Webhook endpoint closed the connection`);
    } else if (error.code === 'ETIMEDOUT') {
      console.error(`⏰ [${deliveryId}] Connection timed out - Webhook endpoint is not responding`);
    } else {
      console.error(`❌ [${deliveryId}] Webhook delivery failed (${responseTime}ms):`, error.message);
    }

    return false;
  }
}

// Utility function to validate webhook URL
export function isValidWebhookUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    
    // Only allow HTTP and HTTPS
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false;
    }
    
    // Don't allow localhost in production (optional check)
    if (process.env.NODE_ENV === 'production' && 
        (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1')) {
      console.warn(`⚠️ Localhost webhook URL detected in production: ${url}`);
      // Still allow it but warn
    }
    
    return true;
  } catch {
    return false;
  }
}

// Utility function to mask sensitive parts of URL for logging
export function maskUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname;
    
    // Mask sensitive parts of the path (like tokens or secrets)
    const maskedPath = pathname.length > 20 
      ? pathname.substring(0, 10) + '***' + pathname.substring(pathname.length - 7)
      : pathname;
    
    return `${parsedUrl.protocol}//${parsedUrl.hostname}${maskedPath}`;
  } catch {
    // If URL parsing fails, just mask the middle part of the entire URL
    if (url.length > 30) {
      return url.substring(0, 15) + '***' + url.substring(url.length - 15);
    }
    return url;
  }
}

// Utility function to mask sensitive data in logs
export function maskSensitiveData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const masked = { ...data };
  
  // List of fields to mask
  const sensitiveFields = [
    'phone', 'email', 'secretKey', 'token', 'password', 'secret',
    'webhookUrl', 'apiKey', 'accessToken', 'refreshToken'
  ];
  
  for (const key in masked) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      if (typeof masked[key] === 'string' && masked[key].length > 4) {
        masked[key] = masked[key].substring(0, 4) + '*'.repeat(Math.max(0, masked[key].length - 4));
      }
    } else if (typeof masked[key] === 'object') {
      masked[key] = maskSensitiveData(masked[key]);
    }
  }
  
  return masked;
}

// Utility to get event description for better logging
export function getEventDescription(eventType: string): string {
  const descriptions: { [key: string]: string } = {
    'customer.message': 'Customer sent a message',
    'message.sent': 'Message was sent successfully',
    'message.delivered': 'Message was delivered to recipient',
    'message.read': 'Message was read by recipient',
    'message.failed': 'Message delivery failed',
    'message.button_click': 'Customer clicked a button',
    'campaign.sent': 'Campaign message was sent',
    'campaign.delivered': 'Campaign message was delivered',
    'campaign.read': 'Campaign message was read',
    'campaign.failed': 'Campaign message failed',
    'workflow.response': 'Customer responded in workflow',
    'commerce.cart_order': 'Customer placed an order',
    'payment.confirmation': 'Payment was confirmed',
    'payment.failure': 'Payment failed',
    'account.alert': 'Account alert triggered',
    'template.status_update': 'Template status changed'
  };

  return descriptions[eventType] || `Event: ${eventType}`;
}

// Retry mechanism for failed webhooks (can be used by webhook service)
export async function sendWebhookWithRetry(
  webhookUrl: string,
  payload: WebhookPayload,
  secretKey: string,
  maxRetries: number = 3,
  retryDelays: number[] = [1000, 5000, 15000] // 1s, 5s, 15s
): Promise<{ success: boolean; attempts: number; lastError?: string }> {
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`🔄 Webhook delivery attempt ${attempt}/${maxRetries} for event: ${payload.event}`);
    
    // Add retry information to payload
    const retryPayload = {
      ...payload,
      data: {
        ...payload.data,
        retryAttempt: attempt,
        maxRetries
      }
    };
    
    const success = await sendWebhook(webhookUrl, retryPayload, secretKey);
    
    if (success) {
      console.log(`✅ Webhook delivered successfully on attempt ${attempt}`);
      return { success: true, attempts: attempt };
    }
    
    // If this wasn't the last attempt, wait before retrying
    if (attempt < maxRetries) {
      const delay = retryDelays[attempt - 1] || 5000;
      console.log(`⏳ Waiting ${delay}ms before retry attempt ${attempt + 1}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.error(`❌ Webhook delivery failed after ${maxRetries} attempts`);
  return { 
    success: false, 
    attempts: maxRetries,
    lastError: `Failed after ${maxRetries} attempts`
  };
}

// Health check function for webhook URLs
export async function checkWebhookHealth(webhookUrl: string): Promise<{
  healthy: boolean;
  responseTime?: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    if (!isValidWebhookUrl(webhookUrl)) {
      return { healthy: false, error: 'Invalid webhook URL format' };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for health check

    // Send a simple HEAD request to check if the endpoint is reachable
    const response = await fetch(webhookUrl, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Zaptick-Webhook-Health-Check/1.0'
      }
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    return {
      healthy: response.status < 500, // Consider 4xx as healthy (endpoint exists but may reject our request)
      responseTime
    };

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    return {
      healthy: false,
      responseTime,
      error: error.message
    };
  }
}