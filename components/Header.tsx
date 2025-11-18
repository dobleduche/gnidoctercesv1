
import React from 'react';
import { LogoIcon } from './icons/LogoIcon';
import UpgradeButton from './UpgradeButton';
import { FeatureFlags } from '../types';
import useDarkMode from '../hooks/useDarkMode';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { useUserStore } from '../state/userStore';
import { signIn } from '../hooks/useAuth';
import { UserIcon } from './icons/UserIcon';
import { UsersIcon } from './icons/UsersIcon';

interface HeaderProps {
  onStartTour: () => void;
  onUpgrade: () => void;
  onOpenOrchestration: () => void;
  onOpenReferrals: () => void;
  onOpenProfile: () => void;
  flags: FeatureFlags;
}

const Header: React.FC<HeaderProps> = ({ onStartTour, onUpgrade, onOpenOrchestration, onOpenReferrals, onOpenProfile, flags }) => {
  const [theme, toggleTheme] = useDarkMode();
  const { user, loading: userLoading } = useUserStore();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="w-full flex justify-between items-center py-4 px-4 md:px-8 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-200 dark:border-glass-border transition-colors duration-300">
      <a href="#" className="flex items-center gap-3" aria-label="gnidoC terceS Homepage">
        <LogoIcon className="h-8 w-8" aria-hidden="true" />
        <span className="font-orbitron font-bold text-lg uppercase">
           <span className="bg-gradient-to-r from-magenta to-cyan text-transparent bg-clip-text">gnidoC</span> terceS
        </span>
      </a>
      <nav className="hidden md:flex items-center gap-6 text-sm">
        <a href="#features" onClick={(e) => handleNavClick(e, 'features')} className="text-gray-600 dark:text-gray-300 hover:text-cyan transition-colors duration-300">Features</a>
        {flags.ff_beta_dashboard && (
          <button onClick={onOpenOrchestration} className="text-gray-600 dark:text-gray-300 hover:text-cyan transition-colors duration-300">Orchestration</button>
        )}
        <a href="#faq" onClick={(e) => handleNavClick(e, 'faq')} className="text-gray-600 dark:text-gray-300 hover:text-cyan transition-colors duration-300">FAQ</a>
        <a href="https://docs.gnidoc.xyz" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-cyan transition-colors duration-300">Docs</a>
        <button onClick={onStartTour} className="text-gray-600 dark:text-gray-300 hover:text-cyan transition-colors duration-300">Start Tour</button>
      </nav>
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:text-cyan hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          aria-label="Toggle theme"
        >
            {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </button>
        <button
          onClick={onOpenReferrals}
          className="group relative h-10 w-10 flex items-center justify-center rounded-full bg-white/10 border border-glass-border hover:border-cyan/50 transition-all duration-300"
          aria-label="Invite Friends"
          title="Invite Friends"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-coral to-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <UsersIcon className="relative h-5 w-5 text-gray-300 transition-colors group-hover:text-white" />
        </button>
        {userLoading ? (
          <div className="h-10 w-24 bg-gray-700/50 animate-pulse rounded-full"></div>
        ) : user ? (
          <button
            onClick={onOpenProfile}
            className="h-10 w-10 rounded-full bg-glass-bg border border-glass-border flex items-center justify-center text-gray-300 hover:text-cyan hover:border-cyan transition-colors"
            aria-label="Open user profile"
          >
            <UserIcon className="h-5 w-5" />
          </button>
        ) : (
          <button
            onClick={signIn}
            className="px-5 py-2 text-sm font-semibold text-white bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            Login
          </button>
        )}
        {flags.ff_payments && (
          <UpgradeButton onClick={onUpgrade} className="rounded-full px-5 py-2 text-sm">
            <span className="mix-blend-multiply">Upgrade</span>
          </UpgradeButton>
        )}
      </div>
    </header>
  );
};

export default React.memo(Header);