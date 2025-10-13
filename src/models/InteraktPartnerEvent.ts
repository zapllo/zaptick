// /models/InteraktPartnerEvent.ts
import mongoose, { Schema } from 'mongoose';

const InteraktPartnerEventSchema = new Schema({
  eventType: { type: String, index: true },
  wabaId: { type: String, index: true },
  phoneNumberId: { type: String, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  raw: Schema.Types.Mixed,
  receivedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.InteraktPartnerEvent
  || mongoose.model('InteraktPartnerEvent', InteraktPartnerEventSchema);
