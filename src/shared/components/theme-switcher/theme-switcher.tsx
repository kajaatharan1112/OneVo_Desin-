import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../../core/theme/theme-context';

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const isLight = theme === 'light';
  const nextLabel = isLight ? 'Switch to dark mode' : 'Switch to light mode';

  return (
    <button
      type="button"
      className="app-navbar__icon-btn"
      onClick={() => setTheme(isLight ? 'dark' : 'light')}
      aria-label={nextLabel}
      title={nextLabel}
    >
      {isLight ? (
        <Moon size={15} strokeWidth={2.1} aria-hidden="true" />
      ) : (
        <Sun size={15} strokeWidth={2.1} aria-hidden="true" />
      )}
    </button>
  );
};
