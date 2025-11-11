import React, { useState, useEffect, useCallback } from 'react';
import { CogIcon } from './icons/CogIcon';
import { ErrorIcon } from './icons/ErrorIcon';
import { RetryIcon } from './icons/RetryIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { safeFetch } from '../lib/network';

// --- TypeScript Interfaces for Anthropic API ---

interface ContentBlock {
  type: 'text';
  text: string;
}

interface AnthropicResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  model: string;
  content: ContentBlock[];
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  error?: { type: string, message: string };
}

const AnthropicFetcher: React.FC = () => {
  const [data, setData] = useState<AnthropicResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Calls the new, secure server-side proxy instead of the public Anthropic API
      const { response, data: parsedData } = await safeFetch<AnthropicResponse>('/api/proxy/anthropic', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 1024,
          messages: [{ role: 'user', content: 'Tell me a short, futuristic joke about AI.' }],
        }),
      });
      
      if (!response.ok) {
        throw new Error(parsedData.error?.message || (parsedData as any).error || `API Error: ${response.status} ${response.statusText}`);
      }
      
      setData(parsedData);

    } catch (err) {
      console.error("Anthropic fetch failed:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data when the component mounts
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRetry = () => {
    fetchData();
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-cyan">
          <CogIcon className="h-8 w-8 animate-spin" />
          <p className="mt-4">Fetching response from Claude...</p>
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

    if (data && data.content && data.content.length > 0) {
      return (
         <div className="p-6">
            <h3 className="flex items-center gap-2 font-bold text-cyan mb-3">
                <SparklesIcon className="h-5 w-5" />
                Claude's Response:
            </h3>
            <div className="bg-dark-bg/50 p-4 rounded-lg border border-glass-border">
                <p className="text-gray-300 whitespace-pre-wrap font-sans">
                    {data.content[0].text}
                </p>
            </div>
            <details className="mt-4 text-xs text-gray-500">
                <summary className="cursor-pointer">View Raw Response</summary>
                <pre className="mt-2 p-2 bg-dark-bg text-gray-400 rounded-md text-[10px] max-h-48 overflow-auto no-scrollbar">
                    {JSON.stringify(data, null, 2)}
                </pre>
            </details>
         </div>
      );
    }

    return <div className="p-8 text-center text-gray-500">No data received.</div>;
  };

  return (
    <div className="w-full bg-glass-bg border border-glass-border rounded-xl backdrop-blur-md transition-all duration-300 min-h-[150px]">
      {renderContent()}
    </div>
  );
};

export default React.memo(AnthropicFetcher);