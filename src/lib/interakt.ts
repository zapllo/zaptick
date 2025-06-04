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
 * 1)  /{PHONE_ID}/media/{MEDIA_ID}        → facebook URL
 * 2)  /{PHONE_ID}/media?url=<fb-url>      → raw bytes
 */
export async function downloadWaMedia(
  phoneNumberId: string,
  mediaId      : string,
): Promise<WaMeta> {

  /* ── step-1 : facebook URL */
  const metaRes = await fetch(
    `${BASE}/${phoneNumberId}/media/${mediaId}`,
    { headers:{ 'x-access-token': TOKEN } },
  );
  if (!metaRes.ok) {
    throw new Error(`meta → ${metaRes.status} ${metaRes.statusText}`);
  }
  const meta = await metaRes.json();   // { url, mime_type, file_name,… }

  /* ── step-2 : Interakt proxy download (url in QUERY) */
  const dataUrl = `${BASE}/${phoneNumberId}/media?url=${encodeURIComponent(meta.url)}`;

  const dataRes = await fetch(
    dataUrl,
    { headers:{ 'x-access-token': TOKEN } },
  );
  if (!dataRes.ok) {
    throw new Error(`bytes → ${dataRes.status} ${dataRes.statusText}`);
  }

  return {
    mime : dataRes.headers.get('content-type') || meta.mime_type,
    name : meta.file_name,
    buf  : Buffer.from(await dataRes.arrayBuffer()),
  };
}
