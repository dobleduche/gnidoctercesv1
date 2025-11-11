import { useState, useCallback, useEffect, useRef } from 'react';
import { AgentStatus, GenerationState, AppGenerationResult, Subtask, AIModel, Commit, RefinedPrompt } from '../types';
import { AGENT_DEFINITIONS, AGENT_ERROR_MESSAGES, UI_AGENT_SUBTASKS } from '../constants';
import { safeFetch } from '../lib/network';

const SIMULATION_SPEED = 1500;
const RETRY_DELAY = 2000;
const MAX_RETRIES = 2; // Allow 2 retries, for a total of 3 attempts.

const INITIAL_AGENTS: AgentStatus[] = AGENT_DEFINITIONS.map(agent => ({ ...agent, status: 'pending', retries: 0 }));

const getAgentSubtasks = (agentId: string): Omit<Subtask, 'status'>[] | undefined => {
  switch (agentId) {
    case 'ui-agent':
      return [{ name: 'Apply Engineered Prompt' }, ...UI_AGENT_SUBTASKS];
    case 'db-agent':
      return [{ name: 'Designing Schema' }, { name: 'Writing Migrations' }, { name: 'Seeding Data' }];
    case 'backend-agent':
      return [{ name: 'API Scaffolding' }, { name: 'Route Definitions' }, { name: 'Business Logic' }, { name: 'Auth Flow Integration' }];
    case 'deployment-agent':
      return [{ name: 'Configuring Vercel' }, { name: 'Setting up Supabase' }, { name: 'Running build script' }, { name: 'Deploying to edge' }];
    case 'code-review-agent':
      return [{ name: 'Linting codebase' }, { name: 'Checking for code smells' }, { name: 'Verifying best practices' }];
    default:
      return undefined;
  }
};

const generateCommitMessage = (agentId: string): string => {
    switch (agentId) {
        case 'ui-agent': return 'Scaffold UI kit and component library';
        case 'db-agent': return 'Define and migrate database schema';
        case 'backend-agent': return 'Build core API endpoints and logic';
        case 'auth-agent': return 'Implement user authentication flow';
        case 'cms-agent': return 'Integrate headless CMS for content';
        case 'deployment-agent': return 'Configure CI/CD and deployment scripts';
        case 'security-agent': return 'Apply security hardening and checks';
        case 'monetization-agent': return 'Integrate Stripe for payments';
        case 'compliance-agent': return 'Add GDPR/HIPAA compliance features';
        case 'refiner-agent': return 'Refactor and organize codebase';
        case 'code-review-agent': return 'Perform final code quality review';
        default: return 'Complete task';
    }
};

export const useAppGenerator = () => {
  const [prompt, setPrompt] = useState(() => {
    try {
      return localStorage.getItem('gnidoc-terces-prompt') || '';
    } catch {
      return '';
    }
  });
  
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<AIModel>(() => {
    try {
      return (localStorage.getItem('gnidoc-terces-model') as AIModel) || 'gemini';
    } catch {
      return 'gemini';
    }
  });

  const [engineered, setEngineered] = useState<RefinedPrompt | null>(null);
  const [generationState, setGenerationState] = useState<GenerationState>(GenerationState.IDLE);
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>(INITIAL_AGENTS);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<AppGenerationResult | null>(null);
  const [retryingAgentId, setRetryingAgentId] = useState<string | null>(null);
  const [scaffoldedProject, setScaffoldedProject] = useState<{ projectId: string; projectDir: string } | null>(null);
  const [commitHistory, setCommitHistory] = useState<Commit[]>([]);


  const agentRunnerRef = useRef<{ timeouts: ReturnType<typeof setTimeout>[] }>({ timeouts: [] });

  useEffect(() => {
    try {
      localStorage.setItem('gnidoc-terces-prompt', prompt);
    } catch (error) {
      console.warn('Failed to save prompt to localStorage:', error);
    }
  }, [prompt]);

  const fetchAvailableModels = useCallback(async () => {
    try {
      const { response, data } = await safeFetch<{ ok: boolean; models: AIModel[]; error?: string; }>('/api/ai/available-models');
      
      if (response.ok && data.ok && data.models.length > 0) {
        setAvailableModels(data.models);
        // If current selection is not available, default to the first one
        setSelectedModel(currentSelectedModel => {
            if (!data.models.includes(currentSelectedModel)) {
                return data.models[0];
            }
            return currentSelectedModel;
        });
      } else if (!response.ok || !data.ok) {
          throw new Error(data.error || 'Failed to fetch model list.');
      }
    } catch (error) {
      console.error("Failed to fetch available models:", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('gnidoc-terces-model', selectedModel);
    } catch (error) {
      console.warn('Failed to save model to localStorage:', error);
    }
  }, [selectedModel]);

  const cleanupTimeouts = useCallback(() => {
    agentRunnerRef.current.timeouts.forEach(clearTimeout);
    agentRunnerRef.current.timeouts = [];
  }, []);
  
  const API_BASE = '/api';

  const runPipelineSim = useCallback((startIndex = 0) => {
    let current = startIndex;
    const step = () => {
        const agentId = AGENT_DEFINITIONS[current]?.id;
        if (!agentId) return; // End of pipeline

        const subtasks = getAgentSubtasks(agentId)?.map(st => ({ ...st, status: 'pending' as const }));
        setAgentStatuses(prev => prev.map(a => a.id === agentId ? { ...a, status: 'running', subtasks } : a));

        const onSimulationComplete = () => {
            setAgentStatuses(prevStatuses => {
                const agentStatus = prevStatuses.find(a => a.id === agentId);
                if (!agentStatus) return prevStatuses;

                // Production-ready simulation: Any agent can fail randomly, triggering a robust retry mechanism.
                // This removes the hardcoded failure for the security agent and fixes a bug in the old logic.
                const isEligibleForFailure = !['refiner-agent', 'code-review-agent'].includes(agentId);
                const hasFailedThisAttempt = isEligibleForFailure && Math.random() < 0.15; // 15% chance to fail

                if (hasFailedThisAttempt) {
                    // Agent has failed. Handle retry or permanent failure.
                    const currentRetries = agentStatus.retries;
                    if (currentRetries < MAX_RETRIES) {
                        // Retry the current agent. 'current' is not incremented.
                        const timeout = setTimeout(step, RETRY_DELAY);
                        agentRunnerRef.current.timeouts.push(timeout);
                        return prevStatuses.map(a => a.id === agentId ? { ...a, retries: currentRetries + 1 } : a);
                    } else {
                        // Permanent failure after exhausting retries.
                        setGenerationState(GenerationState.ERROR);
                        return prevStatuses.map(a => a.id === agentId ? { ...a, status: 'error', errorMessage: AGENT_ERROR_MESSAGES[agentId] || 'Max retries reached.' } : a);
                    }
                } else {
                    // Agent succeeded.
                    if (agentStatus) {
                        const newCommit: Commit = {
                            hash: `c${Math.random().toString(16).slice(2, 9)}`,
                            agentId: agentStatus.id,
                            message: `feat(${agentStatus.id}): ${generateCommitMessage(agentStatus.id)}`,
                            author: agentStatus.name,
                        };
                        setCommitHistory(prev => [newCommit, ...prev]);
                    }

                    const nextStatuses = prevStatuses.map(a => a.id === agentId ? { ...a, status: 'success' as const, subtasks: a.subtasks?.map(s => ({ ...s, status: 'success' as const })) } : a);
                    current++; // Move to next agent
                    if (current < AGENT_DEFINITIONS.length) {
                        const timeout = setTimeout(step, 300);
                        agentRunnerRef.current.timeouts.push(timeout);
                    }
                    return nextStatuses;
                }
            });
        };

        if (subtasks && subtasks.length) {
            let idx = 0;
            const per = (SIMULATION_SPEED / subtasks.length);
            const tick = () => {
                setAgentStatuses(prev => prev.map(a => {
                    if (a.id !== agentId || !a.subtasks) return a;
                    const ns = [...a.subtasks];
                    if (idx > 0 && ns[idx-1]) ns[idx - 1].status = 'success';
                    if (ns[idx]) ns[idx].status = 'running';
                    return { ...a, subtasks: ns };
                }));
                idx++;
                if (idx <= subtasks.length) {
                    const timeout = setTimeout(tick, per);
                    agentRunnerRef.current.timeouts.push(timeout);
                } else {
                    onSimulationComplete();
                }
            };
            tick();
        } else {
            const timeout = setTimeout(onSimulationComplete, SIMULATION_SPEED);
            agentRunnerRef.current.timeouts.push(timeout);
        }
    };
    step();
  }, [cleanupTimeouts]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;
    cleanupTimeouts();
    setGenerationState(GenerationState.ENGINEERING_PROMPT);
    setAgentStatuses(INITIAL_AGENTS);
    setProgress(0);
    setResults(null);
    setEngineered(null);
    setScaffoldedProject(null);
    setCommitHistory([]);

    try {
      const { response, data: j } = await safeFetch<{ ok: boolean; engineered?: RefinedPrompt; error?: string }>('/api/ai/refine', {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt, model: selectedModel })
      });
      
      if (!response.ok || !j.ok) {
        throw new Error(j.error || 'Failed to refine prompt');
      }
      setEngineered(j.engineered ?? null);
    } catch (error) {
        console.error("Error refining prompt:", error);
        setGenerationState(GenerationState.ERROR);
    }
  }, [prompt, selectedModel, cleanupTimeouts]);

  const proceedToBuild = useCallback(async () => {
    if (!engineered) return;
    setGenerationState(GenerationState.RUNNING);
    runPipelineSim();

    try {
      const { response, data } = await safeFetch<{ ok: boolean; projectId: string; projectDir: string; error?: string }>(`${API_BASE}/scaffold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ engineered }),
      });
      
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Scaffolding failed');
      }

      setScaffoldedProject({ projectId: data.projectId, projectDir: data.projectDir });
      
      const appName = engineered.goals[0] || 'Generated App';
      setResults({
        appName,
        exportOptions: ['zip', 'github', 'deploy'],
        requiredUserInputs: [
            'API_KEY', 
            'OPENAI_API_KEY', 
            'ANTHROPIC_API_KEY', 
            'PORT=3002', 
            'JWT_SECRET', 
            'STRIPE_SECRET_KEY'
        ],
      });

      setGenerationState(GenerationState.COMPLETED);

    } catch (error) {
        console.error("Error during build process:", error);
        setGenerationState(GenerationState.ERROR);
    }
  }, [engineered, runPipelineSim]);

  const handleReset = useCallback(() => {
    cleanupTimeouts();
    setPrompt(''); setEngineered(null);
    setGenerationState(GenerationState.IDLE);
    setAgentStatuses(INITIAL_AGENTS);
    setProgress(0); setResults(null);
    setRetryingAgentId(null);
    setScaffoldedProject(null);
    setCommitHistory([]);
  }, [cleanupTimeouts]);

  const handleRetryAgent = useCallback((agentId: string) => {
    cleanupTimeouts();
    setRetryingAgentId(agentId);
    
    const agentIndex = AGENT_DEFINITIONS.findIndex(a => a.id === agentId);
    if (agentIndex === -1) return;

    setAgentStatuses(prev => prev.map((agent, i) => {
      if (i >= agentIndex) {
        // Reset this agent and all subsequent agents
        return { ...agent, status: 'pending', errorMessage: undefined, subtasks: undefined, retries: 0 };
      }
      return agent;
    }));

    setGenerationState(GenerationState.RUNNING);
    
    const timeout = setTimeout(() => {
        setRetryingAgentId(null);
        runPipelineSim(agentIndex); // Restart simulation from the failed agent
    }, 300);
    agentRunnerRef.current.timeouts.push(timeout);
  }, [cleanupTimeouts, runPipelineSim]);

  useEffect(() => () => cleanupTimeouts(), [cleanupTimeouts]);

  useEffect(() => {
    if (generationState === GenerationState.RUNNING || generationState === GenerationState.COMPLETED) {
        const ok = agentStatuses.filter(a => a.status === 'success').length;
        const newP = (ok / AGENT_DEFINITIONS.length) * 100;
        if(generationState === GenerationState.COMPLETED) {
            setProgress(100);
        } else {
            setProgress(p => Math.max(p, newP));
        }
    }
  }, [agentStatuses, generationState]);

  return {
    prompt, setPrompt,
    engineered,
    generationState,
    agentStatuses,
    progress,
    results,
    retryingAgentId,
    commitHistory,
    scaffoldedProject,
    handleGenerate,
    handleReset,
    handleRetryAgent,
    proceedToBuild,
    fetchAvailableModels,
    availableModels,
    selectedModel,
    setSelectedModel,
  };
};