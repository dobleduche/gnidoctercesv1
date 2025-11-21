import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIModel, FeatureFlags } from '../types';
import { ErrorIcon } from './icons/ErrorIcon';
import ModelSelector from './prompt/ModelSelector';
import ProjectTemplates from './prompt/ProjectTemplates';
import ExamplePrompts from './prompt/ExamplePrompts';
import PromptTextarea from './prompt/PromptTextarea';
import { projectTemplates } from './prompt/promptConstants';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  availableModels: AIModel[];
  selectedModel: AIModel;
  setSelectedModel: (model: AIModel) => void;
  fetchAvailableModels: () => void;
  flags: FeatureFlags;
  includeAuth: boolean;
  setIncludeAuth: (value: boolean) => void;
  includeBilling: boolean;
  setIncludeBilling: (value: boolean) => void;
  setTarget: (value: string) => void;
  setStack: (value: string) => void;
}

const PromptInput: React.FC<PromptInputProps> = ({
  prompt,
  setPrompt,
  onGenerate,
  isLoading,
  availableModels,
  selectedModel,
  setSelectedModel,
  fetchAvailableModels,
  flags,
  includeAuth,
  setIncludeAuth,
  includeBilling,
  setIncludeBilling,
  setTarget,
  setStack,
}) => {
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  const isGenerationDisabled = isLoading || availableModels.length === 0;

  useEffect(() => {
    fetchAvailableModels();
  }, [fetchAvailableModels]);

  const handleTemplateSelect = (template: (typeof projectTemplates)[0]) => {
    setPrompt(template.prompt);
    setActiveTemplate(template.name);
    setTarget(template.target);
    setStack(template.stack);
  };

  const handlePromptChange = (newPrompt: string) => {
    setPrompt(newPrompt);
    if (activeTemplate) {
      setActiveTemplate(null);
    }
  };

  if (!flags.ff_ai_features) {
    return (
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center p-8 bg-glass-bg border border-yellow-500/50 rounded-2xl">
        <ErrorIcon className="h-10 w-10 text-yellow-400 mb-4" />
        <h3 className="text-xl font-bold text-yellow-400">AI Features Disabled</h3>
        <p className="mt-2 text-gray-400 text-center">
          The AI generation features are currently turned off by an administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
      <div className="h-10"></div>
      {availableModels.length > 1 && (
        <ModelSelector
          availableModels={availableModels}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          isGenerationDisabled={isGenerationDisabled}
        />
      )}
      <PromptTextarea
        prompt={prompt}
        onChange={handlePromptChange}
        onGenerate={onGenerate}
        isLoading={isLoading}
        isGenerationDisabled={isGenerationDisabled}
      />

      <AnimatePresence>
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-full overflow-hidden"
          >
            <div className="w-full max-w-4xl mx-auto my-6">
              {availableModels.length === 0 && (
                <div
                  className="text-center p-4 mb-4 bg-yellow-900/50 border border-yellow-500 rounded-lg"
                  role="alert"
                >
                  <p className="text-yellow-300">
                    Generation is disabled. Please configure at least one AI provider API key in
                    your <code>.env</code> file to get started.
                  </p>
                </div>
              )}
              <p className="text-sm text-gray-400 text-center mb-4">
                Start with a template or get inspired below.
              </p>

              <ProjectTemplates
                onSelect={handleTemplateSelect}
                activeTemplate={activeTemplate}
                isGenerationDisabled={isGenerationDisabled}
              />

              <div className="flex justify-center items-center gap-6 my-6">
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={includeAuth}
                    onChange={(e) => setIncludeAuth(e.target.checked)}
                    className="w-4 h-4 rounded bg-dark-secondary border-glass-border text-cyan focus:ring-cyan"
                  />
                  Include Auth
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={includeBilling}
                    onChange={(e) => setIncludeBilling(e.target.checked)}
                    className="w-4 h-4 rounded bg-dark-secondary border-glass-border text-cyan focus:ring-cyan"
                  />
                  Include Billing
                </label>
              </div>

              <p className="text-sm text-gray-400 text-center mt-8">
                Or try one of these specific ideas:
              </p>

              <ExamplePrompts onSelect={setPrompt} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(PromptInput);
