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

/* …rest of file untouched … */

/**
 * Download the raw media bytes right after we obtained the URL.
 * ⚠︎  Some WABA setups need the same headers that were used for the
 *    lookup call, others return a public (pre-signed) URL.
 *    → try with headers, if that fails retry without.
 */
export async function downloadFromInterakt(
  phoneNumberId: string,
  wabaId       : string,
  mediaId      : string,
): Promise<{ buffer: Buffer; mime: string; fileName?: string }> {

  const { url, mime_type, file_name } =
        await getWaDownloadUrl(phoneNumberId, wabaId, mediaId);

  const headers = {
    'x-access-token': INT_TOKEN,
    'x-waba-id'     : wabaId,
  };

  const attempt = async (useHeaders: boolean) => {
    const r = await fetch(url, {
      redirect: 'follow',
      headers : useHeaders ? headers : undefined,
    });
    if (!r.ok) throw new Error(`${r.status}`);
    return Buffer.from(await r.arrayBuffer());
  };

  let buf: Buffer;
  try {
    buf = await attempt(true);          // ① with headers
  } catch (e) {
    if ((e as Error).message === '401' || (e as Error).message === '403') {
      buf = await attempt(false);       // ② retry header-less
    } else {
      throw new Error(`media download failed → ${(e as Error).message}`);
    }
  }

  return { buffer: buf, mime: mime_type, fileName: file_name };
}
