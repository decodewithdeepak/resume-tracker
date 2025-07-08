import { useEffect } from 'react';
import { useRouter } from 'next/router';

const HomePage = () => {
  const router = useRouter();
  useEffect(() => {
    const source = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '';
    const pingVisit = (location?: string) => {
      fetch('/api/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, source }),
      });
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          pingVisit(`${latitude},${longitude}`);
        },
        () => pingVisit()
      );
    } else {
      pingVisit();
    }
  }, []);

    return (
        <iframe
            src="https://docs.google.com/document/d/1u-cy3Gnt-hzs80Gs59GTW6XQ2ksrnFO_009NVSMzFPU/preview"
            width="100%"
            height="1000px"
            style={{ border: 0 }}
            title="Resume"
        />
    );
};

export default HomePage;