import React, { useState, useEffect } from 'react';
import { CogIcon } from './icons/CogIcon';
import { RefinedPrompt } from '../types';

interface PromptEngineerProps {
  originalPrompt: string;
  engineeredPrompt: RefinedPrompt | null;
  onProceed: () => void;
}

const BlueprintSection: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
  <div className="mb-3">
    <h4 className="font-semibold text-gray-300">{title}:</h4>
    <ul className="list-disc list-inside pl-4 text-gray-400">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </div>
);

const PromptEngineer: React.FC<PromptEngineerProps> = ({
  originalPrompt,
  engineeredPrompt,
  onProceed,
}) => {
  const [displayedFinalPrompt, setDisplayedFinalPrompt] = useState('');

  const isEngineeringComplete =
    engineeredPrompt && displayedFinalPrompt.length === engineeredPrompt.final_prompt.length;

  useEffect(() => {
    if (engineeredPrompt?.final_prompt) {
      let i = 0;
      setDisplayedFinalPrompt('');
      const interval = setInterval(() => {
        setDisplayedFinalPrompt(engineeredPrompt.final_prompt.substring(0, i));
        i++;
        if (i > engineeredPrompt.final_prompt.length) {
          clearInterval(interval);
        }
      }, 20);
      return () => clearInterval(interval);
    }
  }, [engineeredPrompt]);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-left p-6 bg-glass-bg border border-glass-border rounded-2xl">
      <h2 className="text-xl font-orbitron font-bold text-cyan mb-4 self-start flex items-center gap-2">
        <CogIcon className="h-6 w-6 animate-spin" />
        Engineering Prompt...
      </h2>

      <div className="w-full space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Your Initial Idea:</h3>
          <p className="text-sm p-3 bg-dark-bg/30 rounded-lg border border-glass-border italic text-gray-300">
            "{originalPrompt}"
          </p>
        </div>

        <div className="min-h-[200px]">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">AI-Refined Blueprint:</h3>
          {!engineeredPrompt ? (
            <div className="text-center py-8">
              <p className="text-cyan animate-pulse">Analyzing and refining your request...</p>
            </div>
          ) : (
            <div className="space-y-3 text-sm p-3 bg-dark-bg/30 rounded-lg border border-cyan/50 text-gray-200">
              {engineeredPrompt.goals.length > 0 && (
                <BlueprintSection title="Goals" items={engineeredPrompt.goals} />
              )}
              {engineeredPrompt.stack.length > 0 && (
                <BlueprintSection title="Tech Stack" items={engineeredPrompt.stack} />
              )}
              {engineeredPrompt.constraints.length > 0 && (
                <BlueprintSection title="Constraints" items={engineeredPrompt.constraints} />
              )}

              <div className="pt-2">
                <h4 className="font-semibold text-gray-300">Final Prompt:</h4>
                <div className="font-mono whitespace-pre-wrap">
                  {displayedFinalPrompt}
                  {!isEngineeringComplete && <span className="animate-ping">_</span>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onProceed}
        disabled={!isEngineeringComplete}
        className="group relative inline-flex items-center justify-center px-8 py-3 mt-8 text-lg font-bold text-white bg-gradient-to-r from-magenta to-cyan rounded-full overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-neon-magenta focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg focus:ring-cyan"
      >
        <span className="absolute inset-0 bg-dark-bg transition-all duration-300 group-hover:opacity-0"></span>
        <span className="relative">Proceed to Build</span>
      </button>
    </div>
  );
};

export default React.memo(PromptEngineer);
