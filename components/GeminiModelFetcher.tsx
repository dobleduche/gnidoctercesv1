import React, { useState, useEffect, useCallback } from 'react';
import { CogIcon } from './icons/CogIcon';
import { ErrorIcon } from './icons/ErrorIcon';
import { RetryIcon } from './icons/RetryIcon';
import { GeminiIcon } from './icons/GeminiIcon';
import { RefinerAgentIcon } from './icons/agents/RefinerAgentIcon';
import { safeFetch } from '../lib/network';

interface GeminiModel {
  name: string;
  displayName: string;
  description: string;
  version: string;
}

const GeminiModelFetcher: React.FC = () => {
  const [models, setModels] = useState<GeminiModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { response, data } = await safeFetch<{ ok: boolean; models: GeminiModel[]; error?: string }>('/api/ai/list-gemini-models');

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to fetch model list.');
      }

      setModels(data.models);
    } catch (err) {
      console.error("Gemini model fetch failed:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const handleRetry = () => {
    fetchModels();
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-cyan">
          <CogIcon className="h-8 w-8 animate-spin" />
          <p className="mt-4">Fetching available Gemini models...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300">
          <div className="flex items-start gap-3">
            <ErrorIcon className="h-6 w-6 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold">Fetch Failed</h3>
              <p className="text-sm font-mono mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={handleRetry}
            className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-2 text-sm bg-red-500/20 hover:bg-red-500/40 text-red-200 rounded-md transition-colors"
          >
            <RetryIcon className="h-4 w-4" />
            Retry
          </button>
        </div>
      );
    }

    if (models.length > 0) {
      return (
        <div className="p-4 md:p-6">
            <div className="space-y-4">
                {models.map(model => (
                    <div key={model.name} className="p-4 bg-dark-bg/50 border border-glass-border rounded-lg">
                        <div className="flex items-center gap-3">
                            <GeminiIcon className="h-6 w-6 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-gray-200">{model.displayName}</h3>
                                <div className="flex items-center gap-2">
                                  <p className="text-xs font-mono text-cyan">{model.name}</p>
                                  <span className="px-1.5 py-0.5 text-[10px] bg-cyan/10 text-cyan rounded-full font-semibold">{model.version}</span>
                                </div>
                            </div>
                        </div>
                        <p className="mt-3 text-sm text-gray-400">{model.description}</p>
                    </div>
                ))}
            </div>
        </div>
      );
    }

    return <div className="p-8 text-center text-gray-500">No models found.</div>;
  };

  return (
    <div className="w-full bg-glass-bg border border-glass-border rounded-xl backdrop-blur-md transition-all duration-300 min-h-[150px]">
      {renderContent()}
    </div>
  );
};

export default GeminiModelFetcher;