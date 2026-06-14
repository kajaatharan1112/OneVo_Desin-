export type ProjectNavId = 'overview' | 'cycle' | 'planner' | 'work-items';

export const PROJECT_NAV_TOOLS: { id: ProjectNavId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'work-items', label: 'Work item' },
  { id: 'cycle', label: 'Cycle' },
  { id: 'planner', label: 'Planner' },
];

export function projectNavLabel(id: ProjectNavId): string {
  return PROJECT_NAV_TOOLS.find(t => t.id === id)?.label ?? id;
}
