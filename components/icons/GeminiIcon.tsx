
import React from 'react';

export const GeminiIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.63605 18.364C3.12602 15.854 3.12602 11.8539 5.63605 9.34391L9.17157 12.8794C8.78105 13.2699 8.78105 13.9031 9.17157 14.2936C9.5621 14.6841 10.1952 14.6841 10.5858 14.2936L14.4853 18.1931C13.2801 19.3983 11.3284 19.3983 10.1232 18.1931L5.63605 13.7071V18.364Z" fill="url(#gemini-gradient-1)"/>
        <path d="M12.7071 11.2929C12.3166 10.9024 11.6834 10.9024 11.2929 11.2929C10.9024 11.6834 10.9024 12.3166 11.2929 12.7071L15.1924 8.8076C13.9872 7.60234 12.0355 7.60234 10.8203 8.8076L6.34315 4.33046C8.85317 1.82043 12.8532 1.82043 15.3632 4.33046L12.7071 6.98681V11.2929Z" fill="url(#gemini-gradient-2)"/>
        <defs>
            <linearGradient id="gemini-gradient-1" x1="5.5" y1="18.5" x2="14.5" y2="9.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4285F4"/>
                <stop offset="1" stopColor="#9B72F4"/>
            </linearGradient>
            <linearGradient id="gemini-gradient-2" x1="15.5" y1="4.5" x2="6.5" y2="13.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4285F4"/>
                <stop offset="1" stopColor="#28B463"/>
            </linearGradient>
        </defs>
    </svg>
);
