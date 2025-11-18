import React, { useState, useEffect, useCallback } from 'react';
import { CogIcon } from './icons/CogIcon';
import { ErrorIcon } from './icons/ErrorIcon';
import { RetryIcon } from './icons/RetryIcon';
import { CheckIcon } from './icons/CheckIcon';
import { GeminiIcon } from './icons/GeminiIcon';
import { OpenAIIcon } from './icons/OpenAIIcon';
import { AnthropicIcon } from './icons/AnthropicIcon';
import { InfoIcon } from './icons/InfoIcon';
import { safeFetch } from '../lib/network';
import { EyeIcon } from './icons/EyeIcon';
import { EyeOffIcon } from './icons/EyeOffIcon';
import { DeepseekIcon } from './icons/DeepseekIcon';
import { XAIIcon } from './icons/XAIIcon';

type KeyStatus = {
  gemini: boolean;
  openai: boolean;
  anthropic: boolean;
  deepseek: boolean;
  xai: boolean;
};

const keyInfo = {
  gemini: { name: 'Google Gemini', Icon: GeminiIcon, envVar: 'GEMINI_API_KEY' },
  openai: { name: 'OpenAI (Non-GPT-4)', Icon: OpenAIIcon, envVar: 'OPENAI_API_KEY' },
  anthropic: { name: 'Anthropic Claude', Icon: AnthropicIcon, envVar: 'ANTHROPIC_API_KEY' },
  deepseek: { name: 'DeepSeek', Icon: DeepseekIcon, envVar: 'DEEPSEEK_API_KEY' },
  xai: { name: 'xAI Grok', Icon: XAIIcon, envVar: 'XAI_API_KEY' },
};

const APIKeyConfigurator: React.FC = () => {
  const [status, setStatus] = useState<KeyStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});

  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await safeFetch<{ ok: boolean; status: KeyStatus; error?: string }>('/api/ai/key-status');
      if (!data.ok) {
        throw new Error(data.error || 'Failed to fetch key status.');
      }
      setStatus(data.status);
    } catch (err) {
      console.error("API Key status fetch failed:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const toggleReveal = (key: string) => {
    setRevealedKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-cyan">
          <CogIcon className="h-8 w-8 animate-spin" />
          <p className="mt-4">Checking server configuration...</p>
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
            onClick={fetchStatus}
            className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-2 text-sm bg-red-500/20 hover:bg-red-500/40 text-red-200 rounded-md transition-colors"
          >
            <RetryIcon className="h-4 w-4" />
            Retry
          </button>
        </div>
      );
    }

    if (status) {
      return (
        <div className="p-4 md:p-6">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-dark-bg/50 border border-glass-border mb-6">
            <InfoIcon className="h-5 w-5 text-cyan flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-300 font-semibold">
                Multi-Model AI Orchestration System
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Configure API keys as environment variables in your <code className="bg-gray-700 px-1.5 py-0.5 rounded text-xs">.env</code> file. Keys are securely stored on the server and never exposed to the frontend.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {(Object.keys(keyInfo) as Array<keyof typeof keyInfo>).map((key) => {
              const info = keyInfo[key];
              if (!info) return null;
              const isConfigured = status[key as keyof KeyStatus];
              const isRevealed = revealedKeys[key];
              return (
                <div 
                  key={key} 
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    isConfigured 
                      ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/15' 
                      : 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/15'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <info.Icon className="h-6 w-6 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-200">{info.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-mono text-gray-400">
                          {isRevealed ? info.envVar : '●'.repeat(info.envVar.length)}
                        </p>
                        <button 
                          onClick={() => toggleReveal(key)} 
                          className="text-gray-500 hover:text-gray-300 transition-colors"
                          aria-label={`Toggle visibility of ${info.name} variable name`}
                        >
                          {isRevealed ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-2.5 py-1 text-xs font-bold rounded-full ${
                    isConfigured 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {isConfigured ? <CheckIcon className="h-3 w-3" /> : <ErrorIcon className="h-3 w-3" />}
                    <span>{isConfigured ? 'Configured' : 'Not Configured'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-full bg-glass-bg border border-glass-border rounded-xl backdrop-blur-md min-h-[150px] shadow-lg">
      {renderContent()}
    </div>
  );
};

export default React.memo(APIKeyConfigurator);
