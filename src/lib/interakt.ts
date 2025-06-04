/* lib/interakt.ts -------------------------------------------------------- */
const INT_TOKEN = process.env.INTERAKT_API_TOKEN!;
const BASE      = 'https://amped-express.interakt.ai/api/v17.0';

export interface WaMediaMeta {
  url      : string;
  mime_type: string;
  file_name: string | undefined;
}

/**
 * Get a signed download URL for a WhatsApp media-id via Interakt.
 * @param phoneNumberId  – the PN-ID (goes in the path)
 * @param wabaId         – the WABA-ID (goes in x-waba-id header)
 * @param mediaId        – the media id from the webhook payload
 */
export async function getWaDownloadUrl (
  phoneNumberId: string,
  wabaId       : string,
  mediaId      : string,
): Promise<WaMediaMeta> {

  const url = `${BASE}/${phoneNumberId}/media/${mediaId}`;

  const res = await fetch(url, {
    headers: {
      'x-access-token': INT_TOKEN,      // your API key
      'x-waba-id'     : wabaId,         // *** WABA-ID – NOT PN-ID ***
      'content-type'  : 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(
      `Interakt media lookup failed: ${res.status} ${res.statusText}`,
    );
  }

  const j = await res.json();
  return {
    url      : j.url,
    mime_type: j.mime_type,
    file_name: j.file_name ?? undefined,
  };
}
