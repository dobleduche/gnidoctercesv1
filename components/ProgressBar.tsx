import React from 'react';
import { AgentStatus } from '../types';
import { CogIcon } from './icons/CogIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ErrorIcon } from './icons/ErrorIcon';
import { DotIcon } from './icons/DotIcon';

interface ProgressBarProps {
  progress: number;
  agentStatuses: AgentStatus[];
}

const statusConfig = {
  pending: { Icon: DotIcon, color: 'text-gray-500', bgColor: 'bg-gray-700' },
  running: { Icon: CogIcon, color: 'text-cyan', bgColor: 'bg-cyan' },
  success: { Icon: CheckIcon, color: 'text-green-400', bgColor: 'bg-green-500' },
  error: { Icon: ErrorIcon, color: 'text-red-400', bgColor: 'bg-red-500' },
};

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, agentStatuses }) => {
  const roundedProgress = Math.round(progress);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4 px-1">
        <span className="text-sm font-semibold text-gray-400">Agent Pipeline Status</span>
        <span className="text-lg font-orbitron font-bold text-cyan">{roundedProgress}%</span>
      </div>
      
      <div className="relative w-full">
        {/* Background line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-glass-bg rounded-full -translate-y-1/2"></div>
        {/* Progress line */}
        <div
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-magenta to-cyan rounded-full -translate-y-1/2 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
        
        {/* Agent status icons */}
        <div className="relative flex justify-between items-center w-full">
          {agentStatuses.map((agent) => {
            const config = statusConfig[agent.status];
            const Icon = config.Icon;
            const isRunning = agent.status === 'running';

            return (
              <div key={agent.id} className="group relative">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 border-dark-bg transition-all duration-300 ${agent.status === 'pending' ? 'bg-gray-600' : config.bgColor}`}>
                  <Icon className={`h-4 w-4 text-white ${isRunning ? 'animate-spin' : ''}`} />
                </div>
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 text-xs bg-dark-secondary text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {agent.name}
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