import mongoose, { Schema, model, models } from 'mongoose';

export interface ResumeUrlDoc extends mongoose.Document {
    url: string;
    updatedAt: Date;
}

const ResumeUrlSchema = new Schema<ResumeUrlDoc>({
    url: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now },
});

export default models.ResumeUrl || model<ResumeUrlDoc>('ResumeUrl', ResumeUrlSchema);
