import React from 'react';
export const BackendAgentIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20V10" />
        <path d="M12 10L8 6" />
        <path d="M12 10l4-4" />
        <path d="M12 20l-4 4" />
        <path d="M12 20l4 4" />
        <path d="M4 12H2" />
        <path d="M10 12H8" />
        <path d="M16 12h-2" />
        <path d="M22 12h-2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="12" cy="2" r="2" />
    </svg>
);
