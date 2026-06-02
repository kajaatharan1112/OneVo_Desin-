import type { ThemeMode } from './theme-types';
import { THEME_STORAGE_KEY } from './theme-types';

export function applyThemeToDocument(theme: ThemeMode): void {
  document.documentElement.setAttribute('data-theme', theme);
  document.body.removeAttribute('data-theme');
  document.documentElement.style.colorScheme = theme;
}

export function readStoredTheme(): ThemeMode | null {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  return null;
}

export function getInitialTheme(): ThemeMode {
  return readStoredTheme() ?? 'dark';
}

export function persistTheme(theme: ThemeMode): void {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}
