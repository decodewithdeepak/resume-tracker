import mongoose, { Schema, Document, models } from 'mongoose';

export interface IVisitLog extends Document {
    timestamp: Date;
    ip: string;
    userAgent: string;
    source: string;
    count: number;
}

const VisitLogSchema = new Schema<IVisitLog>({
    timestamp: { type: Date, default: Date.now },
    ip: { type: String, required: true },
    userAgent: { type: String, required: true },
    source: { type: String },
    count: { type: Number },
});

export default models.VisitLog || mongoose.model<IVisitLog>('VisitLog', VisitLogSchema);
