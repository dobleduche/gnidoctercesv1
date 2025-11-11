import React, { useState, useCallback } from 'react';
import { AppGenerationResult, GenerationState, FileTreeNode } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { GithubIcon } from './icons/GithubIcon';
import { DeployIcon } from './icons/DeployIcon';
import { KeyIcon } from './icons/KeyIcon';
import { GenerateIcon } from './icons/GenerateIcon';
import UpgradeButton from './UpgradeButton';
import { ClipboardIcon } from './icons/ClipboardIcon';
import FileTree from './FileTree';
import { RefinerAgentIcon } from './icons/agents/RefinerAgentIcon';
import { CogIcon } from './icons/CogIcon';
import { RetryIcon } from './icons/RetryIcon';
import { BackendAgentIcon } from './icons/agents/BackendAgentIcon';
import { ErrorIcon } from './icons/ErrorIcon';
import { CheckIcon } from './icons/CheckIcon';
import { DotIcon } from './icons/DotIcon';
import { safeFetch } from '../lib/network';
import { RefreshIcon } from './icons/RefreshIcon';

interface ResultsDisplayProps {
  generationState: GenerationState;
  results: AppGenerationResult | null;
  onReset: () => void;
  onUpgrade: () => void;
  scaffoldedProject: { projectId: string; projectDir: string } | null;
}

const fileTreeData: FileTreeNode = {
  name: 'gnidoc-terces/',
  type: 'folder',
  children: [
    {
      name: 'apps/',
      type: 'folder',
      children: [
        { name: 'api-gateway/', type: 'folder', comment: 'HTTP/WS ingress (Fastify/Nest)' },
        { name: 'console/', type: 'folder', comment: 'Admin UI (Next.js)' },
        { 
          name: 'workers/', 
          type: 'folder', 
          comment: 'Job runners (BullMQ/Temporal)',
          children: [
            { name: 'jobs.ts', type: 'file' }
          ]
        },
      ],
    },
    {
      name: 'packages/',
      type: 'folder',
      children: [
        { 
          name: 'orchestrator/', 
          type: 'folder', 
          comment: 'Router, planners, executors',
          children: [
            { name: 'router.ts', type: 'file' }
          ] 
        },
        { 
          name: 'adapters/', 
          type: 'folder', 
          comment: 'Model adapters (each provider a subpkg)',
          children: [
            { name: 'openai/', type: 'folder', children: [{ name: 'index.ts', type: 'file' }] },
            { name: 'anthropic/', type: 'folder', children: [{ name: 'index.ts', type: 'file' }] },
            { name: 'google/', type: 'folder', children: [{ name: 'index.ts', type: 'file' }] },
          ]
        },
        { name: 'policies/', type: 'folder', comment: 'Safety, budget, compliance' },
        { name: 'tools/', type: 'folder', comment: 'Retrieval, search, storage, clip/gen tools' },
        { name: 'eval/', type: 'folder', comment: 'Evals, golden sets, regression harness' },
        { name: 'observability/', type: 'folder', comment: 'OTEL, logs, metrics' },
        { 
          name: 'schema/', 
          type: 'folder', 
          comment: 'zod/json-schema contracts',
          children: [
            { name: 'index.ts', type: 'file' }
          ]
        },
        { 
          name: 'shared/', 
          type: 'folder', 
          comment: 'types, errors, utils',
          children: [
            { name: 'types.ts', type: 'file' }
          ]
        },
        { name: 'cache/', type: 'folder', comment: 'in-mem + KV layer' },
      ],
    },
    {
      name: 'infra/',
      type: 'folder',
      children: [
        { name: 'terraform/', type: 'folder', comment: 'VPC, Redis, Postgres, S3, queues' },
        { name: 'docker/', type: 'folder', comment: 'Images & compose' },
      ],
    },
    {
      name: '.github/',
      type: 'folder',
      children: [
          {
            name: 'workflows/',
            type: 'folder',
            comment: 'CI (lint, typecheck, tests, SBOM, scans)',
            children: [
                { name: 'ci.yml', type: 'file' }
            ]
          },
      ],
    },
    { name: '.gitignore', type: 'file' },
    { name: 'README.md', type: 'file' },
    { name: 'package.json', type: 'file' },
  ],
};

interface LivePreviewProps {
  appName: string;
  scaffoldedProject: { projectId: string; projectDir: string } | null;
}

const LivePreview: React.FC<LivePreviewProps> = ({ appName, scaffoldedProject }) => {
    const [iframeKey, setIframeKey] = useState(0);

    const handleRefresh = useCallback(() => {
        setIframeKey(prev => prev + 1);
    }, []);

    return (
        <div className="w-full h-96 bg-dark-bg/50 border border-glass-border rounded-lg flex flex-col overflow-hidden shadow-lg">
            <div className="flex-shrink-0 h-10 bg-dark-secondary/70 flex items-center justify-between px-4 border-b border-glass-border">
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 bg-red-500 rounded-full"></span>
                    <span className="h-3 w-3 bg-yellow-500 rounded-full"></span>
                    <span className="h-3 w-3 bg-green-500 rounded-full"></span>
                </div>
                <div className="text-sm text-gray-400 truncate">{appName} - Live Preview</div>
                <div className="w-16 flex justify-end">
                    <button
                        onClick={handleRefresh}
                        className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        aria-label="Refresh live preview"
                        title="Refresh live preview"
                    >
                        <RefreshIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>
            {scaffoldedProject ? (
                <iframe
                    key={iframeKey}
                    src={`/preview/${scaffoldedProject.projectId}/`}
                    title={`${appName} - Live Preview`}
                    className="w-full h-full border-0 bg-gray-900"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                />
            ) : (
                <div className="flex-grow flex flex-col items-center justify-center gap-4 text-gray-500 bg-black/10">
                    <CogIcon className="h-12 w-12 text-cyan animate-spin" />
                    <p>Loading Live Preview...</p>
                </div>
            )}
        </div>
    );
};


const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ generationState, results, onReset, onUpgrade, scaffoldedProject }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isKeysCopied, setIsKeysCopied] = useState(false);
  const [isCloneCopied, setIsCloneCopied] = useState(false);
  const [githubState, setGithubState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [githubRepoUrl, setGithubRepoUrl] = useState<string | null>(null);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [smokeTestStatus, setSmokeTestStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [smokeTestResult, setSmokeTestResult] = useState<string | null>(null);

  React.useEffect(() => {
    if (scaffoldedProject && smokeTestStatus === 'idle') {
      const runSmokeTest = async () => {
        setSmokeTestStatus('running');
        setSmokeTestResult(null);
        try {
          // Wait for the server to be ready. This is a heuristic.
          await new Promise(resolve => setTimeout(resolve, 3000));

          const { response: res, data } = await safeFetch<{ message?: string; error?: string }>(`/preview/${scaffoldedProject.projectId}/api/test`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Smoke Test User' }),
          });

          if (!res.ok) {
            throw new Error(data.error || `Server responded with ${res.status}`);
          }
          setSmokeTestResult(data.message ?? 'Test completed successfully.');
          setSmokeTestStatus('success');
        } catch (err) {
          setSmokeTestStatus('error');
          setSmokeTestResult(err instanceof Error ? err.message : 'An unknown error occurred.');
        }
      };
      
      runSmokeTest();
    }
  }, [scaffoldedProject, smokeTestStatus]);
  
  const handlePushToGithub = async () => {
    if (!scaffoldedProject || !results?.appName) return;
    
    setGithubState('loading');
    setGithubError(null);

    try {
        const { response: res, data } = await safeFetch<{ ok: boolean; repoUrl?: string; error?: string }>('/api/github/create-repo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                projectId: scaffoldedProject.projectId,
                appName: results.appName,
            }),
        });

        if (!res.ok || !data.ok) {
            throw new Error(data.error || 'Failed to push to GitHub.');
        }
        
        setGithubRepoUrl(data.repoUrl!);
        setGithubState('success');

    } catch (error) {
        console.error('GitHub push error:', error);
        setGithubState('error');
        setGithubError(error instanceof Error ? error.message : 'An unknown error occurred.');
    }
  };


  const handleAction = (action: 'zip' | 'github' | 'deploy') => {
    if (action === 'zip' && scaffoldedProject?.projectId) {
      window.open(`/generated/${scaffoldedProject.projectId}/`, '_blank');
      return;
    }
    
    if (action === 'github') {
        handlePushToGithub();
        return;
    }

    const messages = {
      deploy: 'This would initiate a one-click deployment process to a hosting provider like Vercel.',
    };
    alert(messages[action]);
  };

  const handleCopy = () => {
    if (!results?.appName || isCopied) return;
    navigator.clipboard.writeText(results.appName)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy app name: ', err));
  };

  const handleCopyKeys = () => {
    if (!results?.requiredUserInputs || isKeysCopied) return;
    const keysText = results.requiredUserInputs.map(key => `${key}=`).join('\n');
    navigator.clipboard.writeText(keysText)
      .then(() => {
        setIsKeysCopied(true);
        setTimeout(() => setIsKeysCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy keys: ', err));
  };
  
  const handleCopyCloneCommand = () => {
    if (!githubRepoUrl || isCloneCopied) return;
    const cloneCommand = `git clone ${githubRepoUrl}`;
    navigator.clipboard.writeText(cloneCommand)
      .then(() => {
        setIsCloneCopied(true);
        setTimeout(() => setIsCloneCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy clone command: ', err));
  };

  const renderSmokeTestStatus = () => {
    switch (smokeTestStatus) {
      case 'running':
        return (
          <div className="flex items-center gap-2 text-cyan">
            <CogIcon className="h-5 w-5 animate-spin" />
            <span>Running smoke test...</span>
          </div>
        );
      case 'success':
        return (
          <div className="flex items-start gap-2 text-green-400">
            <CheckIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
                <p className="font-bold">Smoke Test Passed</p>
                <p className="text-sm font-mono text-gray-300">{smokeTestResult}</p>
            </div>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-start gap-2 text-red-400">
            <ErrorIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
                <p className="font-bold">Smoke Test Failed</p>
                <p className="text-sm font-mono text-red-300">{smokeTestResult}</p>
            </div>
          </div>
        );
      case 'idle':
      default:
        return (
          <div className="flex items-center gap-2 text-gray-500">
            <DotIcon className="h-5 w-5" />
            <span>Pending...</span>
          </div>
        );
    }
  };

  const renderGithubButton = () => {
    switch (githubState) {
        case 'loading':
            return (
                <button disabled className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/10 border border-glass-border rounded-lg text-white opacity-70 cursor-wait">
                    <CogIcon className="h-5 w-5 animate-spin" />
                    Pushing to GitHub...
                </button>
            );
        case 'success':
            return (
                <div className="flex-1 flex items-stretch gap-2">
                    <a href={githubRepoUrl!} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500/20 border border-green-500 rounded-lg text-white hover:bg-green-500/30 transition-colors text-center">
                        <GithubIcon />
                        View on GitHub
                    </a>
                    <button onClick={handleCopyCloneCommand} className="relative group flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 border border-glass-border rounded-lg text-white hover:bg-white/20 transition-colors">
                        <ClipboardIcon className="h-5 w-5" />
                        <span>{isCloneCopied ? 'Copied!' : 'Clone Repo'}</span>
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-sm px-2 py-1 text-xs bg-dark-bg text-white rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none break-all">
                             {isCloneCopied ? 'Copied to clipboard!' : `git clone ${githubRepoUrl}`}
                        </div>
                    </button>
                </div>
            );
        case 'error':
            return (
                <div className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
                        <p className="text-sm font-semibold text-red-300">Push to GitHub Failed</p>
                        <p className="text-xs text-red-400/80 mt-1 truncate" title={githubError || 'An unknown error occurred.'}>
                            {githubError || 'An unknown error occurred.'}
                        </p>
                    </div>
                    <button onClick={handlePushToGithub} className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-red-500/20 border border-red-500 rounded-lg text-white hover:bg-red-500/30 transition-colors">
                        <RetryIcon className="h-5 w-5" />
                        Try Again
                    </button>
                </div>
            );
        case 'idle':
        default:
            return (
                <button onClick={() => handleAction('github')} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/10 border border-glass-border rounded-lg text-white hover:bg-white/20 transition-colors">
                    <GithubIcon />
                    Push to GitHub
                </button>
            );
    }
  }

  if (!results) return null;

  if (generationState === GenerationState.PARTIAL_COMPLETED) {
     return (
        <div className="w-full max-w-4xl p-6 bg-glass-bg border border-yellow-500 rounded-2xl backdrop-blur-lg flex flex-col items-center animate-pulse-glow">
            <h2 className="text-2xl md:text-3xl font-orbitron font-bold text-center text-yellow-400 tracking-wider">BUILD PAUSED AT 40%</h2>
            
            <div className="mt-2 text-gray-300 flex items-center justify-center gap-2">
                <p>Your app preview for <span className="font-bold text-white">{results.appName}</span> has been generated.</p>
                <div className="relative group">
                    <button
                        onClick={handleCopy}
                        className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                        aria-label="Copy app name to clipboard"
                    >
                       <ClipboardIcon className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                    </button>
                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-dark-bg text-white rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {isCopied ? 'Copied!' : 'Copy to clipboard'}
                    </span>
                </div>
            </div>

            <div className="mt-8 w-full max-w-2xl">
                <LivePreview appName={results.appName} scaffoldedProject={scaffoldedProject} />
            </div>

            <div className="mt-8 w-full max-w-lg text-center p-6 bg-dark-bg/50 rounded-lg border border-glass-border">
                <h3 className="font-bold text-lg text-cyan">Upgrade to unlock the full application</h3>
                <ul className="text-left text-gray-400 text-sm space-y-2 mt-4 list-disc list-inside">
                    <li>Complete all 10 agent tasks (6 remaining)</li>
                    <li>Unlock multi-model AI for advanced generation</li>
                    <li>Access the Deep Analytical Research Tool</li>
                    <li>Enable full code export and one-click deployment</li>
                </ul>
            </div>
            
            <UpgradeButton 
              onClick={onUpgrade} 
              className="mt-8 flex items-center justify-center gap-2 rounded-full px-8 py-3 text-lg font-bold"
            >
              <GenerateIcon />
              <span className="mix-blend-multiply">Upgrade & Complete Build</span>
            </UpgradeButton>
            <button onClick={onReset} className="mt-6 text-cyan hover:underline text-sm">
              Build Another App
            </button>
        </div>
     );
  }

  if (generationState === GenerationState.COMPLETED) {
    return (
      <div className="w-full max-w-5xl p-6 bg-glass-bg border border-glass-border rounded-2xl backdrop-blur-lg flex flex-col items-center animate-pulse-glow">
        <h2 className="text-2xl md:text-3xl font-orbitron font-bold text-center text-green-400 tracking-wider">BUILD COMPLETE</h2>
        
        <div className="mt-2 text-gray-300 flex items-center justify-center gap-2">
            <p>Your app <span className="font-bold text-white">{results.appName}</span> has been generated.</p>
            <div className="relative group">
                <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                    aria-label="Copy app name to clipboard"
                >
                   <ClipboardIcon className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                </button>
                <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-dark-bg text-white rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {isCopied ? 'Copied!' : 'Copy to clipboard'}
                </span>
            </div>
        </div>

        <div className="mt-8 w-full flex flex-col md:flex-row justify-center gap-4">
          <button 
            onClick={() => handleAction('zip')}
            disabled={!scaffoldedProject}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/10 border border-glass-border rounded-lg text-white hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <DownloadIcon />
            {scaffoldedProject ? 'Download Files' : 'Generating Code...'}
          </button>
          
          {renderGithubButton()}

          <button 
            onClick={() => handleAction('deploy')}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-cyan text-dark-bg font-bold rounded-lg hover:bg-cyan/80 transition-colors shadow-lg shadow-cyan/20">
            <DeployIcon />
            Deploy Now
          </button>
        </div>
        
        <div className="mt-4 text-sm text-green-400 flex items-center justify-center gap-2">
            <CheckIcon className="h-4 w-4" />
            <span>Includes a pre-configured GitHub Actions CI/CD pipeline for automated builds.</span>
        </div>

        <div className="mt-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="lg:sticky lg:top-24">
                 <h3 className="flex items-center gap-2 font-bold text-magenta mb-4 text-lg">
                    <DeployIcon /> Live Preview
                </h3>
                <LivePreview appName={results.appName} scaffoldedProject={scaffoldedProject} />
            </div>
            <div className="space-y-8">
                <div className="w-full p-4 bg-dark-bg/50 border border-glass-border rounded-lg">
                  <h3 className="flex items-center gap-2 font-bold text-magenta">
                    <RefinerAgentIcon className="h-5 w-5" /> Generated Project Structure
                  </h3>
                  <div className="mt-4 font-mono text-sm max-h-80 overflow-y-auto no-scrollbar pr-2">
                    <FileTree data={fileTreeData} />
                  </div>
                </div>

                <div className="w-full p-4 bg-dark-bg/50 border border-glass-border rounded-lg">
                  <h3 className="flex items-center gap-2 font-bold text-magenta">
                    <BackendAgentIcon className="h-5 w-5" /> Backend Health Check
                  </h3>
                  <p className="text-sm text-gray-400 mt-2 mb-4">
                    An automated test to verify the generated backend is running correctly.
                  </p>
                  <div className="p-3 bg-dark-bg/80 rounded-lg min-h-[50px] flex items-center">
                    {renderSmokeTestStatus()}
                  </div>
                </div>

                <div className="w-full p-4 bg-dark-bg/50 border border-glass-border rounded-lg">
                  <div className="flex justify-between items-center">
                    <h3 className="flex items-center gap-2 font-bold text-magenta">
                        <KeyIcon /> Required User Inputs
                    </h3>
                    <button
                        onClick={handleCopyKeys}
                        className="flex items-center gap-1.5 px-2 py-1 text-xs bg-white/10 text-gray-300 rounded-md hover:bg-white/20 transition-colors disabled:opacity-50"
                        disabled={isKeysCopied}
                    >
                        <ClipboardIcon className="h-3 w-3" />
                        {isKeysCopied ? 'Copied!' : 'Copy .env'}
                    </button>
                  </div>
                  <p className="text-sm text-gray-400 mt-2 mb-4">Add these to your environment variables to complete the setup.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 font-mono text-sm text-gray-300">
                    {results.requiredUserInputs.map(key => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-cyan">{'>'}</span>
                        <span>{key}</span>
                      </div>
                    ))}
                  </div>
                </div>
            </div>
        </div>
        
        <button onClick={onReset} className="mt-8 text-cyan hover:underline">
          Build Another App
        </button>
      </div>
    );
  }

  return null;
};

export default React.memo(ResultsDisplay);