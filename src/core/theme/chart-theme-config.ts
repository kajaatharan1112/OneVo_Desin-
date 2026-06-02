import type { ThemeMode } from './theme-types';

export interface ChartThemeTokens {
  palette: string[];
  textColor: string;
  headingColor: string;
  gridColor: string;
  /** Dark blue — finished bars, ring progress */
  primary: string;
  primaryOpacity: number;
  /** Light blue — pending bars, ring track */
  lightBlue: string;
  lightBlueOpacity: number;
  ringTrack: string;
  tooltipTheme: 'dark' | 'light';
}

export function getChartTheme(mode: ThemeMode): ChartThemeTokens {
  const isDark = mode === 'dark';

  const primary = '#1E4FC0';
  const lightBlue = isDark ? '#38BDF8' : '#0EA5E9';

  return {
    palette: [primary, lightBlue, '#10B981', '#64748B', '#E2E8F0'],
    textColor: isDark ? '#94A3B8' : '#64748B',
    headingColor: isDark ? '#F8FAFC' : '#0F172A',
    gridColor: isDark ? '#334155' : '#C4CAD2',
    primary,
    primaryOpacity: 0.72,
    lightBlue,
    lightBlueOpacity: 0.55,
    ringTrack: isDark
      ? 'rgba(56, 189, 248, 0.35)'
      : 'rgba(14, 165, 233, 0.4)',
    tooltipTheme: isDark ? 'dark' : 'light'
  };
}
