import React from 'react';
import { motion } from 'framer-motion';
import { AgentStatus, Commit, GenerationState } from '../types';
import AgentStatusCard from './AgentStatusCard';
import GitHistory from './GitHistory';

interface AgentPipelineProps {
  agentStatuses: AgentStatus[];
  commitHistory: Commit[];
  generationState: GenerationState;
  onReset: () => void;
  onAgentClick: (agent: AgentStatus) => void;
}

// Animation variants for staggered entrance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 120, damping: 12 },
  },
};

const AgentPipeline: React.FC<AgentPipelineProps> = ({
  agentStatuses,
  commitHistory,
  generationState,
  onReset,
  onAgentClick,
}) => {
  const radius = 220; // Radius for the circular layout on desktop

  return (
    <div className="w-full flex flex-col items-center gap-12">
      <div className="w-full flex justify-center items-center py-12 min-h-[400px] md:min-h-[600px]">
        <div className="relative w-full h-full flex justify-center items-center">
          {/* Central Hub */}
          <div
            className="absolute w-24 h-24 md:w-32 md:h-32 bg-cyan/10 rounded-full flex items-center justify-center animate-pulse-glow"
            role="status"
            aria-live="polite"
            aria-label="Build process active"
          >
            <div className="w-16 h-16 md:w-24 md:h-24 bg-cyan/20 rounded-full flex items-center justify-center">
              <svg
                viewBox="0 0 100 100"
                className="w-12 h-12 md:w-16 md:h-16 text-cyan animate-spin"
                style={{ animationDuration: '10s' }}
                aria-hidden="true"
              >
                <path
                  id="circlePath"
                  fill="none"
                  d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                />
                <text fill="currentColor" fontSize="11">
                  <textPath href="#circlePath">BUILD PROCESS ACTIVE - EXECUTING -</textPath>
                </text>
              </svg>
            </div>
          </div>

          {/* Agents in a circle - Desktop Layout */}
          <motion.div
            className="absolute hidden md:block"
            animate={{ rotate: 360 }}
            transition={{ duration: 150, repeat: Infinity, ease: 'linear' }}
            role="list"
          >
            <motion.div
              className="relative w-full h-full"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {agentStatuses.map((agent, index) => {
                const angle = (index / agentStatuses.length) * 2 * Math.PI;
                const x = radius * Math.cos(angle - Math.PI / 2);
                const y = radius * Math.sin(angle - Math.PI / 2);

                return (
                  // FIX: Removed 'x' and 'y' props which caused a type error.
                  // The centering transform ('translate(-50%, -50%)') is now combined
                  // with the positioning transform using CSS calc().
                  <motion.div
                    key={agent.id}
                    className="absolute"
                    style={{
                      top: '50%',
                      left: '50%',
                    }}
                    variants={itemVariants}
                    animate={{
                      translateX: `calc(${x}px - 50%)`,
                      translateY: `calc(${y}px - 50%)`,
                      rotate: -360,
                    }}
                    transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                    role="listitem"
                  >
                    <AgentStatusCard agent={agent} onClick={onAgentClick} />
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Mobile horizontal scroll layout */}
          <div className="md:hidden w-full">
            <h2 className="text-xl md:text-2xl font-orbitron font-bold text-center mb-6 text-cyan tracking-wider">
              AGENT PIPELINE ACTIVE
            </h2>
            <ul className="no-scrollbar flex gap-4 overflow-x-auto pb-4 px-[calc(50%_-_6rem)] sm:px-[calc(50%_-_7rem)] snap-x snap-mandatory">
              {agentStatuses.map((agent, index) => (
                <li
                  key={agent.id}
                  className="w-48 sm:w-56 flex-shrink-0 snap-center"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    opacity: 0,
                    animation: 'agent-enter 0.5s ease forwards',
                  }}
                >
                  <AgentStatusCard agent={agent} onClick={onAgentClick} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {generationState === GenerationState.ERROR && (
        <div
          className="text-center p-4 bg-red-900/50 border border-red-500 rounded-lg"
          role="alert"
        >
          <p className="text-red-300 mb-4">The build process encountered an unrecoverable error.</p>
          <button
            onClick={onReset}
            className="px-6 py-2 bg-red-500/20 text-red-200 rounded-md hover:bg-red-500/40 transition-colors font-bold"
          >
            Start Over
          </button>
        </div>
      )}

      <GitHistory commits={commitHistory} />
    </div>
  );
};

export default React.memo(AgentPipeline);
