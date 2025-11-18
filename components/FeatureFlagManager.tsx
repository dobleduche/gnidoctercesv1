import React from 'react';
import { useFeatureFlags } from '../lib/featureFlags';
import { FeatureFlagId } from '../types';

const FeatureFlagManager: React.FC = () => {
  const { flags, updateFlag } = useFeatureFlags();

  const handleToggle = (flag: FeatureFlagId) => {
    updateFlag(flag, !flags[flag]);
  };

  return (
    <div className="bg-glass-bg border border-glass-border p-4 rounded-lg mt-8 w-full max-w-md mx-auto">
      <h3 className="font-bold text-center text-gray-300 mb-3 font-orbitron tracking-wide">Feature Flags (Dev Panel)</h3>
      <div className="space-y-2">
        {Object.keys(flags).map(key => {
          const flagId = key as FeatureFlagId;
          return (
            <label key={flagId} className="flex items-center justify-between p-2 bg-dark-secondary rounded-md cursor-pointer hover:bg-white/5 transition-colors">
              <span className="text-sm text-gray-200 font-mono">{flagId}</span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={flags[flagId]}
                  onChange={() => handleToggle(flagId)}
                  className="sr-only peer"
                  aria-label={`Toggle ${flagId}`}
                />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan"></div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default FeatureFlagManager;
