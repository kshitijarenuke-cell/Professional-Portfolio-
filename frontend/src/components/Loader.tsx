import React, { useEffect, useState } from 'react';

export const Loader: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 15) + 10;
      if (current >= 100) {
        current = 100;
        setProgress(100);
        clearInterval(interval);
        setTimeout(() => setLoading(false), 300);
      } else {
        setProgress(current);
      }
    }, 80);

    return () => clearInterval(interval);
  }, []);

  if (!loading) return null;

  return (
    <div id="loader" style={{ opacity: progress === 100 ? 0 : 1, transition: 'opacity 0.4s ease' }}>
      <div className="loader-logo">KR.</div>
      <div className="loader-bar-track">
        <div className="loader-bar-fill" id="loader-bar" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="loader-count" id="loader-count">Loading experience… {progress}%</div>
    </div>
  );
};
