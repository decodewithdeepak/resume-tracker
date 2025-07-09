import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/dbConnect';
import ResumeUrl from '../../models/ResumeUrl';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await dbConnect();

    if (req.method === 'GET') {
        const doc = await ResumeUrl.findOne({}).sort({ updatedAt: -1 });
        if (!doc) return res.status(404).json({ error: 'No resume URL found' });
        return res.status(200).json({ url: doc.url });
    }

    if (req.method === 'POST') {
        const { url } = req.body;
        if (!url) return res.status(400).json({ error: 'Missing url' });
        const doc = await ResumeUrl.findOneAndUpdate({}, { url, updatedAt: new Date() }, { upsert: true, new: true });
        return res.status(200).json({ url: doc.url });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
