
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
import { GenerationState, AgentStatus, TierId, AIModel } from './types';
import ReferralsModal from './components/ReferralsModal';
import Notification from './components/Notification';
import ChatWidget from './components/ChatWidget';
import AgentDetailModal from './components/AgentDetailModal';
import { useFeatureFlags } from './lib/featureFlags';
import { useUserStore } from './state/userStore';
import { useAuth } from './hooks/useAuth';
import useDarkMode from './hooks/useDarkMode';
import UserProfileModal from './components/UserProfileModal';
import CookieConsent from './components/CookieConsent';

const Features = lazy(() => import('./components/Features'));
const FAQ = lazy(() => import('./components/FAQ'));

const Loader: React.FC = () => (
  <div className="flex justify-center items-center py-32" role="status" aria-label="Loading content">
    <div className="w-12 h-12 border-4 border-cyan border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
  </div>
);

const App: React.FC = () => {
  useDarkMode(); // Initialize dark mode hook
  const { flags } = useFeatureFlags();
  const { user, tier, credits, loading: userLoading } = useUserStore();
  useAuth(); // Hook to initialize auth state listener

  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isOrchestrationScreenOpen, setIsOrchestrationScreen] = useState(false);
  const [isReferralsModalOpen, setIsReferralsModalOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentStatus | null>(null);
  const [isDevPanelOpen, setIsDevPanelOpen] = useState(false);
  
  const [selectedTier, setSelectedTier] = useState<TierId>('spark');
  
  useEffect(() => {
    // Sync local selectedTier with user's actual tier from auth
    if (tier) {
      setSelectedTier(tier);
    }
  }, [tier]);
  
  const [selectedModel, setSelectedModel] = useState<AIModel>('gemini');

  useEffect(() => {
    try {
        const settings = JSON.stringify({ selectedTier: tier || 'spark', selectedModel });
        localStorage.setItem('gnidoc-terces-settings', settings);
    } catch (error) {
        console.warn('Failed to save settings to localStorage:', error);
    }
  }, [tier, selectedModel]);


  const {
    prompt,
    setPrompt,
    engineered: engineeredPrompt,
    generationState,
    agentStatuses,
    progress,
    results,
    commitHistory,
    handleGenerate,
    handleReset,
    proceedToBuild,
    scaffoldedProject,
    availableModels,
    fetchAvailableModels,
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
  } = useAppGenerator({
    selectedTier,
    selectedModel,
    setSelectedModel
  });

  useEffect(() => {
    let keySequence: string[] = [];
    const targetSequence = ['`', '`', '`'];

    const handleKeyDown = (e: KeyboardEvent) => {
        keySequence.push(e.key);
        if (keySequence.length > targetSequence.length) {
            keySequence.shift();
        }

        if (JSON.stringify(keySequence) === JSON.stringify(targetSequence)) {
            setIsDevPanelOpen(prev => !prev);
            keySequence = [];
        }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleUpgrade = useCallback((tierId: TierId) => {
    // This function can now be used to initiate a checkout flow
    // For now, it opens the orchestration screen where payment can be initiated
    setSelectedTier(tierId);
    setIsOrchestrationScreen(true);
  }, []);

  const startTour = useCallback(() => {
    setIsTourOpen(true);
  }, []);
  
  const openUpgradeModal = useCallback(() => {
    if (!flags.ff_payments) {
      console.warn('Attempted to open upgrade modal while ff_payments is disabled.');
      return;
    }
    setIsUpgradeModalOpen(true);
  }, [flags.ff_payments]);

  const openPrivacyModal = useCallback(() => {
    setIsPrivacyModalOpen(true);
  }, []);
  
  const openOrchestrationScreen = useCallback(() => {
    setIsOrchestrationScreen(true);
  }, []);

  const openReferralsModal = useCallback(() => {
    setIsReferralsModalOpen(true);
  }, []);

  const openUserProfile = useCallback(() => {
    setIsUserProfileOpen(true);
  }, []);

  const handleAgentClick = useCallback((agent: AgentStatus) => {
    setSelectedAgent(agent);
  }, []);

  const handleCloseAgentModal = () => {
    setSelectedAgent(null);
  };

  const referralLink = user ? `${window.location.origin}?ref=${user.uid}` : `${window.location.origin}?ref=12345`;

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
    handleUpgrade('forge');
    setIsUpgradeModalOpen(false);
  }

  const handleOrchestrationUpgrade = (tierId: TierId) => {
    // This would trigger a Stripe checkout flow
    alert(`Initiating upgrade to ${tierId}. This would redirect to Stripe.`);
    // In a real app, you would call your backend to create a checkout session
    // and redirect the user to Stripe.
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Notification notification={notification} onClose={dismissNotification} />
      <FuturisticSphere />
      <div className="relative z-10">
        <Header 
          flags={flags}
          onStartTour={startTour} 
          onUpgrade={openUpgradeModal} 
          onOpenOrchestration={openOrchestrationScreen}
          onOpenReferrals={openReferralsModal}
          onOpenProfile={openUserProfile}
        />
        <main className="px-4">
          <Hero onStartTour={startTour} onUpgrade={openUpgradeModal} isGenerating={isGenerating} flags={flags}>
            {(generationState === GenerationState.IDLE || generationState === GenerationState.ENGINEERING_PROMPT) && (
              <PromptInput
                flags={flags}
                prompt={prompt}
                setPrompt={setPrompt}
                onGenerate={handleGenerate}
                isLoading={generationState !== GenerationState.IDLE || userLoading}
                availableModels={availableModels}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                fetchAvailableModels={fetchAvailableModels}
                includeAuth={includeAuth}
                setIncludeAuth={setIncludeAuth}
                includeBilling={includeBilling}
                setIncludeBilling={setIncludeBilling}
                setTarget={setTarget}
                setStack={setStack}
              />
            )}
             {generationState === GenerationState.ENGINEERING_PROMPT && (
              <div className="w-full mt-12">
                <PromptEngineer 
                  originalPrompt={prompt} 
                  engineeredPrompt={engineeredPrompt}
                  onProceed={proceedToBuild}
                />
              </div>
            )}
          </Hero>

          <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-12">
            {(generationState === GenerationState.RUNNING || generationState === GenerationState.ERROR || generationState === GenerationState.PARTIAL_COMPLETED) && (
              <>
                <ProgressBar progress={progress} agentStatuses={agentStatuses} />
                <AgentPipeline 
                  agentStatuses={agentStatuses} 
                  commitHistory={commitHistory}
                  generationState={generationState}
                  onReset={handleReset}
                  onAgentClick={handleAgentClick}
                />
              </>
            )}

            {(generationState === GenerationState.COMPLETED || generationState === GenerationState.PARTIAL_COMPLETED) && results && (
              <ResultsDisplay
                flags={flags}
                generationState={generationState}
                results={results}
                onReset={handleReset}
                onUpgrade={openUpgradeModal}
                scaffoldedProject={scaffoldedProject}
                selectedTier={selectedTier}
                buildId={buildId}
              />
            )}
          </div>
          
          <Suspense fallback={<Loader />}>
            <Features />
            <FAQ />
          </Suspense>
        </main>
        <Footer onOpenPrivacyPolicy={openPrivacyModal} isDevPanelOpen={isDevPanelOpen} />
      </div>
      <Tour isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
      {flags.ff_payments && <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} onUpgrade={handleModalUpgrade} />}
      <PrivacyPolicyModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />
      {flags.ff_beta_dashboard && <OrchestrationScreen 
        isOpen={isOrchestrationScreenOpen} 
        onClose={() => setIsOrchestrationScreen(false)} 
        onUpgrade={handleOrchestrationUpgrade}
        currentTierId={selectedTier}
        flags={flags}
      />}
       <ReferralsModal 
        isOpen={isReferralsModalOpen} 
        onClose={() => setIsReferralsModalOpen(false)}
        referralLink={referralLink}
      />
       <AgentDetailModal 
        isOpen={!!selectedAgent} 
        onClose={handleCloseAgentModal} 
        agent={selectedAgent} 
      />
      <UserProfileModal
        isOpen={isUserProfileOpen}
        onClose={() => setIsUserProfileOpen(false)}
      />
      {flags.ff_ai_features && <ChatWidget />}
      <CookieConsent onOpenPrivacyPolicy={openPrivacyModal} />
    </div>
  );
};

export default App;
