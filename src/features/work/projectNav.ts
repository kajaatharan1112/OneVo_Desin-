export type ProjectNavId =
  | 'overview'
  | 'cycle'
  | 'planner'
  | 'work-items'
  | 'members'
  | 'milestones'
  | 'files'
  | 'progress'
  | 'activity'
  | 'reports'
  | 'status'
  | 'completion'
  | 'budget'
  | 'risks'
  | 'goal';

export const PROJECT_NAV_TOOLS: { id: ProjectNavId; label: string }[] = [
  { id: 'overview', label: 'Overall view' },
  { id: 'work-items', label: 'Task board' },
  { id: 'progress', label: 'Analytics' },
  { id: 'goal', label: 'Goal' },
  { id: 'members', label: 'Members' },
];

export function projectNavLabel(id: ProjectNavId): string {
  return PROJECT_NAV_TOOLS.find(t => t.id === id)?.label ?? id;
}
