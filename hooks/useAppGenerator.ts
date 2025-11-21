import { useState, useCallback, useEffect, useRef } from 'react';
import {
  AgentStatus,
  GenerationState,
  AppGenerationResult,
  AIModel,
  Commit,
  RefinedPrompt,
  TierId,
} from '../types';
import { AGENT_DEFINITIONS } from '../constants';
import { safeFetch } from '../lib/network';
import { useUserStore } from '../state/userStore';

const INITIAL_AGENTS: AgentStatus[] = AGENT_DEFINITIONS.map((agent) => ({
  ...agent,
  status: 'pending',
  retries: 0,
  subtasks: agent.subtasks
    ? agent.subtasks.map((subtask) => ({ ...subtask, status: 'pending' }))
    : undefined,
}));

export type NotificationType = {
  message: string;
  type: 'warning' | 'error' | 'info' | 'success';
};

type UseAppGeneratorProps = {
  selectedTier: TierId;
  selectedModel: AIModel;
  setSelectedModel: (model: AIModel) => void;
};

export const useAppGenerator = ({
  selectedTier,
  selectedModel,
  setSelectedModel: _setSelectedModel,
}: UseAppGeneratorProps) => {
  const [prompt, setPrompt] = useState(() => {
    try {
      return localStorage.getItem('gnidoc-terces-prompt') || '';
    } catch (error) {
      console.warn('Failed to read prompt from localStorage:', error);
      return '';
    }
  });

  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const pollingRef = useRef<number | null>(null);

  const [engineered, setEngineered] = useState<RefinedPrompt | null>(null);
  const [generationState, setGenerationState] = useState<GenerationState>(GenerationState.IDLE);
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>(INITIAL_AGENTS);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<AppGenerationResult | null>(null);
  const [scaffoldedProject, setScaffoldedProject] = useState<{
    projectId: string;
    projectDir: string;
    fileTree: any;
    files: any;
  } | null>(null);
  const [commitHistory, setCommitHistory] = useState<Commit[]>([]);
  const [notification, setNotification] = useState<NotificationType | null>(null);
  const [buildId, setBuildId] = useState<string | null>(null);

  // New state for structured input
  const [includeAuth, setIncludeAuth] = useState(true);
  const [includeBilling, setIncludeBilling] = useState(true);
  const [target, setTarget] = useState('saas-web-app');
  const [stack, setStack] = useState('react-vite');

  useEffect(() => {
    try {
      localStorage.setItem('gnidoc-terces-prompt', prompt);
    } catch (error) {
      console.warn('Failed to save prompt to localStorage:', error);
    }
  }, [prompt]);

  const fetchAvailableModels = useCallback(async () => {
    try {
      const { models } = await safeFetch<{ models: AIModel[] }>('/api/ai/available-models');
      setAvailableModels(models);
      if (models.length > 0 && !models.includes(selectedModel)) {
        _setSelectedModel(models[0]);
      } else if (models.length === 0) {
        setNotification({
          message:
            'No AI models configured. Please add an API key to your .env file to enable generation.',
          type: 'warning',
        });
      }
    } catch (error) {
      console.error('Failed to fetch available models:', error);
      setNotification({ message: 'Could not connect to the AI model server.', type: 'error' });
    }
  }, [_setSelectedModel, selectedModel]);

  const dismissNotification = useCallback(() => setNotification(null), []);

  const setSelectedModel = useCallback(
    (model: AIModel) => {
      dismissNotification();
      if (availableModels.includes(model)) {
        _setSelectedModel(model);
      } else {
        setNotification({ message: `${model} is not available.`, type: 'warning' });
      }
    },
    [availableModels, dismissNotification, _setSelectedModel]
  );

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const handleReset = useCallback(() => {
    stopPolling();
    setPrompt('');
    setEngineered(null);
    setGenerationState(GenerationState.IDLE);
    setAgentStatuses(INITIAL_AGENTS);
    setProgress(0);
    setResults(null);
    setScaffoldedProject(null);
    setCommitHistory([]);
    setBuildId(null);
  }, [stopPolling]);

  const proceedToBuild = useCallback(() => {
    // This function is now effectively a no-op as the flow is handled by handleGenerate.
    // Kept for prop consistency if needed, but could be removed.
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      return;
    }

    handleReset();
    setGenerationState(GenerationState.RUNNING); // Go straight to running state

    try {
      const payload = {
        prompt,
        target,
        stack,
        includeAuth,
        includeBilling,
        model: selectedModel,
      };
      const { buildId: newBuildId } = await safeFetch<{ buildId: string }>('/api/builds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setBuildId(newBuildId);

      pollingRef.current = window.setInterval(async () => {
        try {
          const statusRes = await safeFetch<{
            status: GenerationState;
            progress: number;
            agentStatuses: AgentStatus[];
            commitHistory: Commit[];
            error: string | null;
          }>(`/api/builds/${newBuildId}/status`);

          setAgentStatuses(statusRes.agentStatuses);
          setProgress(statusRes.progress);
          setCommitHistory(statusRes.commitHistory || []);

          if (statusRes.status === GenerationState.COMPLETED) {
            stopPolling();
            const finalRes = await safeFetch<{
              results: AppGenerationResult;
              scaffoldedProject: any;
            }>(`/api/builds/${newBuildId}`);
            setResults(finalRes.results);
            setScaffoldedProject(finalRes.scaffoldedProject);
            setGenerationState(GenerationState.COMPLETED);
            useUserStore.getState().addActivity({
              type: 'generation',
              description: `Generated app: "${finalRes.results.appName || 'Untitled App'}"`,
            });
          } else if (statusRes.status === GenerationState.ERROR) {
            stopPolling();
            setGenerationState(GenerationState.ERROR);
            setNotification({ message: statusRes.error || 'The build failed.', type: 'error' });
          }
        } catch (pollError) {
          console.error('Polling error:', pollError);
          stopPolling();
          setGenerationState(GenerationState.ERROR);
          setNotification({
            message:
              pollError instanceof Error ? pollError.message : 'Lost connection to build server.',
            type: 'error',
          });
        }
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start build.';
      setGenerationState(GenerationState.ERROR);
      setNotification({ message: errorMessage, type: 'error' });
    }
  }, [prompt, selectedModel, handleReset, stopPolling, target, stack, includeAuth, includeBilling]);

  useEffect(() => {
    // Cleanup polling on component unmount
    return () => stopPolling();
  }, [stopPolling]);

  return {
    prompt,
    setPrompt,
    engineered,
    generationState,
    agentStatuses,
    progress,
    results,
    commitHistory,
    scaffoldedProject,
    handleGenerate,
    handleReset,
    proceedToBuild,
    fetchAvailableModels,
    availableModels,
    selectedModel,
    setSelectedModel,
    notification,
    dismissNotification,
    buildId,
    includeAuth,
    setIncludeAuth,
    includeBilling,
    setIncludeBilling,
    target,
    setTarget,
    stack,
    setStack,
  };
};
