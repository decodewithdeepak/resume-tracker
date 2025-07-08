import type { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import type { Request, Response } from 'express';

// Setup multer to store file in memory
const upload = multer({ storage: multer.memoryStorage() });

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to run Express-style middleware in Next.js API route
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
    await runMiddleware(req, res, upload.single('resume'));

    const file = (req as unknown as { file?: Express.Multer.File }).file;

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
  } catch {
    return res.status(500).json({ error: 'Unexpected server error' });
  }
}
