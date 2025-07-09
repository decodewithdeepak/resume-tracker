import { useEffect, useState } from 'react';

const HomePage = () => {
    useEffect(() => {
        const source = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
        fetch('/api/ping', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ source }),
        });
    }, []);

    const [resumeUrl, setResumeUrl] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/resume-url')
            .then((res) => res.json())
            .then((data) => setResumeUrl(data.url))
            .catch(() => setResumeUrl(null));
    }, []);

    return (
        <iframe
            id="resume-frame"
            src={resumeUrl || ''}
            width="100%"
            height="1000px"
        />
    );
};

export default HomePage;