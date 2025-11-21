import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

function useDarkMode(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>('dark'); // Default to dark to avoid flash on initial load

  // Effect to set initial theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = window.localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  // Effect to apply class and save preference when theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  return [theme, toggleTheme];
}

export default useDarkMode;
