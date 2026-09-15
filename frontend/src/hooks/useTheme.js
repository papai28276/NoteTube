import { useState, useLayoutEffect } from 'react';
import { flushSync } from 'react-dom';

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('notetube-theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('notetube-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    if (!document.startViewTransition) {
      setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
      return;
    }
    document.startViewTransition(() => {
      flushSync(() => {
        setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
      });
    });
  };

  return { theme, toggleTheme };
}
