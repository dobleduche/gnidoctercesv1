import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentStatus } from '../types';
import { CheckIcon } from './icons/CheckIcon';
import { CogIcon } from './icons/CogIcon';
import { ErrorIcon } from './icons/ErrorIcon';
import { RetryIcon } from './icons/RetryIcon';
import { DotIcon } from './icons/DotIcon';

interface AgentStatusCardProps {
  agent: AgentStatus;
  onClick: (agent: AgentStatus) => void;
}

const statusConfig = {
  pending: {
    color: 'text-gray-500',
    ringColor: 'stroke-gray-700',
  },
  running: {
    Icon: CogIcon,
    color: 'text-cyan',
    ringColor: 'stroke-cyan-500',
  },
  success: {
    Icon: CheckIcon,
    color: 'text-green-400',
    ringColor: 'stroke-green-500',
  },
  error: {
    Icon: ErrorIcon,
    color: 'text-red-400',
    ringColor: 'stroke-red-500',
  },
  retrying: {
    Icon: RetryIcon,
    color: 'text-yellow-400',
    ringColor: 'stroke-yellow-500',
  },
};

const AgentStatusCard: React.FC<AgentStatusCardProps> = ({ agent, onClick }) => {
  const config = statusConfig[agent.status];
  const Icon = agent.status === 'pending' ? agent.avatar : (config as any).Icon;
  const { color, ringColor } = config;
  const isRunning = agent.status === 'running';
  const isRetrying = agent.status === 'retrying';


  const circumference = 2 * Math.PI * 20;
  const progress = agent.status === 'success' ? 100 : (isRunning || isRetrying ? 50 : 0);
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  const descriptionId = `agent-desc-${agent.id}`;
  const titleId = `agent-title-${agent.id}`;

  const showSubtasks = agent.subtasks && agent.subtasks.length > 0 && agent.status !== 'pending';

  const handleClick = useCallback(() => {
    onClick(agent);
  }, [agent, onClick]);

  return (
    <motion.button 
      onClick={handleClick}
      className={`group relative p-3 rounded-lg border bg-glass-bg flex flex-col items-center text-center w-full focus:outline-none focus:ring-2 focus:ring-cyan overflow-hidden ${
        isRunning
            ? 'border-cyan/50 animate-border-pulse-cyan' 
            : isRetrying
                ? 'border-yellow-500/50'
                : agent.status === 'error'
                ? 'border-red-500'
                : 'border-glass-border'
      }`}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      whileHover={{ scale: 1.05, y: -5, boxShadow: '0 10px 20px rgba(0, 249, 255, 0.1)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
        <div 
            id={descriptionId}
            role="tooltip"
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-xs p-2 text-xs bg-dark-secondary text-gray-200 rounded-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity pointer-events-none z-20 shadow-lg border border-glass-border text-center"
        >
            {agent.description}
        </div>

        <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="absolute w-full h-full" viewBox="0 0 44 44" aria-hidden="true">
                <circle cx="22" cy="22" r="20" strokeWidth="2" className="stroke-gray-700/50" fill="none" />
                <motion.circle 
                    cx="22" cy="22" r="20" strokeWidth="2" 
                    className={`${ringColor}`} 
                    fill="none" 
                    strokeLinecap="round"
                    transform="rotate(-90 22 22)"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                />
            </svg>
            <div className={`absolute w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={agent.status}
                  initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon className={`h-7 w-7 ${isRunning || isRetrying ? 'animate-spin' : ''}`} aria-hidden="true" />
                </motion.div>
              </AnimatePresence>
            </div>
        </div>

        <h3 id={titleId} className={`font-bold text-sm mt-3 ${color}`}>{agent.name}</h3>
        <p className="text-xs text-gray-400 capitalize">{agent.status}</p>

      {agent.status === 'error' && (
        <div className="mt-2 w-full">
          <p className="text-xs text-red-300 font-mono break-all" title={agent.errorMessage}>{agent.errorMessage}</p>
        </div>
      )}
      {agent.status === 'retrying' && (
        <div className="mt-2 w-full text-center space-y-1">
          <p className="text-xs text-yellow-300 font-semibold">Applying fix... (Attempt {agent.retries})</p>
          <p className="text-xs text-red-400/80 font-mono break-all truncate" title={agent.errorMessage}>
            Error: {agent.errorMessage}
          </p>
        </div>
      )}

        <AnimatePresence>
            {showSubtasks && (
                <motion.div
                    className="mt-3 w-full border-t border-glass-border pt-3"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <ul className="space-y-1 text-left">
                        {agent.subtasks?.map((subtask) => {
                            const statusIcon = {
                                pending: <DotIcon className="h-4 w-4 text-gray-600" aria-hidden="true" />,
                                running: <CogIcon className="h-4 w-4 text-cyan animate-spin" aria-hidden="true" />,
                                success: <CheckIcon className="h-4 w-4 text-green-500" aria-hidden="true" />,
                            }[subtask.status];

                            const textColor = {
                                pending: 'text-gray-500',
                                running: 'text-gray-200',
                                success: 'text-gray-400 line-through',
                            }[subtask.status];

                            return (
                                <li key={subtask.name} className={`flex items-center gap-2 text-xs ${textColor}`}>
                                    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">{statusIcon}</div>
                                    <span>{subtask.name}</span>
                                </li>
                            );
                        })}
                    </ul>
                </motion.div>
            )}
        </AnimatePresence>

    </motion.button>
  );
};

export default React.memo(AgentStatusCard);