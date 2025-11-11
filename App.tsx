
import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Footer from './components/Footer';
import FuturisticSphere from './components/FuturisticSphere';
import Tour from './components/Tour';
import PromptInput from './components/PromptInput';
import AgentPipeline from './components/AgentPipeline';
import ResultsDisplay from './components/ResultsDisplay';
import ProgressBar from './components/ProgressBar';
import UpgradeModal from './components/UpgradeModal';
import PrivacyPolicyModal from './components/PrivacyPolicyModal';
import PromptEngineer from './components/PromptEngineer';
import OrchestrationScreen from './components/OrchestrationScreen';
import { useAppGenerator } from './hooks/useAppGenerator';
import { GenerationState } from './types';
import AnthropicFetcher from './components/AnthropicFetcher';
import GeminiModelFetcher from './components/GeminiModelFetcher';
import APIKeyConfigurator from './components/APIKeyConfigurator';
import ReferralsModal from './components/ReferralsModal';

const Features = lazy(() => import('./components/Features'));
const FAQ = lazy(() => import('./components/FAQ'));

const Loader: React.FC = () => (
  <div className="flex justify-center items-center py-32">
    <div className="w-12 h-12 border-4 border-cyan border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const App: React.FC = () => {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isOrchestrationScreenOpen, setIsOrchestrationScreenOpen] = useState(false);
  const [isReferralsModalOpen, setIsReferralsModalOpen] = useState(false);
  
  const [isUpgraded, setIsUpgraded] = useState(() => {
    try {
      const saved = localStorage.getItem('gnidoc-terces-settings');
      return saved ? JSON.parse(saved).isUpgraded : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
        const settings = JSON.stringify({ isUpgraded });
        localStorage.setItem('gnidoc-terces-settings', settings);
    } catch (error) {
        console.warn('Failed to save settings to localStorage:', error);
    }
  }, [isUpgraded]);


  const {
    prompt,
    setPrompt,
    engineered: engineeredPrompt,
    generationState,
    agentStatuses,
    progress,
    results,
    retryingAgentId,
    commitHistory,
    handleGenerate,
    handleReset,
    handleRetryAgent,
    proceedToBuild,
    scaffoldedProject,
    availableModels,
    selectedModel,
    setSelectedModel,
    fetchAvailableModels,
  } = useAppGenerator();

  const handleUpgrade = useCallback(() => {
    setIsUpgraded(true);
  }, []);

  const startTour = useCallback(() => {
    setIsTourOpen(true);
  }, []);
  
  const openUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(true);
  }, []);

  const openPrivacyModal = useCallback(() => {
    setIsPrivacyModalOpen(true);
  }, []);
  
  const openOrchestrationScreen = useCallback(() => {
    setIsOrchestrationScreenOpen(true);
  }, []);

  const openReferralsModal = useCallback(() => {
    setIsReferralsModalOpen(true);
  }, []);

  const referralLink = `${window.location.origin}?ref=12345`;

  useEffect(() => {
    const handleScroll = () => {
      document.body.style.setProperty('--scroll-y', `${window.scrollY}px`);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const isGenerating = generationState !== GenerationState.IDLE && generationState !== GenerationState.COMPLETED;

  const handleModalUpgrade = () => {
    handleUpgrade();
    setIsUpgradeModalOpen(false);
  }

  const handleOrchestrationUpgrade = (tierId: string) => {
    // Any non-basic tier selection from the orchestration screen will
    // trigger the 'upgraded' state for development purposes, unlocking all features.
    if (tierId !== 'basic') {
      handleUpgrade();
    }
    // Keep the screen open to see the new plan selected
    // but the user can close it manually.
    // Or close it after a delay
    setTimeout(() => {
      if (generationState === GenerationState.IDLE) {
         setIsOrchestrationScreenOpen(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen text-gray-200 overflow-x-hidden">
      <FuturisticSphere />
      <div className="relative z-10">
        <Header 
          onStartTour={startTour} 
          onUpgrade={openUpgradeModal} 
          onOpenOrchestration={openOrchestrationScreen}
          onOpenReferrals={openReferralsModal}
        />
        <main className="px-4">
          <Hero onStartTour={startTour} onUpgrade={openUpgradeModal} isGenerating={isGenerating}>
            {generationState === GenerationState.IDLE && (
              <PromptInput
                prompt={prompt}
                setPrompt={setPrompt}
                onGenerate={handleGenerate}
                isLoading={generationState !== GenerationState.IDLE}
                availableModels={availableModels}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                fetchAvailableModels={fetchAvailableModels}
              />
            )}
             {generationState === GenerationState.ENGINEERING_PROMPT && (
              <PromptEngineer 
                originalPrompt={prompt} 
                engineeredPrompt={engineeredPrompt}
                onProceed={proceedToBuild}
              />
            )}
          </Hero>

          <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-12">
            {(generationState === GenerationState.RUNNING || generationState === GenerationState.ERROR || generationState === GenerationState.PARTIAL_COMPLETED) && (
              <>
                <ProgressBar progress={progress} agentStatuses={agentStatuses} />
                <AgentPipeline 
                  agentStatuses={agentStatuses} 
                  onRetryAgent={handleRetryAgent}
                  retryingAgentId={retryingAgentId}
                  commitHistory={commitHistory}
                />
              </>
            )}

            {(generationState === GenerationState.COMPLETED || generationState === GenerationState.PARTIAL_COMPLETED) && results && (
              <ResultsDisplay
                generationState={generationState}
                results={results}
                onReset={handleReset}
                onUpgrade={openUpgradeModal}
                scaffoldedProject={scaffoldedProject}
              />
            )}
          </div>
          
          <div className="w-full max-w-3xl mx-auto my-16 space-y-12">
            <div>
              <h2 className="text-2xl font-orbitron font-bold text-center mb-8">API Key Configuration Status</h2>
              <APIKeyConfigurator />
            </div>
            <div>
              <h2 className="text-2xl font-orbitron font-bold text-center mb-8">Anthropic API Fetcher Demo</h2>
              <AnthropicFetcher />
            </div>
            <div>
              <h2 className="text-2xl font-orbitron font-bold text-center mb-8">Google Gemini Model List Demo</h2>
              <GeminiModelFetcher />
            </div>
          </div>

          <Suspense fallback={<Loader />}>
            <Features />
            <FAQ />
          </Suspense>
        </main>
        <Footer onOpenPrivacyPolicy={openPrivacyModal} />
      </div>
      <Tour isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
      <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} onUpgrade={handleModalUpgrade} />
      <PrivacyPolicyModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />
      <OrchestrationScreen 
        isOpen={isOrchestrationScreenOpen} 
        onClose={() => setIsOrchestrationScreenOpen(false)} 
        onUpgrade={handleOrchestrationUpgrade}
        isUpgraded={isUpgraded}
      />
       <ReferralsModal 
        isOpen={isReferralsModalOpen} 
        onClose={() => setIsReferralsModalOpen(false)}
        referralLink={referralLink}
      />
    </div>
  );
};

export default App;