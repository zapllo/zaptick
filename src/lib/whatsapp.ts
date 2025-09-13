const WHATSAPP_API_URL = 'https://amped-express.interakt.ai/api/v17.0';

export async function sendWhatsAppMessage(messageData: any) {
  const phoneNumberId = process.env.PHONE_NUMBER_ID;
  const accessToken = process.env.INTERAKT_API_TOKEN;
  const wabaId = process.env.WABA_ID;

  if (!phoneNumberId || !accessToken || !wabaId) {
    throw new Error('WhatsApp API credentials not configured');
  }

  const response = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': accessToken,
      'x-waba-id': wabaId,
    },
    body: JSON.stringify(messageData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`WhatsApp API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
  }

  return response.json();
}

export async function uploadMedia(file: File, type: string) {
  const phoneNumberId = process.env.PHONE_NUMBER_ID;
  const accessToken = process.env.INTERAKT_API_TOKEN;
  const wabaId = process.env.WABA_ID;

  if (!phoneNumberId || !accessToken || !wabaId) {
    throw new Error('WhatsApp API credentials not configured');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('messaging_product', 'whatsapp');
  formData.append('type', type);

  const response = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/media_handle`, {
    method: 'POST',
    headers: {
      'x-access-token': accessToken,
      'x-waba-id': wabaId,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`WhatsApp Media API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
  }

  return response.json();
}