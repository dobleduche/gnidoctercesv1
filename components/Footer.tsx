import React from 'react';
import { LogoIcon } from './icons/LogoIcon';
import FeatureFlagManager from './FeatureFlagManager';

interface FooterProps {
  onOpenPrivacyPolicy: () => void;
  isDevPanelOpen: boolean;
}

const Footer: React.FC<FooterProps> = ({ onOpenPrivacyPolicy, isDevPanelOpen }) => {
  return (
    <footer className="w-full border-t border-gray-200 dark:border-glass-border mt-20 py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-6">
        {isDevPanelOpen && <FeatureFlagManager />}
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <LogoIcon className="h-6 w-6" />
            <span className="text-sm">
              &copy; {new Date().getFullYear()} gnidoC terceS. Produced by Intruvurt Labs.
            </span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
            <a href="#" className="hover:text-cyan transition-colors">
              Twitter
            </a>
            <button onClick={onOpenPrivacyPolicy} className="hover:text-cyan transition-colors">
              Privacy Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default React.memo(Footer);
