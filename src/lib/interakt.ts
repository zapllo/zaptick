/* ------------------------------------------------------------- */
/*  Interakt media utilities                                     */
/* ------------------------------------------------------------- */
const TOKEN = process.env.INTERAKT_API_TOKEN!;
const BASE  = 'https://amped-express.interakt.ai/api/v17.0';

export interface WaAsset {
  buf  : Buffer;
  mime : string;
  name?: string;
}

/**
 * Two-step download of a WhatsApp media-id through Interakt.
 */
export async function fetchWaAsset(
  phoneNumberId: string,   // goes in the path
  wabaId       : string,   // goes in the header
  mediaId      : string,
): Promise<WaAsset> {

  /* STEP-1 : translate media-id → fb-URL */
  const metaRes = await fetch(
    `${BASE}/${phoneNumberId}/media/${mediaId}`,
    {
      headers:{
        'x-access-token': TOKEN,
        'x-waba-id'     : wabaId,       // <-- REQUIRED (caused your 400)
      },
    },
  );
  if (!metaRes.ok) {
    throw new Error(`meta → ${metaRes.status} ${metaRes.statusText}`);
  }
  const meta = await metaRes.json();   // { url, mime_type, file_name, ... }

  /* STEP-2 : download bytes via Interakt proxy */
  const dataRes = await fetch(
    `${BASE}/${phoneNumberId}/media?url=${encodeURIComponent(meta.url)}`,
    {
      headers:{
        'x-access-token': TOKEN,
        'x-waba-id'     : wabaId,       // <-- ALSO required here
      },
    },
  );
  if (!dataRes.ok) {
    throw new Error(`bytes → ${dataRes.status} ${dataRes.statusText}`);
  }

  return {
    buf  : Buffer.from(await dataRes.arrayBuffer()),
    mime : dataRes.headers.get('content-type') || meta.mime_type,
    name : meta.file_name ?? undefined,
  };
}
