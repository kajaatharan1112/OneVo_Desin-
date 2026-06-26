export type ProjectSettingsSectionId =
  | 'general'
  | 'schedule'
  | 'members'
  | 'worklogs'
  | 'cycle'
  | 'planner'
  | 'work-items'
  | 'labels'
  | 'custom-fields'
  | 'advanced'
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
      { id: 'schedule', label: 'Schedule' },
      { id: 'members', label: 'Members' },
    ],
  },
  {
    title: 'Work Structure',
    items: [
      { id: 'labels', label: 'Labels' },
      { id: 'custom-fields', label: 'Custom fields' },
    ],
  },
  {
    title: 'Access & Advanced',
    items: [
      { id: 'participating-workspaces', label: 'Participating workspaces' },
      { id: 'related-projects', label: 'Related projects' },
      { id: 'advanced', label: 'Advanced Settings' },
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
