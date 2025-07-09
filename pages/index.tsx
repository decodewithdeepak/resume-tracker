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
        <div style={{ position: 'relative' }}>
            <iframe
                id="resume-frame"
                src={resumeUrl || ''}
                width="100%"
                height="1000px"
                style={{ border: 0 }}
            />
            {resumeUrl && (
                <a
                    href={resumeUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        position: 'fixed',
                        right: 24,
                        bottom: 24,
                        zIndex: 1000,
                        background: '#2563eb',
                        color: '#fff',
                        borderRadius: '50%',
                        width: 56,
                        height: 56,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        textDecoration: 'none',
                        fontSize: 28,
                        transition: 'background 0.2s',
                    }}
                    title="Download Resume PDF"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v12m0 0l-4-4m4 4l4-4m-8 8h8" />
                    </svg>
                </a>
            )}
        </div>
    );
};

export default HomePage;