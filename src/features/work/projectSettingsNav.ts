export type ProjectSettingsSectionId =
  | 'general'
  | 'members'
  | 'worklogs'
  | 'cycle'
  | 'planner'
  | 'work-items'
  | 'labels'
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
      { id: 'worklogs', label: 'Worklogs' },
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
      { id: 'labels', label: 'Labels' },
    ],
  },
  {
    title: 'Access',
    items: [
      { id: 'participating-workspaces', label: 'Participating workspaces' },
      { id: 'related-projects', label: 'Related projects' },
    ],
  },
];

const VALID_SECTION_IDS = new Set(
  PROJECT_SETTINGS_NAV.flatMap(group => group.items.map(item => item.id)),
);

export function projectSettingsSectionLabel(id: ProjectSettingsSectionId): string {
  for (const group of PROJECT_SETTINGS_NAV) {
    const item = group.items.find(i => i.id === id);
    if (item) return item.label;
  }
  return id;
}

export function normalizeSettingsSection(id: string): ProjectSettingsSectionId {
  if (VALID_SECTION_IDS.has(id as ProjectSettingsSectionId)) {
    return id as ProjectSettingsSectionId;
  }
  return 'general';
}
