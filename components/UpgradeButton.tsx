import React from 'react';
import { motion } from "framer-motion";

interface UpgradeButtonProps {
    onClick: () => void;
    children: React.ReactNode;
    className?: string;
}

const UpgradeButton: React.FC<UpgradeButtonProps> = ({ onClick, children, className = '' }) => {
    const isRoundedFull = className.includes('rounded-full');
    const pulseSpanClass = isRoundedFull ? 'rounded-full' : 'rounded-2xl';

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={`relative rounded-2xl px-5 py-3 font-semibold text-ink bg-gradient-to-r from-cyanCIA via-limeVolt to-nanoYellow shadow-glow border border-white/10 ${className}`}
      style={{ WebkitBackdropFilter: "blur(6px)" }}
    >
      {children}
      <span className={`absolute inset-0 ${pulseSpanClass} animate-pulseTri pointer-events-none`} />
    </motion.button>
  );
}

export default UpgradeButton;
