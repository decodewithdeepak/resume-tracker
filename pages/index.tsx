import { useEffect } from 'react';

const HomePage = () => {
    useEffect(() => {
        const source = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
        fetch('/api/ping', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ source }),
        });
    }, []);

    return (
        <iframe
            src="/resume.pdf"
            width="100%"
            height="1000px"
            style={{ border: 0 }}
            title="Resume"
        />
    );
};

export default HomePage;