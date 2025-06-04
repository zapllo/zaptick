/* ----------------------------------------------------------------
   Interakt helper – v2
   ---------------------------------------------------------------- */

const INT_TOKEN = process.env.INTERAKT_API_TOKEN!;      //  x-access-token
const BASE      = 'https://amped-express.interakt.ai/api/v17.0';

export interface WaMediaMeta {
  url       : string;
  mime_type : string;
  file_name?: string;
}

/**
 * Step 1 – ask Interakt for a **temporary** signed URL
 */
export async function getWaDownloadUrl(
  phoneNumberId: string,   // goes into the path
  wabaId       : string,   // goes into the x-waba-id header
  mediaId      : string,
): Promise<WaMediaMeta> {

  const res = await fetch(
    `${BASE}/${phoneNumberId}/media/${mediaId}`,
    {
      headers: {
        'x-access-token': INT_TOKEN,
        'x-waba-id'     : wabaId,
        'content-type'  : 'application/json',
      },
    },
  );

  if (!res.ok) {
    throw new Error(`Interakt media lookup failed → ${res.status} ${res.statusText}`);
  }

  const j = await res.json();
  return {
    url       : j.url,
    mime_type : j.mime_type,
    file_name : j.file_name ?? undefined,
  };
}

/**
 * Step 2 – **immediately** download the media bytes
 * (the signed URL expires after ~1 minute).
 */
export async function downloadFromInterakt(
  phoneNumberId: string,
  wabaId       : string,
  mediaId      : string,
): Promise<{ buffer: Buffer; mime: string; fileName?: string }> {

  const { url, mime_type, file_name } =
        await getWaDownloadUrl(phoneNumberId, wabaId, mediaId);

  const r = await fetch(url, { redirect: 'follow' });
  if (!r.ok) {
    throw new Error(`media download failed → ${r.status} ${r.statusText}`);
  }

  const arrayBuf = await r.arrayBuffer();
  return {
    buffer   : Buffer.from(arrayBuf),
    mime     : mime_type,
    fileName : file_name,
  };
}
