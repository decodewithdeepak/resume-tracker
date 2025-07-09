import { useState } from 'react';
import type { GetServerSideProps } from 'next';
import dbConnect from '../lib/dbConnect';
import VisitLogModel from '../models/VisitLog';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

interface VisitLogType {
    _id: string;
    timestamp: string;
    ip: string;
    userAgent: string;
    browser: string;
    source?: string;
}

interface VisitsProps {
    authed: boolean;
    logs: VisitLogType[];
}

export const getServerSideProps: GetServerSideProps<VisitsProps> = async (context) => {
    const { req, res } = context;
    let authed = false;
    let logs: VisitLogType[] = [];

    const cookie = req.headers.cookie || '';
    if (cookie.includes('tracking_auth=1')) authed = true;

    if (!authed && req.method === 'POST') {
        const buffers: Uint8Array[] = [];
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
        const rawLogs = await VisitLogModel.find({}).sort({ timestamp: -1 }).lean();
        logs = JSON.parse(JSON.stringify(rawLogs)) as VisitLogType[];
    }

    return { props: { authed, logs } };
};

export default function Visits({ authed, logs }: VisitsProps) {
    const [pw, setPw] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadMsg, setUploadMsg] = useState<string | null>(null);

    const total = logs.length;
    const byBrowser = logs.reduce<Record<string, number>>((acc, l) => {
        acc[l.browser] = (acc[l.browser] || 0) + 1;
        return acc;
    }, {});
    const sourceCounts = logs.reduce<Record<string, number>>((acc, l) => {
        if (l.source) acc[l.source] = (acc[l.source] || 0) + 1;
        return acc;
    }, {});
    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUploadMsg(null);
        setUploading(true);

        const form = e.currentTarget;
        const fileInput = form.elements.namedItem('resume') as HTMLInputElement;
        const file = fileInput?.files?.[0];

        if (!file || file.type !== 'application/pdf') {
            setUploadMsg('Please select a valid PDF file.');
            setUploading(false);
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'resume_preset'); // <-- set this in Cloudinary
        // Do NOT set public_id for unsigned uploads (Cloudinary will generate a unique one)

        try {
            const res = await fetch('https://api.cloudinary.com/v1_1/ddotbkkt7/auto/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.secure_url) {
                // Save the new URL to MongoDB
                await fetch('/api/resume-url', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: data.secure_url }),
                });
                // Show the new PDF immediately after upload by updating the iframe (if present)
                const resumeFrame = document.getElementById('resume-frame') as HTMLIFrameElement | null;
                if (resumeFrame) {
                    resumeFrame.src = data.secure_url + '?t=' + Date.now();
                }
                setUploadMsg('Resume uploaded! New URL: ' + data.secure_url);
            } else {
                setUploadMsg(data.error?.message || 'Upload failed.');
            }
        } catch {
            setUploadMsg('Upload failed. Try again.');
        }

        setUploading(false);
    };
    if (!authed) {
        return (
            <form method="post" className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="bg-white p-8 rounded shadow w-full max-w-xs">
                    <input
                        type="password"
                        name="pw"
                        value={pw}
                        onChange={(e) => setPw(e.target.value)}
                        placeholder="Enter admin password"
                        className="mb-4 w-full px-3 py-2 border rounded"
                    />
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Login</button>
                </div>
            </form>
        );
    }
    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-7xl mx-auto bg-white p-6 rounded shadow">
                <h1 className="text-2xl font-bold mb-4 text-blue-700">Visit Analytics</h1>
                <p className="mb-4">Total Visits: <strong>{total}</strong></p>

                <form onSubmit={handleUpload} className="mb-6 flex flex-wrap items-center gap-4 border p-4 rounded">
                    <label htmlFor="resume" className="font-medium">Upload Resume (PDF):</label>
                    <input id="resume" name="resume" type="file" accept="application/pdf" required className="file:rounded file:bg-blue-100 file:px-3 file:py-1" />
                    <button disabled={uploading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60">
                        {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                    {uploadMsg && <p className="text-sm text-green-600">{uploadMsg}</p>}
                </form>

                <h2 className="text-lg font-semibold mt-4 mb-2">Browser Stats:</h2>
                <ul className="flex flex-wrap gap-3 mb-4">
                    {Object.entries(byBrowser).map(([browser, count]) => (
                        <li key={browser} className="bg-blue-100 text-blue-800 px-3 py-1 rounded">{browser}: {count}</li>
                    ))}
                </ul>

                <h2 className="text-lg font-semibold mt-4 mb-2">Source Stats:</h2>
                <ul className="flex flex-wrap gap-3 mb-6">
                    {Object.entries(sourceCounts).map(([source, count]) => (
                        <li key={source} className="bg-green-100 text-green-800 px-3 py-1 rounded">{source}: {count}</li>
                    ))}
                </ul>

                <h2 className="text-lg font-semibold mb-2">Visit Logs:</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full border text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-2 py-1">Time</th>
                                <th className="border px-2 py-1 hidden sm:table-cell">IP</th>
                                <th className="border px-2 py-1 hidden sm:table-cell">User Agent</th>
                                <th className="border px-2 py-1">Source</th>
                                <th className="border px-2 py-1">Visit Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log._id} className="even:bg-gray-50">
                                    <td className="border px-2 py-1">{new Date(log.timestamp).toLocaleString()}</td>
                                    <td className="border px-2 py-1 hidden sm:table-cell">{log.ip}</td>
                                    <td className="border px-2 py-1 break-all hidden sm:table-cell">{log.userAgent}</td>
                                    <td className="border px-2 py-1">{log.source || '-'}</td>
                                    <td className="border px-2 py-1">{log.source ? sourceCounts[log.source] : 1}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
