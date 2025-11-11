
import React from 'react';
import { LogoIcon } from './icons/LogoIcon';
import UpgradeButton from './UpgradeButton';
import { GiftIcon } from './icons/GiftIcon';

interface HeaderProps {
  onStartTour: () => void;
  onUpgrade: () => void;
  onOpenOrchestration: () => void;
  onOpenReferrals: () => void;
}

const Header: React.FC<HeaderProps> = ({ onStartTour, onUpgrade, onOpenOrchestration, onOpenReferrals }) => {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="w-full flex justify-between items-center py-4 px-4 md:px-8 backdrop-blur-sm sticky top-0 z-50 border-b border-glass-border">
      <a href="#" className="flex items-center gap-3">
        <LogoIcon className="h-8 w-8" />
        <span className="font-orbitron font-bold text-lg uppercase">
           <span className="bg-gradient-to-r from-magenta to-cyan text-transparent bg-clip-text">gnidoC</span> terceS
        </span>
      </a>
      <nav className="hidden md:flex items-center gap-6 text-sm">
        <a href="#features" onClick={(e) => handleNavClick(e, 'features')} className="text-gray-300 hover:text-cyan transition-colors duration-300">Features</a>
        <button onClick={onOpenOrchestration} className="text-gray-300 hover:text-cyan transition-colors duration-300">Orchestration</button>
        <a href="#faq" onClick={(e) => handleNavClick(e, 'faq')} className="text-gray-300 hover:text-cyan transition-colors duration-300">FAQ</a>
        <a href="#" className="text-gray-300 hover:text-cyan transition-colors duration-300">Docs</a>
        <button onClick={onStartTour} className="text-gray-300 hover:text-cyan transition-colors duration-300">Start Tour</button>
      </nav>
      <div className="flex items-center gap-4">
        <button onClick={onOpenReferrals} className="hidden sm:flex items-center gap-2 text-sm text-gray-300 hover:text-cyan transition-colors duration-300">
            <GiftIcon className="h-5 w-5" />
            <span>Invite Friends</span>
        </button>
        <UpgradeButton onClick={onUpgrade} className="rounded-full px-5 py-2 text-sm">
          <span className="mix-blend-multiply">Upgrade</span>
        </UpgradeButton>
      </div>
    </header>
  );
};

export default React.memo(Header);