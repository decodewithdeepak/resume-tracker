import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/dbConnect';
import VisitLog from '../../models/VisitLog';
import * as UAParser from 'ua-parser-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  const ip =
    req.headers['x-forwarded-for']?.toString().split(',')[0] ||
    req.socket.remoteAddress ||
    '';
  const userAgent = req.headers['user-agent'] || '';
  const parser = new UAParser.UAParser(userAgent);
  const browser = parser.getBrowser().name || 'Unknown';


  // Get location and source from request body
  const { location, source } = req.body;

  await VisitLog.create({
    ip,
    userAgent,
    browser,
    location,
    source,
  });

  res.status(201).json({ message: 'Visit logged' });
}
