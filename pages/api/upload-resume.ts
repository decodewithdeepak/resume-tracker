import type { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Multer config: store file in memory, then write to /public/resume.pdf
const upload = multer({ storage: multer.memoryStorage() });

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  }
  upload.single('resume')(req as any, res as any, (err: any) => {
    if (err) {
      return res.status(500).json({ error: `Upload error: ${err.message}` });
    }
    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    // Only allow PDF
    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }
    const publicDir = path.join(process.cwd(), 'public');
    const resumePath = path.join(publicDir, 'resume.pdf');
    // Delete old resume if exists
    if (fs.existsSync(resumePath)) {
      fs.unlinkSync(resumePath);
    }
    // Write new PDF
    fs.writeFileSync(resumePath, file.buffer);
    return res.status(200).json({ message: 'Resume uploaded successfully' });
  });
}
