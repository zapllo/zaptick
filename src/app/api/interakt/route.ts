/* app/api/interakt/route.ts */
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Contact from '@/models/Contact';
import Conversation from '@/models/Conversation';
import { v4 as uuidv4 } from 'uuid';

import { getWaDownloadUrl } from '@/lib/interakt';
import { uploadToS3 } from '@/lib/s3';

const TP_SIGNUP_URL = 'https://api.interakt.ai/v1/organizations/tp-signup/';
const INT_API_TOKEN = process.env.INTERAKT_API_TOKEN!;

/* ───────────────────────────────── hub.verify */
export async function GET(req: NextRequest) {
  const challenge = new URL(req.url).searchParams.get('hub.challenge');
  return new Response(challenge ?? 'OK', { status: 200 });
}

/* ───────────────────────────────── main webhook */
export async function POST(req: NextRequest) {
  await dbConnect();

  const raw = await req.text();
  console.log('Interakt webhook received:', raw);

  const body = JSON.parse(raw);
  const value = body?.entry?.[0]?.changes?.[0]?.value ?? {};
  const event = value.event;
  const waba = value.waba_info;

  if (value.messaging_product === 'whatsapp' && value.messages) {
    try { await processIncomingMessages(value); }
    catch (err) { console.error(err); }
  }

  if (value.statuses) {
    await processStatuses(value.statuses, value.metadata?.phone_number_id);
  }

  /* signup / onboarding events… unchanged ↓ */
  if (event === 'PARTNER_ADDED' && waba?.waba_id) {
    await fetch(TP_SIGNUP_URL, {
      method: 'POST',
      headers: {
        Authorization: INT_API_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        object: 'tech_partner',
        entry: [{ changes: [{ value: { event, waba_info: waba } }] }],
      }),
    });
  }

  if (event === 'WABA_ONBOARDED') {
    /* identical to your previous code – omitted for brevity */
  }

  return NextResponse.json({ received: true });
}

/* ───────────────────────────── incoming messages */
async function processIncomingMessages(v: any) {
  const phoneNumberId = v.metadata?.phone_number_id;
  if (!phoneNumberId) return;

  const user = await User.findOne({ 'wabaAccounts.phoneNumberId': phoneNumberId });
  if (!user) return;

  const wabaAccount = user.wabaAccounts.find((a: any) => a.phoneNumberId === phoneNumberId);
  if (!wabaAccount) return;

  for (const m of v.messages) {
    try {
      await processMessage(m, v.contacts ?? [], user._id, wabaAccount);
    } catch (err) {
      console.error('processMessage error', err);
    }
  }
}

async function processMessage(
  m: any,
  contacts: any[],
  userId: string,
  wabaAcc: any,
) {
  /* ── basic info */
  const waId = m.from;                                      // "9170…"
  const senderPhone = waId.replace(/^\+?/, '');
  const ts = new Date(+m.timestamp * 1000);
  const messageId = m.id;

  /* ── find / create contact */
  let contact = await Contact.findOne({
    $or: [
      { phone: senderPhone },
      { phone: `+${senderPhone}` },
      { phone: senderPhone.slice(-10) },
      { phone: `+${senderPhone.slice(-10)}` },
    ],
    wabaId: wabaAcc.wabaId,
  });

  if (!contact) {
    const waContact = contacts.find((c: any) => c.wa_id === waId);
    contact = await Contact.create({
      name: waContact?.profile?.name || `+${senderPhone}`,
      phone: `+${senderPhone}`,
      wabaId: wabaAcc.wabaId,
      phoneNumberId: wabaAcc.phoneNumberId,
      userId,
      whatsappOptIn: true,
      lastMessageAt: ts,
    });
  } else {
    contact.lastMessageAt = ts;
    contact.whatsappOptIn = true;
    await contact.save();
  }

  /* ── build message skeleton */
  const newMsg: any = {
    id: uuidv4(),
    senderId: 'customer',
    timestamp: ts,
    status: 'delivered',
    whatsappMessageId: messageId,
  };

  /* ── text / media handling */
  switch (m.type) {
    case 'text':
      newMsg.messageType = 'text';
      newMsg.content = m.text?.body ?? '';
      break;

    case 'image':
    case 'video':
    case 'audio':
    case 'document': {
      const mediaId = m[m.type].id;
      const { url, mime_type, file_name } =
        await getWaDownloadUrl(wabaAcc.phoneNumberId, mediaId);
      console.log(mediaId, 'media id ohhh!!!')
      const waRes = await fetch(url);
      const buffer = Buffer.from(await waRes.arrayBuffer());

      const s3Url = await uploadToS3(buffer, mime_type, `wa/${m.type}`, file_name ?? mediaId);

      newMsg.messageType = m.type;
      newMsg.mediaId = mediaId;
      newMsg.mediaUrl = s3Url;
      newMsg.mimeType = mime_type;
      newMsg.fileName = file_name;
      newMsg.mediaCaption = m[m.type]?.caption || file_name || '';

      newMsg.content = newMsg.mediaCaption || m.type;
    } break;

    default:
      newMsg.messageType = 'text';
      newMsg.content = `Unsupported WA type: ${m.type}`;
  }

  /* ── upsert conversation */
  let conv = await Conversation.findOne({ contactId: contact._id });
  if (!conv) {
    conv = new Conversation({
      contactId: contact._id,
      wabaId: wabaAcc.wabaId,
      phoneNumberId: wabaAcc.phoneNumberId,
      userId,
      messages: [],
      unreadCount: 0,
      status: 'active',
      isWithin24Hours: true,
    });
  }

  conv.messages.push(newMsg);
  conv.lastMessage = newMsg.content;
  conv.lastMessageType = newMsg.messageType;
  conv.lastMessageAt = ts;
  conv.unreadCount = (conv.unreadCount ?? 0) + 1;

  const last24 = new Date(Date.now() - 24 * 60 * 60 * 1000);
  conv.isWithin24Hours = ts > last24;

  await conv.save();
}

/* ── 24h failure handling – unchanged from your file */
async function processStatuses(st: any[], phoneNumberId: string) {
  for (const s of st) {
    if (s.status !== 'failed' || s.errors?.[0]?.code !== 131047) continue;
    const rec = s.recipient_id;
    const c = await Conversation.findOne({
      'contact.phone': { $regex: rec.slice(-10) },
      phoneNumberId,
    });
    if (c && c.isWithin24Hours) {
      c.isWithin24Hours = false;
      await c.save();
    }
  }
}
