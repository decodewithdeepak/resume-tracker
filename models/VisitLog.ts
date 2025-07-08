import mongoose, { Schema, Document, models } from 'mongoose';

export interface IVisitLog extends Document {
  timestamp: Date;
  ip: string;
  userAgent: string;
  browser: string;
  location?: string;
}

const VisitLogSchema = new Schema<IVisitLog>({
  timestamp: { type: Date, default: Date.now },
  ip: { type: String, required: true },
  userAgent: { type: String, required: true },
  browser: { type: String, required: true },
  location: { type: String },
});

export default models.VisitLog || mongoose.model<IVisitLog>('VisitLog', VisitLogSchema);
