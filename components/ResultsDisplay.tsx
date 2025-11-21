import React, { useState, useCallback } from 'react';
import {
  AppGenerationResult,
  GenerationState,
  FileTreeNode,
  TierId,
  FeatureFlags,
  Collaborator,
} from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { GithubIcon } from './icons/GithubIcon';
import { DeployIcon } from './icons/DeployIcon';
import { KeyIcon } from './icons/KeyIcon';
import UpgradeButton from './UpgradeButton';
import { BackendAgentIcon } from './icons/agents/BackendAgentIcon';
import { CogIcon } from './icons/CogIcon';
import { ErrorIcon } from './icons/ErrorIcon';
import { CheckIcon } from './icons/CheckIcon';
import { DotIcon } from './icons/DotIcon';
import { safeFetch } from '../lib/network';
import { RefreshIcon } from './icons/RefreshIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import AnimatedShinyText from './ui/magic/AnimatedShinyText';
import CodeEditor from './CodeEditor';
import PresenceAvatars from './PresenceAvatars';
import ProjectChat from './ProjectChat';
import { UsersIcon } from './icons/UsersIcon';

interface ResultsDisplayProps {
  generationState: GenerationState;
  results: AppGenerationResult | null;
  onReset: () => void;
  onUpgrade: () => void;
  scaffoldedProject: {
    projectId: string;
    projectDir: string;
    fileTree: FileTreeNode;
    files: Record<string, string>;
  } | null;
  selectedTier: TierId;
  flags: FeatureFlags;
  buildId: string | null;
}

const mockCollaborators: Collaborator[] = [
  { id: '1', name: 'Alex', color: '#FF00C9', initials: 'A' },
  { id: '2', name: 'Beth', color: '#00F9FF', initials: 'B' },
  { id: '3', name: 'Charlie', color: '#BFFF00', initials: 'C' },
];

const LivePreview: React.FC<{
  appName: string;
  buildId: string | null;
}> = ({ appName, buildId }) => {
  const [iframeKey, setIframeKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setIframeKey((prev) => prev + 1);
  }, []);

  const previewUrl = buildId ? `/api/builds/${buildId}/preview/` : '';

  return (
    <div className="w-full h-96 bg-dark-bg/50 border border-glass-border rounded-lg flex flex-col overflow-hidden shadow-lg">
      <div className="flex-shrink-0 h-10 bg-dark-secondary/70 flex items-center justify-between px-4 border-b border-glass-border">
        <div className="flex items-center gap-2" aria-hidden="true">
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
            <RefreshIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      {previewUrl ? (
        <iframe
          key={iframeKey}
          src={previewUrl}
          title={`${appName} - Live Preview`}
          className="w-full h-full border-0 bg-gray-900"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      ) : (
        <div
          className="flex-grow flex flex-col items-center justify-center gap-4 text-gray-500 bg-black/10"
          role="status"
        >
          <CogIcon className="h-12 w-12 text-cyan animate-spin" aria-hidden="true" />
          <p>Loading Live Preview...</p>
        </div>
      )}
    </div>
  );
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  generationState,
  results,
  onReset,
  onUpgrade,
  scaffoldedProject,
  selectedTier,
  flags,
  buildId,
}) => {
  const [githubState, setGithubState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [githubRepoUrl, setGithubRepoUrl] = useState<string | null>(null);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [smokeTestStatus, setSmokeTestStatus] = useState<'idle' | 'running' | 'success' | 'error'>(
    'idle'
  );
  const [smokeTestResult, setSmokeTestResult] = useState<string | null>(null);

  React.useEffect(() => {
    if (scaffoldedProject?.projectId && smokeTestStatus === 'idle' && buildId) {
      const runSmokeTest = async () => {
        setSmokeTestStatus('running');
        setSmokeTestResult(null);
        try {
          await new Promise((resolve) => setTimeout(resolve, 3000));

          const data = await safeFetch<{ message?: string; error?: string }>(
            `/api/builds/${buildId}/preview/api/test`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: 'Smoke Test User' }),
            }
          );

          setSmokeTestResult(data.message ?? 'Test completed successfully.');
          setSmokeTestStatus('success');
        } catch (err) {
          setSmokeTestStatus('error');
          setSmokeTestResult(err instanceof Error ? err.message : 'An unknown error occurred.');
        }
      };

      runSmokeTest();
    }
  }, [scaffoldedProject, smokeTestStatus, buildId]);

  const handlePushToGithub = async () => {
    if (!scaffoldedProject || !results?.appName) return;

    setGithubState('loading');
    setGithubError(null);
    setGithubRepoUrl(null);

    try {
      const { repoUrl } = await safeFetch<{ repoUrl: string }>('/api/github/create-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: scaffoldedProject.projectId,
          appName: results.appName,
        }),
      });
      setGithubRepoUrl(repoUrl);
      setGithubState('success');
    } catch (err) {
      setGithubError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setGithubState('error');
    }
  };

  const handleAction = (action: 'zip' | 'github' | 'deploy') => {
    if (action === 'zip' && scaffoldedProject?.projectId) {
      window.open(`/api/download/${scaffoldedProject.projectId}`, '_blank');
      return;
    }

    if (action === 'github') {
      handlePushToGithub();
      return;
    }
    alert(`Action: ${action}`);
  };

  const renderSmokeTestStatus = () => {
    let content;
    switch (smokeTestStatus) {
      case 'running':
        content = (
          <div className="flex items-center gap-2 text-cyan">
            <CogIcon className="h-5 w-5 animate-spin" />
            <span>Running smoke test...</span>
          </div>
        );
        break;
      case 'success':
        content = (
          <div className="flex items-start gap-2 text-green-400">
            <CheckIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold">Smoke Test Passed</p>
              <p className="text-sm font-mono text-gray-300">{smokeTestResult}</p>
            </div>
          </div>
        );
        break;
      case 'error':
        content = (
          <div className="flex items-start gap-2 text-red-400">
            <ErrorIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold">Smoke Test Failed</p>
              <p className="text-sm font-mono text-red-300">{smokeTestResult}</p>
            </div>
          </div>
        );
        break;
      default:
        content = (
          <div className="flex items-center gap-2 text-gray-500">
            <DotIcon className="h-5 w-5" />
            <span>Pending...</span>
          </div>
        );
        break;
    }
    return (
      <div role="status" aria-live="polite">
        {content}
      </div>
    );
  };

  if (!results) return null;

  if (generationState === GenerationState.COMPLETED && scaffoldedProject) {
    return (
      <section
        aria-labelledby="complete-build-title"
        className="w-full max-w-7xl p-6 bg-glass-bg border border-glass-border rounded-2xl backdrop-blur-lg flex flex-col items-center"
      >
        <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
          <h2
            id="complete-build-title"
            className="text-2xl md:text-4xl font-orbitron font-bold text-center text-green-400 tracking-wider"
          >
            BUILD COMPLETE
          </h2>
        </AnimatedShinyText>

        <div className="mt-4 text-gray-300 flex items-center justify-center gap-2">
          <p>
            Your app <span className="font-bold text-white">{results.appName}</span> has been
            generated.
          </p>
        </div>

        <div className="mt-8 w-full flex flex-col md:flex-row justify-center gap-4">
          <button
            onClick={() => handleAction('zip')}
            disabled={!scaffoldedProject}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/10 border border-glass-border rounded-lg text-white hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            <DownloadIcon /> {scaffoldedProject ? 'Download Files' : 'Generating...'}
          </button>
          <button
            onClick={() => handleAction('github')}
            disabled={githubState === 'loading' || githubState === 'success'}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/10 border border-glass-border rounded-lg text-white hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            <GithubIcon />
            {githubState === 'idle' && 'Push to GitHub'}
            {githubState === 'loading' && 'Pushing...'}
            {githubState === 'success' && 'Pushed to GitHub'}
            {githubState === 'error' && 'Retry Push'}
          </button>
          <button
            onClick={() => handleAction('deploy')}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-cyan text-dark-bg font-bold rounded-lg hover:bg-cyan/80 transition-colors"
          >
            <DeployIcon /> Deploy Now
          </button>
        </div>

        {githubState === 'success' && githubRepoUrl && (
          <div className="w-full text-center mt-4 p-4 bg-green-900/50 border border-green-500 rounded-lg">
            <p className="text-green-300">Successfully created repository:</p>
            <a
              href={githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan hover:underline font-mono"
            >
              {githubRepoUrl}
            </a>
            <p className="text-xs text-gray-400 mt-2">
              (This is a simulation. In a real environment, the code would be pushed here.)
            </p>
          </div>
        )}
        {githubState === 'error' && (
          <div
            className="w-full text-center mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg"
            role="alert"
          >
            <p className="text-red-300 mb-2">Failed to push to GitHub.</p>
            {githubError && <p className="font-mono text-sm text-red-400">{githubError}</p>}
          </div>
        )}

        {selectedTier !== 'apex' && flags.ff_payments && (
          <div className="w-full max-w-3xl mx-auto my-8 p-6 bg-dark-secondary/50 border border-cyan/50 rounded-2xl text-center shadow-lg">
            <h3 className="text-xl font-orbitron font-bold text-cyan">
              Supercharge Your App Quality
            </h3>
            <UpgradeButton
              onClick={onUpgrade}
              className="mt-6 rounded-full px-6 py-3 text-base font-bold flex items-center justify-center gap-2"
            >
              <SparklesIcon className="h-5 w-5" />
              <span className="mix-blend-multiply">Upgrade to Pro</span>
            </UpgradeButton>
          </div>
        )}

        <div className="mt-10 w-full">
          <CodeEditor files={scaffoldedProject.files} fileTree={scaffoldedProject.fileTree} />
        </div>

        <div className="mt-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div>
            <h3 className="flex items-center gap-2 font-bold text-magenta mb-4 text-lg">
              <DeployIcon /> Live Preview
            </h3>
            <LivePreview appName={results.appName} buildId={buildId} />
          </div>
          <div className="space-y-8">
            <div className="w-full p-4 bg-dark-bg/50 border border-glass-border rounded-lg">
              <h3 className="flex items-center gap-2 font-bold text-magenta mb-3">
                <UsersIcon className="h-5 w-5" /> Collaboration
              </h3>
              <div className="mt-2">
                <PresenceAvatars collaborators={mockCollaborators} />
                <ProjectChat
                  projectId={scaffoldedProject.projectId}
                  collaborators={mockCollaborators}
                />
              </div>
            </div>
            <div className="w-full p-4 bg-dark-bg/50 border border-glass-border rounded-lg">
              <h3 className="flex items-center gap-2 font-bold text-magenta">
                <BackendAgentIcon className="h-5 w-5" /> Backend Health Check
              </h3>
              <div className="p-3 bg-dark-bg/80 rounded-lg mt-4 min-h-[50px] flex items-center">
                {renderSmokeTestStatus()}
              </div>
            </div>
            <div className="w-full p-4 bg-dark-bg/50 border border-glass-border rounded-lg">
              <h3 className="flex items-center gap-2 font-bold text-magenta">
                <KeyIcon /> Required User Inputs
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 font-mono text-sm text-gray-300 mt-4">
                {results.requiredUserInputs.map((key) => (
                  <li key={key} className="flex items-center gap-2">
                    <span className="text-cyan">{'>'}</span>
                    <span>{key}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <button onClick={onReset} className="mt-8 text-cyan hover:underline">
          Build Another App
        </button>
      </section>
    );
  }

  return null;
};

export default React.memo(ResultsDisplay);
