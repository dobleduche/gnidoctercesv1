import React from 'react';

export const LogoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        viewBox="0 0 256 256" 
        className={className} 
        xmlns="http://www.w3.org/2000/svg"
    >
        <defs>
            <linearGradient id="shield-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff00c9" />
                <stop offset="100%" stopColor="#4e00ff" />
            </linearGradient>
            <linearGradient id="chip-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f9ff" />
                <stop offset="100%" stopColor="#4e00ff" />
            </linearGradient>
            <linearGradient id="brain-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff00c9" />
                <stop offset="100%" stopColor="#ff7f7f" />
            </linearGradient>
             <linearGradient id="face-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f9ff" />
                <stop offset="100%" stopColor="#7fffff" />
            </linearGradient>
        </defs>
        
        {/* Shield */}
        <path 
            d="M128 20L232 75.3V180.7L128 236L24 180.7V75.3L128 20Z" 
            stroke="url(#shield-gradient)" 
            strokeWidth="12"
            fill="#0D0D1A"
        />

        {/* Chip */}
        <rect x="64" y="64" width="128" height="128" rx="12" stroke="url(#chip-gradient)" strokeWidth="6" fill="#0D0D1A" />
        
        {/* Circuit Lines */}
        <path d="M64 96 H 44" stroke="url(#chip-gradient)" strokeWidth="6" strokeLinecap="round" />
        <path d="M64 128 H 44" stroke="url(#chip-gradient)" strokeWidth="6" strokeLinecap="round" />
        <path d="M64 160 H 44" stroke="url(#chip-gradient)" strokeWidth="6" strokeLinecap="round" />
        <path d="M192 96 H 212" stroke="url(#chip-gradient)" strokeWidth="6" strokeLinecap="round" />
        <path d="M192 128 H 212" stroke="url(#chip-gradient)" strokeWidth="6" strokeLinecap="round" />
        <path d="M192 160 H 212" stroke="url(#chip-gradient)" strokeWidth="6" strokeLinecap="round" />
        <path d="M96 64 V 44" stroke="url(#chip-gradient)" strokeWidth="6" strokeLinecap="round" />
        <path d="M128 64 V 44" stroke="url(#chip-gradient)" strokeWidth="6" strokeLinecap="round" />
        <path d="M160 64 V 44" stroke="url(#chip-gradient)" strokeWidth="6" strokeLinecap="round" />
        <path d="M96 192 V 212" stroke="url(#chip-gradient)" strokeWidth="6" strokeLinecap="round" />
        <path d="M128 192 V 212" stroke="url(#chip-gradient)" strokeWidth="6" strokeLinecap="round" />
        <path d="M160 192 V 212" stroke="url(#chip-gradient)" strokeWidth="6" strokeLinecap="round" />

        {/* Split */}
        <line x1="128" y1="80" x2="128" y2="176" stroke="url(#chip-gradient)" strokeWidth="2" />

        {/* Brain */}
        <g fill="url(#brain-gradient)">
             <path d="M116,92 c-4,0-4,4-8,4s-4-4-8-4 c-7.2,0-12,4.8-12,12 c0,6.4,4,8,4,14 s-4,8-4,14 c0,7.2,4.8,12,12,12 c4,0,4-4,8-4s4,4,8,4" stroke="#0D0D1A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
        
        {/* Face */}
        <g fill="none" stroke="url(#face-gradient)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M140 92 C 150 92, 160 102, 160 112" />
            <path d="M160 112 L 150 128 L 160 144" />
            <path d="M160 144 C 160 154, 150 164, 140 164" />
        </g>
    </svg>
);
