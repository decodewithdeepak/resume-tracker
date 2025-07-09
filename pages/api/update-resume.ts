import type { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';
import { IncomingForm } from 'formidable';
import type { File as FormidableFile } from 'formidable';

// Disable body parser for file upload
export const config = {
    api: {
        bodyParser: false,
    },
};

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
    secure: true,
});

// Test Cloudinary connection on every API call
cloudinary.api.ping()
    .then((result) => {
        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.log('Cloudinary connection successful:', result);
        }
    })
    .catch((err) => {
        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.log('Cloudinary connection failed:', err.message);
        }
    });

// Parse form using formidable
const parseForm = (req: NextApiRequest): Promise<{ file: FormidableFile }> => {
    return new Promise((resolve, reject) => {
        const form = new IncomingForm({ keepExtensions: true });
        form.parse(req, (err, fields, files) => {
            const file = files.resume;
            if (err || !file) return reject(err || new Error('No file uploaded'));
            resolve({ file: Array.isArray(file) ? file[0] : file });
        });
    });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

    try {
        const { file } = await parseForm(req);

        const result = await cloudinary.uploader.upload(file.filepath, {
            resource_type: 'image',
            public_id: 'resume', // fixed URL
            overwrite: true,
            invalidate: true, // clear cache
        });

        return res.status(200).json({ message: 'Resume uploaded', url: result.secure_url });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        return res.status(500).json({ error: message });
    }
}
