import { useState, useEffect, useCallback } from 'react';
import { FeatureFlagId, FeatureFlags } from '../types';

const DEFAULT_FLAGS: FeatureFlags = {
  ff_payments: true,
  ff_ai_features: true,
  ff_beta_dashboard: true,
};

const LOCAL_STORAGE_KEY = 'gnidoc-terces-feature-flags';

export const getFeatureFlags = (): FeatureFlags => {
  try {
    const storedFlags = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedFlags) {
      // Merge stored flags with defaults to ensure all flags are present
      return { ...DEFAULT_FLAGS, ...JSON.parse(storedFlags) };
    }
  } catch (error) {
    console.warn('Could not parse feature flags from localStorage', error);
  }
  return DEFAULT_FLAGS;
};

export const useFeatureFlags = () => {
  const [flags, setFlags] = useState<FeatureFlags>(getFeatureFlags);

  useEffect(() => {
    const handleStorageChange = () => {
      setFlags(getFeatureFlags());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const updateFlag = useCallback((flag: FeatureFlagId, value: boolean) => {
    setFlags(prevFlags => {
      const newFlags = { ...prevFlags, [flag]: value };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newFlags));
        // Dispatch a storage event to sync other tabs
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: LOCAL_STORAGE_KEY,
            newValue: JSON.stringify(newFlags),
          })
        );
      } catch (error) {
        console.warn('Could not save feature flags to localStorage', error);
      }
      return newFlags;
    });
  }, []);

  return { flags, updateFlag };
};
