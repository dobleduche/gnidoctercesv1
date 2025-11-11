
import React from 'react';

export const DotIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="4" />
    </svg>
);