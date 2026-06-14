export type ProjectSettingsSectionId =
  | 'general'
  | 'members'
  | 'cycle'
  | 'planner'
  | 'work-items'
  | 'states'
  | 'labels'
  | 'approvals'
  | 'visibility'
  | 'participating-workspaces'
  | 'related-projects';

export interface ProjectSettingsNavGroup {
  title: string;
  items: { id: ProjectSettingsSectionId; label: string }[];
}

export const PROJECT_SETTINGS_NAV: ProjectSettingsNavGroup[] = [
  {
    title: 'General',
    items: [
      { id: 'general', label: 'General' },
      { id: 'members', label: 'Members' },
    ],
  },
  {
    title: 'Features',
    items: [
      { id: 'cycle', label: 'Cycle' },
      { id: 'planner', label: 'Planner' },
      { id: 'work-items', label: 'Work item' },
    ],
  },
  {
    title: 'Work structure',
    items: [
      { id: 'states', label: 'States' },
      { id: 'labels', label: 'Labels' },
      { id: 'approvals', label: 'Approvals' },
    ],
  },
  {
    title: 'Access',
    items: [
      { id: 'visibility', label: 'Visibility' },
      { id: 'participating-workspaces', label: 'Participating workspaces' },
      { id: 'related-projects', label: 'Related projects' },
    ],
  },
];

export function projectSettingsSectionLabel(id: ProjectSettingsSectionId): string {
  for (const group of PROJECT_SETTINGS_NAV) {
    const item = group.items.find(i => i.id === id);
    if (item) return item.label;
  }
  return id;
}
