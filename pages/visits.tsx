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

export const getServerSideProps: GetServerSideProps<VisitsProps & { page: number; totalPages: number }> = async (context) => {
    const { req, res, query } = context;
    let authed = false;
    let logs: VisitLogType[] = [];
    const pageSize = 20;
    const page = parseInt((query.page as string) || '1', 10);
    let totalPages = 1;

    if (req.headers.cookie?.includes('tracking_auth=1')) authed = true;

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
        const totalLogs = await VisitLogModel.countDocuments();
        totalPages = Math.max(1, Math.ceil(totalLogs / pageSize));
        const rawLogs = await VisitLogModel.find({})
            .sort({ timestamp: -1 })
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .lean();
        logs = JSON.parse(JSON.stringify(rawLogs));
    }

    return { props: { authed, logs, page, totalPages } };
};

interface VisitsPageProps extends VisitsProps {
    page: number;
    totalPages: number;
}

export default function Visits({ authed, logs, page = 1, totalPages = 1 }: VisitsPageProps) {
    const [pw, setPw] = useState('');
    const total = logs.length;

    const byBrowser = logs.reduce<Record<string, number>>((acc, l) => {
        acc[l.browser] = (acc[l.browser] || 0) + 1;
        return acc;
    }, {});

    const sourceCounts = logs.reduce<Record<string, number>>((acc, l) => {
        if (l.source) acc[l.source] = (acc[l.source] || 0) + 1;
        return acc;
    }, {});

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;
        window.location.href = `/visits?page=${newPage}`;
    };

    if (!authed) {
        return (
            <form method="post" className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
                    <input
                        type="password"
                        name="pw"
                        value={pw}
                        onChange={(e) => setPw(e.target.value)}
                        placeholder="Admin password"
                        className="w-full mb-4 px-3 py-2 border rounded focus:outline-none"
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                    >
                        Login
                    </button>
                </div>
            </form>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow-md">
                <h1 className="text-2xl font-bold mb-4 text-blue-700">Visit Analytics</h1>
                <p className="mb-4">Page <strong>{page}</strong> of <strong>{totalPages}</strong></p>
                <h2 className="text-lg font-semibold mb-2">Browser Stats:</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                    {Object.entries(byBrowser).map(([browser, count]) => (
                        <span key={browser} className="bg-blue-100 text-blue-800 px-3 py-1 rounded">
                            {browser}: {count}
                        </span>
                    ))}
                </div>

                <h2 className="text-lg font-semibold mb-2">Source Stats:</h2>
                <div className="flex flex-wrap gap-2 mb-6">
                    {Object.entries(sourceCounts).map(([source, count]) => (
                        <span key={source} className="bg-green-100 text-green-800 px-3 py-1 rounded">
                            {source}: {count}
                        </span>
                    ))}
                </div>

                <h2 className="text-lg font-semibold mb-2">Visit Logs:</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full border text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-2 py-1">Time</th>
                                <th className="border px-2 py-1 hidden sm:table-cell">IP</th>
                                <th className="border px-2 py-1 hidden sm:table-cell">User Agent</th>
                                <th className="border px-2 py-1 hidden sm:table-cell">Browser</th>
                                <th className="border px-2 py-1">Source</th>
                                {/* <th className="border px-2 py-1">Visit Count</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log._id} className="even:bg-gray-50">
                                    <td className="border px-2 py-1">{new Date(log.timestamp).toLocaleString()}</td>
                                    <td className="border px-2 py-1 hidden sm:table-cell">{log.ip}</td>
                                    <td className="border px-2 py-1 break-all hidden sm:table-cell">{log.userAgent}</td>
                                    <td className="border px-2 py-1 hidden sm:table-cell">{log.browser || '-'}</td>
                                    <td className="border px-2 py-1">{log.source || '-'}</td>
                                    {/* <td className="border px-2 py-1">{log.source ? sourceCounts[log.source] : 1}</td> */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-center items-center gap-4 mt-6">
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page <= 1}
                        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span>Page {page} of {totalPages}</span>
                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= totalPages}
                        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
