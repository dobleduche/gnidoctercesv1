import React from 'react';
export const ComplianceAgentIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <path d="M12 12l-4-4" />
    <path d="M12 12l4 4" />
    <path d="M12 12l4-4" />
    <path d="M12 12l-4 4" />
  </svg>
);
