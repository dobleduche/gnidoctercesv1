
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon } from './icons/CheckIcon';
import { InfoIcon } from './icons/InfoIcon';

interface CookieConsentProps {
  onOpenPrivacyPolicy: () => void;
}

const LOCAL_STORAGE_KEY = 'gnidoc-terces-consent-given';

const CookieConsent: React.FC<CookieConsentProps> = ({ onOpenPrivacyPolicy }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consentGiven = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (consentGiven !== 'true') {
        // Delay showing the banner slightly to avoid layout shifts on load
        const timer = setTimeout(() => setIsVisible(true), 1500);
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.warn('Could not access localStorage for cookie consent:', error);
      setIsVisible(false);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, 'true');
      setIsVisible(false);
    } catch (error) {
      console.warn('Could not save cookie consent to localStorage:', error);
      setIsVisible(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4"
          role="dialog"
          aria-live="polite"
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-description"
        >
          <div className="max-w-4xl mx-auto bg-glass-bg border border-glass-border rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 shadow-2xl backdrop-blur-md">
            <div className="flex-shrink-0">
              <InfoIcon className="h-8 w-8 text-cyan" />
            </div>
            <div className="flex-grow text-center md:text-left">
              <h2 id="cookie-consent-title" className="font-bold text-gray-100">Your Privacy Matters</h2>
              <p id="cookie-consent-description" className="text-sm text-gray-300 mt-1">
                We use necessary cookies and local storage to make our site work. By clicking “Accept”, you agree to our use of these technologies to enhance your experience. For more details, see our{' '}
                <button onClick={onOpenPrivacyPolicy} className="text-cyan hover:underline focus:outline-none">
                  Privacy Policy
                </button>.
              </p>
            </div>
            <div className="flex-shrink-0 w-full md:w-auto mt-2 md:mt-0">
              <button
                onClick={handleAccept}
                className="w-full md:w-auto px-6 py-2 bg-cyan text-dark-bg font-bold rounded-lg hover:bg-cyan/80 transition-colors flex items-center justify-center gap-2"
                aria-label="Accept and close cookie consent banner"
              >
                <CheckIcon className="h-5 w-5" />
                <span>Accept</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(CookieConsent);
