import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InfoIcon } from './icons/InfoIcon';
import { ErrorIcon } from './icons/ErrorIcon';
import { XIcon } from './icons/XIcon';
import { CheckIcon } from './icons/CheckIcon';

type NotificationType = 'warning' | 'info' | 'error' | 'success';

interface NotificationProps {
  notification: {
    message: string;
    type: NotificationType;
  } | null;
  onClose: () => void;
}

const notificationConfig: Record<NotificationType, { Icon: React.FC<{ className?: string }>; color: string; borderColor: string }> = {
  warning: { Icon: InfoIcon, color: 'text-yellow-400', borderColor: 'border-yellow-500/50' },
  info: { Icon: InfoIcon, color: 'text-cyan', borderColor: 'border-cyan/50' },
  error: { Icon: ErrorIcon, color: 'text-red-400', borderColor: 'border-red-500/50' },
  success: { Icon: CheckIcon, color: 'text-green-400', borderColor: 'border-green-500/50' },
};

const Notification: React.FC<NotificationProps> = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-md" role="alert" aria-live="assertive">
      <AnimatePresence>
        {notification &&
          (() => {
            // FIX: Assign the dynamic component to a capitalized variable to satisfy JSX syntax rules.
            const config = notificationConfig[notification.type];
            const Icon = config.Icon;
            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: -50, scale: 0.3 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.5 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={`flex items-center gap-4 p-4 rounded-xl shadow-lg bg-glass-bg border ${config.borderColor}`}
              >
                <Icon
                  className={`h-6 w-6 flex-shrink-0 ${config.color}`}
                />
                <span className="flex-grow text-sm text-gray-200">
                  {notification.message}
                </span>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Close notification"
                >
                  <XIcon className="h-4 w-4 text-gray-400" />
                </button>
              </motion.div>
            );
          })()}
      </AnimatePresence>
    </div>
  );
};

export default Notification;