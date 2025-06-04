/* lib/interakt.ts -------------------------------------------------------- */

import { Buffer } from 'buffer';

const INT_TOKEN = process.env.INTERAKT_API_TOKEN!;        //  x-access-token
const BASE_URL  = 'https://amped-express.interakt.ai/api/v17.0';

export interface WaMediaMeta {
  url      : string;            // signed download URL (facebook domain)
  mime_type: string;
  file_name: string | undefined;
}

/** Ask Interakt for a signed download URL (one hop only) */
export async function getWaDownloadUrl (
  phoneNumberId: string,
  mediaId     : string,
): Promise<WaMediaMeta> {

  const url = `${BASE_URL}/${phoneNumberId}/media/${mediaId}`;

  const res = await fetch(url, {
    headers: {
      'x-access-token': INT_TOKEN,                 // required
      'x-waba-id'     : phoneNumberId,             // required
      'content-type'  : 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Interakt media lookup failed: ${res.status} ${res.statusText}`);
  }

  /* ↳ { url, mime_type, sha256, file_size, id, messaging_product } */
  const j = await res.json();
  return {
    url       : j.url,
    mime_type : j.mime_type,
    file_name : j.file_name ?? undefined,
  };
}
