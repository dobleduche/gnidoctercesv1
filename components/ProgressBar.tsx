import React from 'react';
import { motion } from 'framer-motion';
import { AgentStatus } from '../types';
import { CogIcon } from './icons/CogIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ErrorIcon } from './icons/ErrorIcon';
import { DotIcon } from './icons/DotIcon';
import { RetryIcon } from './icons/RetryIcon';

interface ProgressBarProps {
  progress: number;
  agentStatuses: AgentStatus[];
}

const statusConfig = {
  pending: { Icon: DotIcon, color: 'text-gray-500', bgColor: 'bg-gray-700' },
  running: { Icon: CogIcon, color: 'text-cyan', bgColor: 'bg-cyan' },
  success: { Icon: CheckIcon, color: 'text-green-400', bgColor: 'bg-green-500' },
  error: { Icon: ErrorIcon, color: 'text-red-400', bgColor: 'bg-red-500' },
  retrying: { Icon: RetryIcon, color: 'text-yellow-400', bgColor: 'bg-yellow-500' },
};

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, agentStatuses }) => {
  const roundedProgress = Math.round(progress);

  return (
    <div
      className="w-full max-w-4xl mx-auto"
      role="progressbar"
      aria-valuenow={roundedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Build progress is ${roundedProgress} percent`}
    >
      <div className="flex justify-between items-center mb-4 px-1">
        <span className="text-sm font-semibold text-gray-400">Agent Pipeline Status</span>
        <span className="text-lg font-orbitron font-bold text-cyan" aria-hidden="true">
          {roundedProgress}%
        </span>
      </div>

      <div className="relative w-full">
        {/* Background line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-glass-bg rounded-full -translate-y-1/2"></div>
        {/* Progress line */}
        <motion.div
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-magenta to-cyan rounded-full -translate-y-1/2"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20, mass: 1 }}
        />

        {/* Agent status icons */}
        <div className="relative flex justify-between items-center w-full">
          {agentStatuses.map((agent) => {
            const config = statusConfig[agent.status];
            const Icon = config.Icon;
            const isRunning = agent.status === 'running';
            const isRetrying = agent.status === 'retrying';

            return (
              <div key={agent.id} className="group relative focus:outline-none" tabIndex={0}>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center border-2 border-dark-bg transition-all duration-300 ${agent.status === 'pending' ? 'bg-gray-600' : config.bgColor}`}
                >
                  <Icon
                    className={`h-4 w-4 text-white ${isRunning || isRetrying ? 'animate-spin' : ''}`}
                    aria-hidden="true"
                  />
                </div>
                <div
                  className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 text-xs bg-dark-secondary text-white rounded-md opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity pointer-events-none z-10"
                  role="tooltip"
                >
                  {agent.name}: {agent.status}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProgressBar);
