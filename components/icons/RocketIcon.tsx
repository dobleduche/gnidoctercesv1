import React from 'react';

export const RocketIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 2.45a14.98 14.98 0 00-2.58 5.84m2.58 6.16a14.98 14.98 0 00-7.38 5.84m12.12-6.16a14.98 14.98 0 00-5.84 2.58m5.84-2.58l-2.58 5.84m-6.16-12.12l5.84 2.58m-5.84-2.58l2.58-5.84m-2.58 5.84l-5.84-2.58m12.12 6.16l-5.84-2.58"
    />
  </svg>
);
