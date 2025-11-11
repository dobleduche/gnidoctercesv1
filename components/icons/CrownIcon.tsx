import React from 'react';

export const CrownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h13.5m-13.5 0a2.25 2.25 0 01-2.25-2.25V5.25c0-1.242.984-2.25 2.207-2.25h13.586c1.223 0 2.207 1.008 2.207 2.25v.75a2.25 2.25 0 01-2.25 2.25m-13.5 0l-1.5 6 3.75-3.75 3.75 3.75-1.5-6" />
  </svg>
);