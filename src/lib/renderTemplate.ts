import Template from '@/models/Template';

export function renderTemplateBody(tpl: any, componentsFromClient: any[] = []) {
  const bodyComp = tpl.components?.find((c: any) => c.type === 'BODY');
  if (!bodyComp?.text) return `Template: ${tpl.name}`;

  const bodyParams =
    componentsFromClient.find((c: any) => c.type === 'BODY')
      ?.parameters || [];

  // replace {{1}}, {{2}}, … with parameters
  return bodyComp.text.replace(/{{(\d+)}}/g, (_, i) =>
    bodyParams[i - 1]?.text || ''
  );
}

export function extractHeaderMedia(tpl: any, componentsFromClient: any[] = []) {
  const header = tpl.components?.find((c: any) => c.type === 'HEADER');
  if (!header || header.format === 'TEXT') return {};

  const hdrParam =
    componentsFromClient.find((c: any) => c.type === 'HEADER')
      ?.parameters?.[0];

  const link =
    hdrParam?.image?.link ||
    hdrParam?.video?.link ||
    hdrParam?.document?.link;

  return link
    ? {
        mediaUrl: link,
        mimeType: header.format.toLowerCase(), // 'image' | 'video' | 'document'
      }
    : {};
}
