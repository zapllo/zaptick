/* ------------------------------------------------------------- */
/*  Interakt media utilities                                     */
/* ------------------------------------------------------------- */
const TOKEN = process.env.INTERAKT_API_TOKEN!;
const BASE  = 'https://amped-express.interakt.ai/api/v17.0';

export interface WaMeta {
  mime : string;
  name?: string;
  buf  : Buffer;
}

/**
 * Download a WA media-id through Interakt’s proxy.
 * No headers leak to Facebook, no 401/403, always raw bytes.
 */
export async function downloadWaMedia(
  phoneNumberId: string,
  mediaId      : string,
): Promise<WaMeta> {

  /* step-1 ─ Get facebook URL */
  const metaRes = await fetch(
    `${BASE}/${phoneNumberId}/media/${mediaId}`,
    { headers:{ 'x-access-token': TOKEN, 'content-type':'application/json' } }
  );
  if (!metaRes.ok) throw new Error(`meta → ${metaRes.status}`);
  const meta = await metaRes.json();   // { url, mime_type, file_name,… }

  /* step-2 ─ Ask Interakt to stream the bytes back to us */
  const dataRes = await fetch(
    `${BASE}/${phoneNumberId}/media`,
    {
      method : 'POST',
      headers: {
        'x-access-token': TOKEN,
        'content-type'  : 'application/json',
      },
      body: JSON.stringify({ url: meta.url }),
    }
  );
  if (!dataRes.ok) throw new Error(`bytes → ${dataRes.status}`);

  return {
    mime : dataRes.headers.get('content-type') || meta.mime_type,
    name : meta.file_name,
    buf  : Buffer.from(await dataRes.arrayBuffer()),
  };
}
