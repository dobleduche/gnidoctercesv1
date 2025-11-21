import React from 'react';
import { motion } from 'framer-motion';

const AnimatedShinyText: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden ${className}`}
    >
      <span className="relative z-10">{children}</span>
      <motion.div
        className="absolute inset-0 z-0"
        initial={{
          backgroundPosition: '0% 50%',
        }}
        animate={{
          backgroundPosition: ['-200% 50%', '200% 50%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: 'loop',
          ease: 'linear',
        }}
        style={{
          backgroundImage:
            'linear-gradient(110deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
        }}
      />
    </div>
  );
};

export default AnimatedShinyText;
