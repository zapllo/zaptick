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

/* …existing imports / INT_TOKEN / BASE … */

export async function downloadFromInterakt(
  phoneNumberId: string,
  wabaId       : string,
  mediaId      : string,
): Promise<{ buffer: Buffer; mime: string; fileName?: string }> {

  const meta = await getWaDownloadUrl(phoneNumberId, wabaId, mediaId);

  const tryFetch = async (withHdr: boolean) => {
    const r = await fetch(meta.url, {
      redirect: 'follow',
      headers : withHdr ? {
        'x-access-token': INT_TOKEN,
        'x-waba-id'     : wabaId,
      } : undefined,
    });
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    return Buffer.from(await r.arrayBuffer());
  };

  let buf: Buffer;
  try {
    buf = await tryFetch(true);                // ① first: with headers
  } catch (e) {
    const msg = (e as Error).message;
    // 👇  loosen the check – just look for the code anywhere in the msg
    if (msg.includes('401') || msg.includes('403')) {
      buf = await tryFetch(false);             // ② retry header-less
    } else {
      throw new Error(`media download failed → ${msg}`);
    }
  }

  return { buffer: buf, mime: meta.mime_type, fileName: meta.file_name };
}
