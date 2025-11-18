import React from 'react';
import UpgradeButton from './UpgradeButton';
import { LogoIcon } from './icons/LogoIcon';
import { FeatureFlags } from '../types';

interface HeroProps {
  onStartTour: () => void;
  onUpgrade: () => void;
  isGenerating: boolean;
  children: React.ReactNode;
  flags: FeatureFlags;
}

const Hero: React.FC<HeroProps> = ({ onStartTour, onUpgrade, isGenerating, children, flags }) => {
  return (
    <section className={`flex flex-col items-center justify-center text-center py-20 transition-all duration-500 ${isGenerating ? 'min-h-[auto] md:pt-24 md:pb-12' : 'min-h-[calc(100vh-80px)]'}`}>
      <LogoIcon className="h-24 w-24 md:h-32 md:w-32 mb-8 animate-pulse-glow" />
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-orbitron font-black uppercase tracking-wider">
        <span className="bg-gradient-to-r from-magenta to-cyan text-transparent bg-clip-text animate-gradient-pan bg-[length:200%_auto]">
          Build Full-Stack Apps
        </span>
        <br />
        With A Single Prompt
      </h1>
      <p className={`max-w-2xl mx-auto mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-400 transition-opacity duration-500 ${isGenerating ? 'opacity-0 h-0 invisible' : 'opacity-100'}`}>
        gnidoC terceS is a no-code AI app builder that turns your ideas into full-stack, secure, and shippable mobile or web applications.
      </p>
      <div className={`mt-10 flex flex-col sm:flex-row items-center gap-4 transition-opacity duration-500 ${isGenerating ? 'opacity-0 h-0 invisible' : 'opacity-100'}`}>
        {flags.ff_payments && (
          <UpgradeButton onClick={onUpgrade} className="rounded-full px-8 py-3 text-lg font-bold">
            <span className="mix-blend-multiply">Upgrade • Pro Build</span>
          </UpgradeButton>
        )}
        <button onClick={onStartTour} className="text-cyan hover:underline">
          Take a Quick Tour
        </button>
      </div>
      
      <div className="mt-12 w-full">
        {children}
      </div>
    </section>
  );
};

export default React.memo(Hero);