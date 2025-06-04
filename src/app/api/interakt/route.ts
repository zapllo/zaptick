/* ----------------------------------------------------------------
   Interakt webhook – v2  (media download + S3 upload working)
   ---------------------------------------------------------------- */

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Contact from '@/models/Contact';
import Conversation from '@/models/Conversation';
import { v4 as uuidv4 } from 'uuid';

import { uploadToS3 } from '@/lib/s3';
import { fetchWaAsset } from '@/lib/interakt';

/* ---------- hub challenge ------------------------------------------------ */

export async function GET(req: NextRequest) {
  const challenge = new URL(req.url).searchParams.get('hub.challenge');
  return new Response(challenge ?? 'OK', { status: 200 });
}

/* ---------- webhook ------------------------------------------------------ */

export async function POST(req: NextRequest) {
  await dbConnect();

  const raw = await req.text();
  console.log('Interakt webhook received:', raw);

  const body = JSON.parse(raw);
  const value = body?.entry?.[0]?.changes?.[0]?.value ?? {};

  if (value.messaging_product === 'whatsapp' && value.messages) {
    await processIncomingMessages(value);
  }

  /* status-callbacks, onboarding events … (unchanged / optional) */

  return NextResponse.json({ received: true });
}

/* ---------- helpers ----------------------------------------------------- */

async function processIncomingMessages(v: any) {
  const phoneNumberId = v.metadata?.phone_number_id;
  if (!phoneNumberId) return;

  const user = await User.findOne({ 'wabaAccounts.phoneNumberId': phoneNumberId });
  if (!user) return;

  const wabaAcc = user.wabaAccounts.find((a: any) => a.phoneNumberId === phoneNumberId);
  if (!wabaAcc) return;

  for (const m of v.messages) {
    try {
      await processMessage(m, v.contacts ?? [], user._id, wabaAcc);
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
  /* ---- sender + timestamps ------------------------------------------- */

  const waId = m.from;
  const senderPhone = waId.replace(/^\+?/, '');
  const ts = new Date(+m.timestamp * 1000);

  /* ---- contact ------------------------------------------------------- */

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

  /* ---- new message object ------------------------------------------- */

  const newMsg: any = {
    id: uuidv4(),
    senderId: 'customer',
    timestamp: ts,
    status: 'delivered',
    whatsappMessageId: m.id,
  };

  /* ---- content / media ---------------------------------------------- */

  switch (m.type) {
    case 'text': {
      newMsg.messageType = 'text';
      newMsg.content = m.text?.body ?? '';
      break;
    }

    /* inside processMessage() switch */
    case 'image':
    case 'video':
    case 'audio':
    case 'document': {
      const mediaId = m[m.type].id;

      /* ① download via Interakt (now passes both IDs) */
      const asset = await fetchWaAsset(
        wabaAcc.phoneNumberId,   // path part
        wabaAcc.wabaId,          // header part
        mediaId,
      );

      /* ② push to S3 (no ACL) */
      const s3Url = await uploadToS3(
        asset.buf,
        asset.mime,
        `wa/${m.type}`,
        asset.name ?? `${mediaId}.${asset.mime.split('/')[1]}`,
      );

      newMsg.messageType = m.type;
      newMsg.mediaId = mediaId;
      newMsg.mediaUrl = s3Url;
      newMsg.mimeType = asset.mime;
      newMsg.fileName = asset.name;
      newMsg.mediaCaption = m[m.type]?.caption || asset.name || '';
      newMsg.content = newMsg.mediaCaption || m.type;
      break;
    }

    default:
      newMsg.messageType = 'text';
      newMsg.content = `Unsupported WA type: ${m.type}`;
  }

  /* ---- conversation upsert ------------------------------------------ */

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
  conv.isWithin24Hours = ts.getTime() > Date.now() - 86_400_000;

  await conv.save();
}
