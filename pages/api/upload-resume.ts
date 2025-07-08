import type { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import type { Request, Response } from 'express';

// Multer config: Store file in memory
const upload = multer({ storage: multer.memoryStorage() });

// Disable Next.js's default body parsing (so multer can parse the stream)
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to wrap Express middleware for Next.js
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: (req: Request, res: Response, callback: (err?: unknown) => void) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    fn(req as unknown as Request, res as unknown as Response, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  }

  try {
    // Run multer middleware
    await runMiddleware(req, res, upload.single('resume'));

    const file = (req as any).file as Express.Multer.File | undefined;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }

    const publicDir = path.join(process.cwd(), 'public');
    const resumePath = path.join(publicDir, 'resume.pdf');

    if (fs.existsSync(resumePath)) {
      fs.unlinkSync(resumePath);
    }

    fs.writeFileSync(resumePath, file.buffer);

    return res.status(200).json({ message: 'Resume uploaded successfully' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: `Upload error: ${message}` });
  }
}
