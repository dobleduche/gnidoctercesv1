
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../state/userStore';
import { signOut } from '../hooks/useAuth';
import { XIcon } from './icons/XIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { TIERS } from './OrchestrationScreen'; // Assuming TIERS is exported from here
import { Activity } from '../types';
import { GenerateIcon } from './icons/GenerateIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { UsersIcon } from './icons/UsersIcon';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 5) return "just now";
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}

const ActivityIcon: React.FC<{type: Activity['type']}> = ({ type }) => {
    const iconMap: Record<Activity['type'], React.ReactNode> = {
        generation: <GenerateIcon />,
        upgrade: <SparklesIcon />,
        invite: <UsersIcon />,
    };
    const colorMap: Record<Activity['type'], string> = {
        generation: 'bg-cyan/20 text-cyan',
        upgrade: 'bg-yellow-500/20 text-warning',
        invite: 'bg-magenta/20 text-magenta',
    }
    return <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${colorMap[type]}`}>{iconMap[type]}</div>
}


const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, tier, credits, recentActivity } = useUserStore();

  const handleSignOut = () => {
    signOut();
    onClose();
  };

  const currentTierInfo = TIERS.find(t => t.id === tier);

  return (
    <AnimatePresence>
      {isOpen && user && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="user-profile-title"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-dark-bg border-2 border-cyan shadow-neon-cyan rounded-xl p-6 max-w-lg w-full mx-4 relative max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors text-3xl leading-none" aria-label="Close">
              <XIcon className="h-6 w-6" />
            </button>

            <header className="text-center pb-4 border-b border-glass-border">
              <h2 id="user-profile-title" className="text-2xl font-orbitron font-bold text-gray-100">User Profile</h2>
              <p className="text-gray-400 text-sm mt-1">{user.email}</p>
            </header>
            
            <div className="flex-grow overflow-y-auto no-scrollbar mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-dark-secondary p-4 rounded-lg text-center">
                        <p className="text-sm text-gray-400 mb-1">Current Tier</p>
                        {currentTierInfo && (
                            <div className={`inline-flex items-center gap-2 px-3 py-1 mt-1 rounded-full text-base font-bold ${currentTierInfo.bgColor}/20 ${currentTierInfo.color}`}>
                                <currentTierInfo.Icon className="h-5 w-5" />
                                <span>{currentTierInfo.name}</span>
                            </div>
                        )}
                    </div>
                     <div className="bg-dark-secondary p-4 rounded-lg text-center">
                        <p className="text-sm text-gray-400 mb-1">Credits Remaining</p>
                        <p className="text-2xl font-orbitron font-bold text-gray-100">{credits}</p>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-gray-200 mb-3">Recent Activity</h3>
                    <ul className="space-y-2">
                        {recentActivity.length > 0 ? recentActivity.map(activity => (
                             <li key={activity.id} className="flex items-center gap-3 p-2 bg-dark-secondary/50 rounded-lg">
                                <ActivityIcon type={activity.type} />
                                <div className="flex-grow">
                                    <p className="text-sm text-gray-200">{activity.description}</p>
                                    <p className="text-xs text-gray-500">{timeAgo(activity.timestamp)}</p>
                                </div>
                            </li>
                        )) : (
                            <p className="text-sm text-gray-500 text-center py-4">No recent activity.</p>
                        )}
                    </ul>
                </div>

            </div>

            <footer className="mt-6 pt-4 border-t border-glass-border">
              <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm bg-red-500/20 text-red-300 font-bold rounded-full hover:bg-red-500/40 transition-colors">
                <LogoutIcon className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </footer>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserProfileModal;