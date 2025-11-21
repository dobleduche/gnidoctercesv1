import React from 'react';
import { GenerateIcon } from './icons/GenerateIcon';
import { CheckIcon } from './icons/CheckIcon';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  if (!isOpen) {
    return null;
  }

  const features = [
    'Complete Full-Stack App Generation',
    'Multi-Model AI for Higher Quality Code',
    'Deep Analytical Reversed-Engineered Research Tool',
    'Full Code Export & One-Click Deploy',
    'Priority Support & Feature Access',
  ];

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-title"
    >
      <div
        className="bg-dark-bg border-2 border-cyan shadow-neon-cyan rounded-xl p-8 max-w-lg w-full mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors text-3xl leading-none"
          aria-label="Close"
        >
          &times;
        </button>

        <h2 id="upgrade-title" className="text-3xl font-orbitron font-bold text-center mb-4">
          <span className="bg-gradient-to-r from-cyan via-lime to-yellow text-transparent bg-clip-text">
            Upgrade to Pro
          </span>
        </h2>
        <p className="text-gray-300 mb-6 text-center">
          Unlock the full potential of AI-powered development.
        </p>

        <div className="space-y-3 mb-8">
          {features.map((feature) => (
            <div key={feature} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
              <CheckIcon className="h-5 w-5 text-lime flex-shrink-0 mt-0.5" />
              <span className="text-gray-200">{feature}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onUpgrade}
          className="w-full group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-magenta to-cyan rounded-full overflow-hidden transition-all duration-300 hover:shadow-neon-magenta focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg focus:ring-cyan"
        >
          <span className="absolute inset-0 bg-dark-bg transition-all duration-300 group-hover:opacity-0"></span>
          <span className="relative flex items-center gap-2">
            <GenerateIcon />
            Unlock All Features
          </span>
        </button>
      </div>
    </div>
  );
};

export default React.memo(UpgradeModal);
