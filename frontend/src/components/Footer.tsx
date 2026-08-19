import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="sp-footer-bar">
      <div className="footer-quote">
        <div className="footer-quote-box">
          <i className="fas fa-quote-left"></i>
        </div>
        <span>
          Code is like art — <span className="accent-highlight">elegance in every line</span>.
        </span>
      </div>
      <div className="footer-copyright">
        © {new Date().getFullYear()} Kshitija Renuke. All rights reserved.<br />
        Built with React, TypeScript, Node.js &amp; PostgreSQL.
      </div>
    </footer>
  );
};
