import React from 'react';
import { motion } from 'framer-motion';
import { AgentStatus, Commit } from '../types';
import AgentStatusCard from './AgentStatusCard';
import GitHistory from './GitHistory';

interface AgentPipelineProps {
  agentStatuses: AgentStatus[];
  onRetryAgent: (agentId: string) => void;
  retryingAgentId: string | null;
  commitHistory: Commit[];
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
    // FIX: Add `as const` to the transition type to satisfy Framer Motion's strict typing.
    // This ensures TypeScript infers the type as the literal 'spring' instead of the broader 'string'.
    transition: { type: 'spring' as const, stiffness: 120, damping: 12 },
  },
};

const AgentPipeline: React.FC<AgentPipelineProps> = ({ agentStatuses, onRetryAgent, retryingAgentId, commitHistory }) => {
  const radius = 220; // Radius for the circular layout on desktop
  
  return (
    <div className="w-full flex flex-col items-center gap-12">
      <div className="w-full flex justify-center items-center py-12 min-h-[400px] md:min-h-[600px]">
        <div className="relative w-full h-full flex justify-center items-center">
          {/* Central Hub */}
          <div className="absolute w-24 h-24 md:w-32 md:h-32 bg-cyan/10 rounded-full flex items-center justify-center animate-pulse-glow">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-cyan/20 rounded-full flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-12 h-12 md:w-16 md:h-16 text-cyan animate-spin" style={{animationDuration: '10s'}}>
                  <path id="circlePath" fill="none" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
                  <text fill="currentColor" fontSize="11">
                      <textPath href="#circlePath">
                          PROMPT ANALYSIS ACTIVE - REFINING -
                      </textPath>
                  </text>
              </svg>
            </div>
          </div>

          {/* Agents in a circle - Desktop Layout */}
          <motion.div
            className="absolute hidden md:block"
            animate={{ rotate: 360 }}
            transition={{ duration: 150, repeat: Infinity, ease: 'linear' }}
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
                  <motion.div
                    key={agent.id}
                    className="absolute"
                    // FIX: move transform properties 'x' and 'y' from the style object to direct props.
                    style={{
                      // Position the card's anchor point at the center of the container for proper rotation
                      top: '50%',
                      left: '50%',
                    }}
                    x='-50%'
                    y='-50%'
                    variants={itemVariants}
                    animate={{
                      translateX: x,
                      translateY: y,
                      rotate: -360, // Counter-rotate the card to keep it upright
                    }}
                    transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                  >
                    <AgentStatusCard
                      agent={agent}
                      onRetry={onRetryAgent}
                      retryingAgentId={retryingAgentId}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Mobile horizontal scroll layout */}
          <div className="md:hidden w-full">
              <h2 className="text-xl md:text-2xl font-orbitron font-bold text-center mb-6 text-cyan tracking-wider">AGENT PIPELINE ACTIVE</h2>
              <ul className="no-scrollbar flex gap-4 overflow-x-auto pb-4 px-[calc(50%_-_6rem)] sm:px-[calc(50%_-_7rem)] snap-x snap-mandatory">
                  {agentStatuses.map((agent, index) => (
                      <li key={agent.id} className="w-48 sm:w-56 flex-shrink-0 snap-center" style={{ animationDelay: `${index * 50}ms`, opacity: 0, animation: 'agent-enter 0.5s ease forwards' }}>
                          <AgentStatusCard 
                              agent={agent} 
                              onRetry={onRetryAgent}
                              retryingAgentId={retryingAgentId}
                          />
                      </li>
                  ))}
              </ul>
          </div>
        </div>
      </div>
      <GitHistory commits={commitHistory} />
    </div>
  );
};

export default React.memo(AgentPipeline);