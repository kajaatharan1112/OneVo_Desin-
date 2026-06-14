export const PROJECT_COVER_COLORS = [
  '#6366f1',
  '#3b82f6',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#64748b',
  '#14b8a6',
];

export function randomCoverColor(): string {
  return PROJECT_COVER_COLORS[Math.floor(Math.random() * PROJECT_COVER_COLORS.length)];
}
