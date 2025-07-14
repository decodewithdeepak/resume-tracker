import React from 'react';

const RESUME_PDF_URL = '/Resume.pdf'; // resume is under public folder

const HomePage = () => {
    return (
        <div className="relative">
            <iframe
                id="resume-frame"
                src={RESUME_PDF_URL}
                className="w-full h-[1000px] border-0"
            />
            <a
                href={RESUME_PDF_URL}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700"
                title="Download Resume PDF"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v12m0 0l-4-4m4 4l4-4m-8 8h8" />
                </svg>
            </a>
        </div>
    );
};

export default HomePage;