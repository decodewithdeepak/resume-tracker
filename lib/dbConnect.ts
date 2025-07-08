import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('⚠️ MONGODB_URI not found in environment variables');
}

let isConnected = false;

export default async function dbConnect() {
  if (isConnected) return;

  const db = await mongoose.connect(MONGODB_URI);
  isConnected = true;

  console.log('✅ MongoDB connected');
}