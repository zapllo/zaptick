/**
 * Ask Interakt for a temporary download link for a WhatsApp media-id
 * https://docs.interakt.ai/reference/retrieve-media
 */
export async function getWaDownloadUrl(
  phoneNumberId: string,
  mediaId: string,
) {
  const r = await fetch(
    `https://api.interakt.ai/v1/wa/${phoneNumberId}/media/${mediaId}`,
    {
      headers: {
        'Authorization': process.env.INTERAKT_API_TOKEN!,
        'Content-Type' : 'application/json',
      },
    },
  );

  if (!r.ok) {
    throw new Error(`Interakt media lookup failed: ${r.statusText}`);
  }
  return r.json() as Promise<{
    url: string;
    mime_type: string;
    file_name?: string;
  }>;
}
