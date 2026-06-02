import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../../core/theme/theme-context';

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="theme-switcher"
      role="group"
      aria-label="Color theme"
    >
      <button
        type="button"
        className={`theme-switcher__btn${theme === 'light' ? ' theme-switcher__btn--active' : ''}`}
        onClick={() => setTheme('light')}
        aria-pressed={theme === 'light'}
        aria-label="Light theme"
        title="Light theme"
      >
        <Sun size={15} aria-hidden="true" />
      </button>
      <button
        type="button"
        className={`theme-switcher__btn${theme === 'dark' ? ' theme-switcher__btn--active' : ''}`}
        onClick={() => setTheme('dark')}
        aria-pressed={theme === 'dark'}
        aria-label="Dark theme"
        title="Dark theme"
      >
        <Moon size={15} aria-hidden="true" />
      </button>
    </div>
  );
};
