import React, { useState, useMemo } from 'react';

interface TourProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOUR_STEPS = [
  {
    title: 'Welcome to gnidoC terceS!',
    content: 'Let\'s build your first full-stack application in seconds. This quick tour will show you how.',
  },
  {
    title: '1. Start with an Idea',
    content: 'Everything begins here. Describe your app in detail—features, tech stack, design—and our AI will create a comprehensive build plan.',
  },
  {
    title: '2. Watch the AI Agents Build',
    content: 'Visualize our team of specialized AI agents as they collaborate to generate your UI, backend, database, and more, all in real-time.',
  },
  {
    title: '3. Supercharge Your Build',
    content: 'For complex projects, you can orchestrate multiple AI models to achieve higher-quality code and more sophisticated features.',
  },
  {
    title: 'You\'re Ready to Build!',
    content: 'That\'s it! Enter your prompt below to bring your idea to life. Let\'s create something amazing.',
  },
];

const Tour: React.FC<TourProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);

  const currentStep = useMemo(() => TOUR_STEPS[step], [step]);

  const nextStep = () => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      handleClose();
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(s => s - 1);
    }
  };
  
  const handleClose = () => {
    setStep(0);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={handleClose} role="dialog" aria-modal="true" aria-labelledby="tour-title">
      <div className="bg-dark-bg border-2 border-cyan shadow-neon-cyan rounded-xl p-8 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <h2 id="tour-title" className="text-2xl font-orbitron font-bold text-cyan mb-4">{currentStep.title}</h2>
        <p className="text-gray-300 mb-6">{currentStep.content}</p>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500" aria-live="polite">
            Step {step + 1} of {TOUR_STEPS.length}
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <button onClick={prevStep} className="px-4 py-2 text-sm bg-white/10 border border-glass-border rounded-full hover:bg-white/20 transition-colors">
                Previous
              </button>
            )}
            <button onClick={nextStep} className="px-4 py-2 text-sm bg-cyan text-dark-bg font-bold rounded-full hover:bg-cyan/80 transition-colors">
              {step === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Tour);