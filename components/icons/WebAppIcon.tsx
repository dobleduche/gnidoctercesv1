import React from 'react';

export const WebAppIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="18" rx="2" ry="2"></rect>
        <line x1="2" y1="8" x2="22" y2="8"></line>
        <line x1="5" y1="5" x2="5.01" y2="5"></line>
        <line x1="8" y1="5" x2="8.01" y2="5"></line>
    </svg>
);
