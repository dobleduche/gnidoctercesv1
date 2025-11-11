import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Collaborator } from '../types';

interface PresenceAvatarsProps {
  collaborators: Collaborator[];
}

const PresenceAvatars: React.FC<PresenceAvatarsProps> = ({ collaborators }) => {
  if (collaborators.length === 0) {
    return <div className="h-10"></div>; // Reserve space
  }

  return (
    <div className="flex flex-col items-center gap-2 h-10">
        <p className="text-xs text-gray-400">Live Collaborators</p>
        <div className="flex -space-x-2">
        <AnimatePresence>
            {collaborators.map((c, index) => (
            <motion.div
                key={c.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ delay: index * 0.1 }}
                className="relative h-6 w-6 rounded-full border-2 border-dark-bg flex items-center justify-center font-bold text-xs text-white"
                style={{ backgroundColor: c.color }}
                title={c.name}
            >
                {c.initials}
            </motion.div>
            ))}
        </AnimatePresence>
        </div>
    </div>
  );
};

export default PresenceAvatars;
