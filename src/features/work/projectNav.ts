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
  | 'risks';

export const PROJECT_NAV_TOOLS: { id: ProjectNavId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'work-items', label: 'Work items' },
  { id: 'members', label: 'Members' },
  { id: 'progress', label: 'Progress' },
  { id: 'activity', label: 'Activity log' },
  { id: 'cycle', label: 'Cycles' },
  { id: 'planner', label: 'Planner' },
  { id: 'milestones', label: 'Milestones' },
  { id: 'files', label: 'Files' },
];

export function projectNavLabel(id: ProjectNavId): string {
  return PROJECT_NAV_TOOLS.find(t => t.id === id)?.label ?? id;
}
