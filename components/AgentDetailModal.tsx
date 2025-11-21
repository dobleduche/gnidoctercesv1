import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentStatus } from '../types';
import { CheckIcon } from './icons/CheckIcon';
import { CogIcon } from './icons/CogIcon';
import { ErrorIcon } from './icons/ErrorIcon';
import { RetryIcon } from './icons/RetryIcon';
import { DotIcon } from './icons/DotIcon';
import { XIcon } from './icons/XIcon';

interface AgentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: AgentStatus | null;
}

const statusConfig = {
  pending: {
    Icon: DotIcon,
    color: 'text-gray-500',
    bgColor: 'bg-gray-700/50',
    name: 'Pending',
  },
  running: {
    Icon: CogIcon,
    color: 'text-cyan',
    bgColor: 'bg-cyan/20',
    name: 'Running',
  },
  success: {
    Icon: CheckIcon,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    name: 'Success',
  },
  error: {
    Icon: ErrorIcon,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    name: 'Error',
  },
  retrying: {
    Icon: RetryIcon,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    name: 'Retrying',
  },
};

const AgentDetailModal: React.FC<AgentDetailModalProps> = ({ isOpen, onClose, agent }) => {
  if (!agent) return null;

  const config = statusConfig[agent.status];
  const AgentAvatar = agent.avatar;

  const subtaskProgress = agent.subtasks
    ? (agent.subtasks.filter((st) => st.status === 'success').length / agent.subtasks.length) * 100
    : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="agent-detail-title"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-dark-bg border-2 border-cyan shadow-neon-cyan rounded-xl p-6 md:p-8 max-w-xl w-full mx-4 relative max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors text-3xl leading-none"
              aria-label="Close"
            >
              <XIcon className="h-6 w-6" />
            </button>

            <header className="flex items-center gap-4 pb-4 border-b border-glass-border">
              <div className={`p-3 rounded-lg ${config.bgColor}`}>
                <AgentAvatar className={`h-10 w-10 ${config.color}`} />
              </div>
              <div>
                <h2
                  id="agent-detail-title"
                  className="text-2xl font-orbitron font-bold text-gray-100"
                >
                  {agent.name}
                </h2>
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 mt-1 rounded-full text-sm font-semibold ${config.bgColor} ${config.color}`}
                >
                  <config.Icon
                    className={`h-4 w-4 ${agent.status === 'running' || agent.status === 'retrying' ? 'animate-spin' : ''}`}
                  />
                  <span>{config.name}</span>
                </div>
              </div>
            </header>

            <div className="flex-grow overflow-y-auto no-scrollbar mt-4 pr-2">
              <p className="text-gray-400 mb-6">{agent.description}</p>

              {(agent.status === 'error' || agent.status === 'retrying') && agent.errorMessage && (
                <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
                  <h3 className="font-bold text-red-300 flex items-center gap-2">
                    <ErrorIcon className="h-5 w-5" />
                    Error Details
                  </h3>
                  <p className="mt-2 font-mono text-sm text-red-400 break-words">
                    {agent.errorMessage}
                  </p>
                  {agent.status === 'retrying' && (
                    <p className="mt-2 text-yellow-300">
                      Attempting to fix... (Retry {agent.retries})
                    </p>
                  )}
                </div>
              )}

              {agent.subtasks && agent.subtasks.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-200 mb-3">Subtasks</h3>
                  <div className="w-full bg-dark-secondary rounded-full h-2.5 mb-4">
                    <div
                      className="bg-cyan h-2.5 rounded-full"
                      style={{ width: `${subtaskProgress}%`, transition: 'width 0.5s ease-in-out' }}
                    ></div>
                  </div>
                  <ul className="space-y-2">
                    {agent.subtasks.map((subtask) => {
                      const subtaskStatusConfig = {
                        pending: { Icon: DotIcon, color: 'text-gray-600' },
                        running: { Icon: CogIcon, color: 'text-cyan' },
                        success: { Icon: CheckIcon, color: 'text-green-500' },
                      };
                      const SubtaskIcon = subtaskStatusConfig[subtask.status].Icon;
                      const subtaskColor = subtaskStatusConfig[subtask.status].color;
                      const isCompleted = subtask.status === 'success';

                      return (
                        <li
                          key={subtask.name}
                          className={`flex items-center gap-3 p-3 bg-dark-secondary/50 rounded-lg ${isCompleted ? 'opacity-70' : ''}`}
                        >
                          <div
                            className={`w-5 h-5 flex items-center justify-center flex-shrink-0 ${subtaskColor}`}
                          >
                            <SubtaskIcon
                              className={`h-5 w-5 ${subtask.status === 'running' ? 'animate-spin' : ''}`}
                            />
                          </div>
                          <span
                            className={`flex-grow text-sm ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-200'}`}
                          >
                            {subtask.name}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            <footer className="mt-6 pt-4 border-t border-glass-border">
              <button
                onClick={onClose}
                className="w-full px-4 py-2 text-sm bg-cyan text-dark-bg font-bold rounded-full hover:bg-cyan/80 transition-colors"
              >
                Close
              </button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(AgentDetailModal);
