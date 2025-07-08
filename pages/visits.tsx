import { useState } from 'react';
import type { GetServerSideProps } from 'next';
import dbConnect from '../lib/dbConnect';
import VisitLog from '../models/VisitLog';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

interface VisitLogType {
  _id: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  browser: string;
  source?: string;
}

export const getServerSideProps: GetServerSideProps<{ authed: boolean; logs: VisitLogType[] }> = async (context) => {
  const { req, res } = context;
  let authed = false;
  let logs: VisitLogType[] = [];

  // Check cookie first
  const cookie = req.headers.cookie || '';
  if (cookie.includes('tracking_auth=1')) authed = true;

  // If not authed, check POST body
  if (!authed && req.method === 'POST') {
    const buffers: Buffer[] = [];
    for await (const chunk of req) buffers.push(chunk);
    const body = Buffer.concat(buffers).toString();
    const pw = decodeURIComponent((body.match(/pw=([^&]*)/) || [])[1] || '');
    if (pw === ADMIN_PASSWORD) {
      authed = true;
      res.setHeader('Set-Cookie', 'tracking_auth=1; Path=/; Max-Age=86400; HttpOnly');
    }
  }

  if (authed) {
    await dbConnect();
    const rawLogs = await VisitLog.find({}).sort({ timestamp: -1 }).lean();
    logs = JSON.parse(JSON.stringify(rawLogs)) as VisitLogType[];
  }

  return { props: { authed, logs } };
};

interface VisitsProps {
  authed: boolean;
  logs: VisitLogType[];
}

export default function Visits({ authed, logs }: VisitsProps) {
  const [pw, setPw] = useState('');

  if (!authed) {
    return (
      <form method="post" className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-xs">
          <input
            type="password"
            name="pw"
            placeholder="Enter admin password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="mb-4 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
            Login
          </button>
        </div>
      </form>
    );
  }

  const total = logs.length;

  const byBrowser: Record<string, number> = logs.reduce((acc, l) => {
    acc[l.browser] = (acc[l.browser] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sourceCounts: Record<string, number> = logs.reduce((acc, l) => {
    if (l.source) acc[l.source] = (acc[l.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-2">
      <div className="max-w-7xl mx-auto bg-white rounded shadow p-6">
        <h2 className="text-2xl font-bold mb-2 text-blue-700">Visit Analytics</h2>
        <p className="mb-4 text-gray-700">
          Total visits: <span className="font-semibold">{total}</span>
        </p>

        <h3 className="text-lg font-semibold mb-1">By Browser:</h3>
        <ul className="mb-6 flex flex-wrap gap-4">
          {Object.entries(byBrowser).map(([browser, count]) => (
            <li key={browser} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {browser}: {count}
            </li>
          ))}
        </ul>

        <h3 className="text-lg font-semibold mb-2">Visit Count by Source</h3>
        <ul className="mb-6 flex flex-wrap gap-4">
          {Object.entries(sourceCounts).map(([source, count]) => (
            <li key={source} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              {source}: {count}
            </li>
          ))}
        </ul>

        <h3 className="text-lg font-semibold mb-2">Logs</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 border-b w-44">Time</th>
                <th className="px-3 py-2 border-b hidden sm:table-cell">IP</th>
                <th className="px-3 py-2 border-b hidden sm:table-cell">User Agent</th>
                <th className="px-3 py-2 border-b">Source</th>
                <th className="px-3 py-2 border-b">Count</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="even:bg-gray-50">
                  <td className="px-3 py-2 border-b">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-3 py-2 border-b hidden sm:table-cell">{log.ip}</td>
                  <td className="px-3 py-2 border-b break-all hidden sm:table-cell">{log.userAgent}</td>
                  <td className="px-3 py-2 border-b">{log.source || '-'}</td>
                  <td className="px-3 py-2 border-b">{sourceCounts[log.source ?? ''] || 1}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
