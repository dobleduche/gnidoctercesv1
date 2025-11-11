import React from 'react';
import { motion } from 'framer-motion';
import { Commit, Agent } from '../types';
import { AGENT_DEFINITIONS } from '../constants';

interface GitHistoryProps {
  commits: Commit[];
}

const agentMap = new Map<string, Agent>(AGENT_DEFINITIONS.map(agent => [agent.id, agent]));

const GitHistory: React.FC<GitHistoryProps> = ({ commits }) => {
    if (commits.length === 0) {
        return null;
    }

    return (
        <div className="w-full max-w-2xl mx-auto p-4 bg-glass-bg border border-glass-border rounded-lg">
            <h3 className="text-lg font-orbitron font-bold text-center mb-4 text-cyan tracking-wider">Live Commit History</h3>
            <ul className="space-y-0 font-mono text-sm relative border-l border-gray-700/50 ml-3">
                {commits.map((commit) => {
                    const agent = agentMap.get(commit.agentId);
                    const AgentAvatar = agent?.avatar || (() => null);
                    return (
                        <motion.li
                            key={commit.hash}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4 }}
                            className="relative pl-8 py-3"
                        >
                            {/* Git graph dot */}
                            <div className="absolute -left-[7px] top-1/2 -translate-y-1/2 w-3 h-3 bg-cyan rounded-full border-2 border-dark-bg ring-2 ring-cyan/50"></div>

                            <p className="text-cyan">{commit.hash}</p>
                            <p className="text-gray-200 text-base">{commit.message}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                                {agent && <AgentAvatar className="h-4 w-4 rounded-full" />}
                                <strong className="text-gray-300">{commit.author}</strong>
                                <span>committed just now</span>
                            </div>
                        </motion.li>
                    );
                })}
            </ul>
        </div>
    );
};

export default React.memo(GitHistory);
