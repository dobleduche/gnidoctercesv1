
import React from 'react';
import { AgentStatus } from '../types';
import { CheckIcon } from './icons/CheckIcon';
import { CogIcon } from './icons/CogIcon';
import { ErrorIcon } from './icons/ErrorIcon';
import { RetryIcon } from './icons/RetryIcon';
import { DotIcon } from './icons/DotIcon';

interface AgentStatusCardProps {
  agent: AgentStatus;
  onRetry: (agentId: string) => void;
  retryingAgentId: string | null;
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
};

const AgentStatusCard: React.FC<AgentStatusCardProps> = ({ agent, onRetry, retryingAgentId }) => {
  const config = statusConfig[agent.status];
  const Icon = agent.status === 'pending' ? agent.avatar : (config as any).Icon;
  const { color, ringColor } = config;
  const isRunning = agent.status === 'running';
  const isRetrying = agent.id === retryingAgentId;
  const isAutoRetrying = isRunning && agent.retries > 0;

  const circumference = 2 * Math.PI * 20;
  const progress = agent.status === 'success' ? 100 : (isRunning ? 50 : 0);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`group relative p-3 rounded-lg border bg-glass-bg flex flex-col items-center text-center transition-all duration-300 w-full ${
        isRetrying 
            ? 'border-warning' 
            : isRunning
                ? 'border-cyan/50 animate-border-pulse-cyan' 
                : 'border-glass-border'
    }`}>
        <div className="absolute bottom-full mb-2 w-full p-2 text-xs bg-dark-secondary text-gray-200 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-lg border border-glass-border text-center">
            {agent.description}
        </div>

        {isRetrying && (
            <div className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-warning text-dark-bg text-[9px] font-bold rounded-full animate-pulse tracking-wider">
                RETRYING
            </div>
        )}
        <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="absolute w-full h-full" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="20" strokeWidth="2" className="stroke-gray-700/50" fill="none" />
                <circle 
                    cx="22" cy="22" r="20" strokeWidth="2" 
                    className={`${ringColor} transition-all duration-500`} 
                    fill="none" 
                    strokeLinecap="round"
                    transform="rotate(-90 22 22)"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                />
            </svg>
            <div className={`absolute w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
              <Icon className={`h-7 w-7 ${isRunning ? 'animate-spin' : ''}`} />
            </div>
        </div>

        <h3 className={`font-bold text-sm mt-3 ${color}`}>{agent.name}</h3>
        {isAutoRetrying ? (
            <p className="text-xs text-yellow-400 capitalize">Retrying ({agent.retries}/2)...</p>
        ) : (
            <p className="text-xs text-gray-400 capitalize">{agent.status}</p>
        )}

        {agent.subtasks && (agent.status === 'running' || agent.status === 'success') && (
            <div className="mt-2 w-full text-left text-xs space-y-2 overflow-hidden">
                {agent.subtasks.map((subtask, index) => (
                    <div key={index} className="w-full" title={subtask.name}>
                        <div className="flex items-center gap-1.5 truncate">
                            {subtask.status === 'running' && <CogIcon className="h-3 w-3 text-cyan-400 animate-spin flex-shrink-0" />}
                            {subtask.status === 'success' && <CheckIcon className="h-3 w-3 text-green-400 flex-shrink-0" />}
                            {subtask.status === 'pending' && <DotIcon className="h-3 w-3 text-gray-600 flex-shrink-0" />}
                            <span className={`truncate ${
                                subtask.status === 'running' ? 'text-cyan-400' :
                                subtask.status === 'success' ? 'text-gray-400' :
                                'text-gray-600'
                            }`}>{subtask.name}</span>
                        </div>
                        {subtask.status === 'running' && (
                            <div className="mt-1 w-full bg-cyan/20 h-1 rounded-full overflow-hidden">
                                <div className="h-full w-full rounded-full bg-gradient-to-r from-transparent via-cyan to-transparent animate-upgrade-shimmer bg-[length:200%_100%]"></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}

      {agent.status === 'error' && (
        <div className="mt-2 w-full">
          <p className="text-xs text-red-300 font-mono mb-2 truncate" title={agent.errorMessage}>{agent.errorMessage}</p>
          <button
            onClick={() => onRetry(agent.id)}
            disabled={isRetrying}
            className="w-full flex items-center justify-center gap-1.5 px-2 py-1 text-xs bg-red-500/20 text-red-300 rounded hover:bg-red-500/40 transition-colors disabled:opacity-50 disabled:cursor-wait"
          >
            {isRetrying ? (
              <>
                <CogIcon className="h-3 w-3 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RetryIcon className="h-3 w-3" />
                Retry
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(AgentStatusCard);