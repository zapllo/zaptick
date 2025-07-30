import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export function generateSecretKey(): string {
  return uuidv4();
}

export function generateWebhookSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateWebhookSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
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
  try {
    const payloadString = JSON.stringify(payload);
    const signature = generateWebhookSignature(payloadString, secretKey);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Zaptick-Signature': signature,
        'User-Agent': 'Zaptick-Webhook/1.0'
      },
      body: payloadString
    });

    return response.ok;
  } catch (error) {
    console.error('Webhook delivery failed:', error);
    return false;
  }
}