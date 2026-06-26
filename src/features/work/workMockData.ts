export const CURRENT_USER_ID = 'current-user';

export type WorkspaceStatus = 'active' | 'archived';
export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'archived';
export type ProjectVisibility = 'private' | 'public_workspace';
export type ProjectHealth = 'on_track' | 'at_risk' | 'delayed';
export type DocumentStatus = 'draft' | 'in_review' | 'approved' | 'published' | 'archived';
export type MilestoneStatus = 'upcoming' | 'reached' | 'missed';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type WorkspaceRole = 'admin' | 'member' | 'viewer';
export type ProjectAccessLevel = 'admin' | 'member' | 'viewer';
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type LinkedWorkspaceStatus = 'active' | 'pending' | 'rejected' | 'removed';
export type RelatedProjectRelationship = 'parent' | 'child' | 'related' | 'blocks' | 'blocked_by';
export type RelatedProjectLinkStatus = 'active' | 'pending' | 'rejected';
export type WorkspaceLinkPermission = 'manage' | 'request' | 'none';

export interface WorkWorkspace {
  id: string;
  name: string;
  description: string;
  ownerName: string;
  ownerId: string;
  memberCount: number;
  linkedProjectCount: number;
  status: WorkspaceStatus;
}

export interface WorkEmployee {
  id: string;
  name: string;
  position: string;
  department: string;
  workspaceIds: string[];
}

export interface ProjectMember {
  id: string;
  employeeId: string;
  accessLevel: ProjectAccessLevel;
  status: 'active' | 'invited';
  workspaceSourceId: string | null;
}

export type ParticipatingWorkspaceAccess = 'private' | 'workspace_visible';

export type ParticipatingWorkspaceRole =
  | 'main_team'
  | 'supporting_team'
  | 'reviewer'
  | 'delivery_partner';

export interface LinkedWorkspace {
  workspaceId: string;
  status: LinkedWorkspaceStatus;
  /** Role in project — e.g. Main team, Supporting team */
  role: string;
  access?: ParticipatingWorkspaceAccess;
}

export interface ProjectLabel {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface WorkItemState {
  id: TaskStatus;
  name: string;
  wipLimit?: number;
}

export interface CustomFieldDefinition {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select';
  options?: string[];
}

export interface ProjectBudgetExpense {
  id: string;
  projectId: string;
  name: string;
  cost: number;
  category: string;
  date: string;
}

export interface ProjectRisk {
  id: string;
  projectId: string;
  name: string;
  likelihood: 'High' | 'Medium' | 'Low';
  impact: 'High' | 'Medium' | 'Low';
  mitigation: string;
  status: 'identified' | 'mitigated' | 'triggered' | 'closed';
}

export interface WorkProject {
  id: string;
  key: string;
  name: string;
  description: string;
  status: ProjectStatus;
  health: ProjectHealth;
  priority: 'Low' | 'Medium' | 'High';
  workspaceIds: string[];
  linkedWorkspaces: LinkedWorkspace[];
  members: ProjectMember[];
  openTasks: number;
  dueDate: string | null;
  startDate: string;
  endDate: string | null;
  defaultPriority: TaskPriority;
  timezone: string;
  icon: string;
  iconType: 'emoji' | 'icon';
  iconColor: string | null;
  coverColor: string;
  coverImage: string | null;
  leadId: string;
  labels: ProjectLabel[];
  workItemStates: WorkItemState[];
  approvalRequired: boolean;
  defaultApproverId: string | null;
  visibility: ProjectVisibility;
  primaryWorkspaceId: string | null;
  budgetLimit?: number;
  spentBudget?: number;
  customFieldDefinitions?: CustomFieldDefinition[];
  allocatedHours?: number;
  riskLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
  tags?: string[];
}

export interface UserWorkspaceScope {
  workspaceId: string;
  permission: WorkspaceLinkPermission;
  canViewMemberCount: boolean;
}

export interface RelatedProjectLink {
  id: string;
  projectId: string;
  relatedProjectId: string | null;
  relationship: RelatedProjectRelationship;
  status: RelatedProjectLinkStatus;
  manualLabel?: string;
  manualKey?: string;
}

export interface RelatedProjectDisplay {
  id: string;
  label: string;
  relationship: string;
  linkStatus: RelatedProjectLinkStatus;
  projectStatus?: string;
  health?: string;
  workspace?: string;
  owner?: string;
  restricted: boolean;
}

export interface WorkTaskChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface WorkTaskChecklistGroup {
  id: string;
  name: string;
  items: WorkTaskChecklistItem[];
}

export interface WorkTaskActivity {
  id: string;
  text: string;
  time: string;
}

export interface WorkTask {
  id: string;
  key: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  projectKey: string;
  workspaceIds: string[];
  linkedWorkspaceId: string | null;
  assigneeId: string;
  assigneeIds?: string[];
  status: TaskStatus;
  dueDate: string | null;
  startDate?: string | null;
  endDate?: string | null;
  priority: TaskPriority;
  labels: string[];
  estimate?: number;
  blocked?: boolean;
  blocks?: string[];
  blockedBy?: string[];
  relatesTo?: string[];
  checklist?: WorkTaskChecklistGroup[];
  approvalRequired?: boolean;
  approvalStatus?: ApprovalStatus;
  approverId?: string | null;
  watchers?: string[];
  activity?: WorkTaskActivity[];
  customFieldValues?: Record<string, string | number>;
}

export interface PlannerItem {
  id: string;
  type: 'board' | 'sprint' | 'milestone' | 'roadmap' | 'cycle';
  name: string;
  projectId: string;
  projectName: string;
  workspaceIds: string[];
  date: string | null;
  status?: string;
}

export interface PlannerMilestone {
  id: string;
  name: string;
  description: string;
  projectId: string;
  dueDate: string;
  status: MilestoneStatus;
  ownerId: string;
  linkedWorkItemIds: string[];
}

export interface PlannerRoadmapItem {
  id: string;
  name: string;
  projectId: string;
  startDate: string;
  endDate: string;
  ownerId: string;
  status: string;
}

export interface WorkDocument {
  id: string;
  name: string;
  type: string;
  ownerId: string;
  projectId: string | null;
  projectName: string | null;
  workspaceIds: string[];
  scope: 'workspace' | 'project';
  status: DocumentStatus;
  version: string;
  locked: boolean;
  updatedAt: string;
}

export interface ProjectCycle {
  id: string;
  name: string;
  projectId: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
  goal?: string;
  ownerId?: string;
  workItemIds?: string[];
}

export interface ProjectModule {
  id: string;
  name: string;
  projectId: string;
  description: string;
  leadId: string;
  status: 'planned' | 'in_progress' | 'completed';
}

export const TASK_STATUSES: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'review', 'done'];

export const DEFAULT_WORK_ITEM_STATES: WorkItemState[] = [
  { id: 'backlog', name: 'Backlog' },
  { id: 'todo', name: 'Todo', wipLimit: 20 },
  { id: 'in_progress', name: 'In Progress', wipLimit: 8 },
  { id: 'review', name: 'Review', wipLimit: 5 },
  { id: 'done', name: 'Done' },
];

export const DEFAULT_PROJECT_LABELS: ProjectLabel[] = [
  { id: 'lbl-design', name: 'design', color: '#8b5cf6', description: 'Design work' },
  { id: 'lbl-frontend', name: 'frontend', color: '#3b82f6', description: 'Frontend tasks' },
  { id: 'lbl-backend', name: 'backend', color: '#10b981', description: 'Backend tasks' },
  { id: 'lbl-ux', name: 'ux', color: '#f59e0b', description: 'UX improvements' },
  { id: 'lbl-security', name: 'security', color: '#ef4444', description: 'Security related' },
  { id: 'lbl-infra', name: 'infra', color: '#6366f1', description: 'Infrastructure' },
  { id: 'lbl-docs', name: 'docs', color: '#64748b', description: 'Documentation' },
  { id: 'lbl-planning', name: 'planning', color: '#0ea5e9', description: 'Planning' },
  { id: 'lbl-mobile', name: 'mobile', color: '#14b8a6', description: 'Mobile work' },
  { id: 'lbl-metrics', name: 'metrics', color: '#a855f7', description: 'Metrics & observability' },
  { id: 'lbl-tracing', name: 'tracing', color: '#ec4899', description: 'Distributed tracing' },
  { id: 'lbl-navigation', name: 'navigation', color: '#22c55e', description: 'Navigation IA' },
  { id: 'lbl-settings', name: 'settings', color: '#78716c', description: 'Settings & config' },
];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  todo: 'Todo',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

export const ALL_WORKSPACES_ID = 'all';

export const MOCK_EMPLOYEES: WorkEmployee[] = [
  { id: 'current-user', name: 'Alex Rivera', position: 'Product Lead', department: 'Product', workspaceIds: ['ws-eng', 'ws-product', 'ws-backend'] },
  { id: 'user-2', name: 'Priya Sharma', position: 'Engineering Manager', department: 'Engineering', workspaceIds: ['ws-eng', 'ws-hr'] },
  { id: 'user-3', name: 'Maria Lopez', position: 'Backend Lead', department: 'Engineering', workspaceIds: ['ws-backend', 'ws-eng'] },
  { id: 'user-4', name: 'James Chen', position: 'Head of Product', department: 'Product', workspaceIds: ['ws-product', 'ws-hr'] },
  { id: 'user-5', name: 'Sam Okonkwo', position: 'Mobile Engineer', department: 'Engineering', workspaceIds: ['ws-product', 'ws-eng'] },
  { id: 'user-6', name: 'Elena Vasquez', position: 'QA Lead', department: 'Quality', workspaceIds: ['ws-eng'] },
];

export const MOCK_WORKSPACES: WorkWorkspace[] = [
  { id: 'ws-eng', name: 'Engineering Workspace', description: 'Engineering delivery context', ownerName: 'Priya Sharma', ownerId: 'user-2', memberCount: 18, linkedProjectCount: 3, status: 'active' },
  { id: 'ws-backend', name: 'Backend Workspace', description: 'Backend squad context', ownerName: 'Maria Lopez', ownerId: 'user-3', memberCount: 9, linkedProjectCount: 2, status: 'active' },
  { id: 'ws-product', name: 'Product Workspace', description: 'Product initiatives', ownerName: 'James Chen', ownerId: 'user-4', memberCount: 12, linkedProjectCount: 3, status: 'active' },
];

export const MOCK_PROJECTS: WorkProject[] = [
  {
    id: 'proj-1', key: 'ONEVO', name: 'OneVo Platform Refresh', description: 'Navigation and work experience improvements',
    status: 'active', health: 'on_track', priority: 'High', workspaceIds: ['ws-eng', 'ws-product'],
    linkedWorkspaces: [
      { workspaceId: 'ws-eng', status: 'active', role: 'Main team', access: 'private' },
      { workspaceId: 'ws-product', status: 'active', role: 'Supporting team', access: 'private' },
    ],
    members: [
      { id: 'pm-1', employeeId: 'current-user', accessLevel: 'admin', status: 'active', workspaceSourceId: 'ws-eng' },
      { id: 'pm-2', employeeId: 'user-2', accessLevel: 'member', status: 'active', workspaceSourceId: 'ws-eng' },
      { id: 'pm-3', employeeId: 'user-4', accessLevel: 'member', status: 'active', workspaceSourceId: 'ws-product' },
    ],
    openTasks: 14, dueDate: '2026-08-15', startDate: '2026-05-01', endDate: '2026-08-30',
    defaultPriority: 'High', timezone: 'America/New_York', icon: 'layers', iconType: 'icon', iconColor: null, coverColor: '#6366f1', coverImage: null,
    leadId: 'current-user', labels: DEFAULT_PROJECT_LABELS, workItemStates: DEFAULT_WORK_ITEM_STATES,
    approvalRequired: true, defaultApproverId: 'user-2',
    visibility: 'private', primaryWorkspaceId: 'ws-eng',
    budgetLimit: 120000, spentBudget: 42500,
    customFieldDefinitions: [
      { id: 'cf-dept', name: 'Department Code', type: 'text' },
      { id: 'cf-billing', name: 'Billing Status', type: 'select', options: ['Billable', 'Non-Billable', 'Internal'] }
    ]
  },
  {
    id: 'proj-2', key: 'GATE', name: 'API Gateway Migration', description: 'Move internal services to unified gateway',
    status: 'active', health: 'at_risk', priority: 'Medium', workspaceIds: ['ws-backend', 'ws-eng'],
    linkedWorkspaces: [
      { workspaceId: 'ws-backend', status: 'active', role: 'Backend squad' },
      { workspaceId: 'ws-eng', status: 'active', role: 'Platform support' },
    ],
    members: [
      { id: 'pm-4', employeeId: 'current-user', accessLevel: 'admin', status: 'active', workspaceSourceId: 'ws-backend' },
      { id: 'pm-5', employeeId: 'user-3', accessLevel: 'admin', status: 'active', workspaceSourceId: 'ws-backend' },
    ],
    openTasks: 8, dueDate: '2026-07-20', startDate: '2026-04-10', endDate: '2026-07-31',
    defaultPriority: 'Medium', timezone: 'UTC', icon: 'server', iconType: 'icon', iconColor: null, coverColor: '#f59e0b', coverImage: null,
    leadId: 'user-3', labels: DEFAULT_PROJECT_LABELS.slice(0, 8), workItemStates: DEFAULT_WORK_ITEM_STATES,
    approvalRequired: false, defaultApproverId: null,
    visibility: 'private', primaryWorkspaceId: 'ws-backend',
    budgetLimit: 85000, spentBudget: 31000,
    customFieldDefinitions: [
      { id: 'cf-sec-review', name: 'Security Sign-off', type: 'select', options: ['Pending', 'Approved', 'Rejected'] }
    ]
  },
  {
    id: 'proj-3', key: 'MOBL', name: 'Mobile App v2', description: 'Employee mobile experience',
    status: 'active', health: 'on_track', priority: 'High', workspaceIds: ['ws-product'],
    linkedWorkspaces: [{ workspaceId: 'ws-product', status: 'active', role: 'Product delivery' }],
    members: [
      { id: 'pm-6', employeeId: 'current-user', accessLevel: 'member', status: 'active', workspaceSourceId: 'ws-product' },
      { id: 'pm-7', employeeId: 'user-5', accessLevel: 'admin', status: 'active', workspaceSourceId: 'ws-product' },
    ],
    openTasks: 22, dueDate: '2026-09-01', startDate: '2026-03-01', endDate: '2026-09-15',
    defaultPriority: 'High', timezone: 'America/Los_Angeles', icon: 'smartphone', iconType: 'icon', iconColor: null, coverColor: '#10b981', coverImage: null,
    leadId: 'user-5', labels: DEFAULT_PROJECT_LABELS.slice(0, 6), workItemStates: DEFAULT_WORK_ITEM_STATES,
    approvalRequired: false, defaultApproverId: null,
    visibility: 'public_workspace', primaryWorkspaceId: 'ws-product',
    budgetLimit: 200000, spentBudget: 125000
  },
  {
    id: 'proj-5', key: 'OBSV', name: 'Backend Observability', description: 'Tracing and metrics rollout',
    status: 'active', health: 'on_track', priority: 'Medium', workspaceIds: ['ws-backend'],
    linkedWorkspaces: [{ workspaceId: 'ws-backend', status: 'active', role: 'Infrastructure' }],
    members: [
      { id: 'pm-9', employeeId: 'current-user', accessLevel: 'member', status: 'active', workspaceSourceId: 'ws-backend' },
      { id: 'pm-10', employeeId: 'user-3', accessLevel: 'admin', status: 'active', workspaceSourceId: 'ws-backend' },
    ],
    openTasks: 6, dueDate: '2026-07-05', startDate: '2026-05-15', endDate: '2026-07-15',
    defaultPriority: 'Medium', timezone: 'UTC', icon: 'activity', iconType: 'icon', iconColor: null, coverColor: '#8b5cf6', coverImage: null,
    leadId: 'user-3', labels: DEFAULT_PROJECT_LABELS.filter(l => ['metrics', 'tracing', 'infra', 'backend', 'docs'].includes(l.name)),
    workItemStates: DEFAULT_WORK_ITEM_STATES, approvalRequired: false, defaultApproverId: null,
    visibility: 'private', primaryWorkspaceId: 'ws-backend',
  },
  {
    id: 'proj-fe', key: 'FEND', name: 'Frontend Refresh', description: 'Frontend delivery stream for platform refresh',
    status: 'active', health: 'on_track', priority: 'Medium', workspaceIds: ['ws-eng', 'ws-product'],
    linkedWorkspaces: [
      { workspaceId: 'ws-eng', status: 'active', role: 'Delivery' },
      { workspaceId: 'ws-product', status: 'active', role: 'Product context' },
    ],
    members: [
      { id: 'pm-fe-1', employeeId: 'current-user', accessLevel: 'admin', status: 'active', workspaceSourceId: 'ws-eng' },
      { id: 'pm-fe-2', employeeId: 'user-4', accessLevel: 'member', status: 'active', workspaceSourceId: 'ws-product' },
    ],
    openTasks: 9, dueDate: '2026-08-01', startDate: '2026-05-15', endDate: '2026-08-15',
    defaultPriority: 'High', timezone: 'America/New_York', icon: 'layers', iconType: 'icon', iconColor: null, coverColor: '#3b82f6', coverImage: null,
    leadId: 'current-user', labels: DEFAULT_PROJECT_LABELS.slice(0, 5), workItemStates: DEFAULT_WORK_ITEM_STATES,
    approvalRequired: false, defaultApproverId: null,
    visibility: 'private', primaryWorkspaceId: 'ws-eng',
  },
  {
    id: 'proj-be', key: 'BEND', name: 'Backend Refresh', description: 'Backend delivery stream for platform refresh',
    status: 'active', health: 'at_risk', priority: 'High', workspaceIds: ['ws-backend'],
    linkedWorkspaces: [{ workspaceId: 'ws-backend', status: 'active', role: 'Infrastructure' }],
    members: [
      { id: 'pm-be-1', employeeId: 'user-3', accessLevel: 'admin', status: 'active', workspaceSourceId: 'ws-backend' },
    ],
    openTasks: 11, dueDate: '2026-07-30', startDate: '2026-05-15', endDate: '2026-07-31',
    defaultPriority: 'High', timezone: 'UTC', icon: 'server', iconType: 'icon', iconColor: null, coverColor: '#0ea5e9', coverImage: null,
    leadId: 'user-3', labels: DEFAULT_PROJECT_LABELS.slice(0, 4), workItemStates: DEFAULT_WORK_ITEM_STATES,
    approvalRequired: false, defaultApproverId: null,
    visibility: 'private', primaryWorkspaceId: 'ws-backend',
  },
];

export const MOCK_BUDGET_EXPENSES: ProjectBudgetExpense[] = [
  { id: 'exp-1', projectId: 'proj-1', name: 'UI/UX Contractor', cost: 25000, category: 'Consulting', date: '2026-05-15' },
  { id: 'exp-2', projectId: 'proj-1', name: 'Database Hosting Setup', cost: 5000, category: 'Infrastructure', date: '2026-06-01' },
  { id: 'exp-3', projectId: 'proj-1', name: 'QA Automation Contractor', cost: 12500, category: 'Contractors', date: '2026-06-10' },
  { id: 'exp-4', projectId: 'proj-2', name: 'Security Audit Review', cost: 15000, category: 'Professional Services', date: '2026-04-20' },
  { id: 'exp-5', projectId: 'proj-2', name: 'API Gateway License Fee', cost: 16000, category: 'Software Licenses', date: '2026-05-01' },
];

export const MOCK_RISKS: ProjectRisk[] = [
  { id: 'risk-1', projectId: 'proj-1', name: 'Scope creep on platform pages', likelihood: 'High', impact: 'Medium', mitigation: 'Implement strict sign-off for any changes to original mock designs', status: 'identified' },
  { id: 'risk-2', projectId: 'proj-1', name: 'Key backend resource shortage', likelihood: 'Medium', impact: 'High', mitigation: 'Cross-train frontend devs on basic Node/Go APIs', status: 'mitigated' },
  { id: 'risk-3', projectId: 'proj-1', name: 'App store approval delays', likelihood: 'Low', impact: 'High', mitigation: 'Submit draft review build early with minimal features', status: 'identified' },
  { id: 'risk-4', projectId: 'proj-2', name: 'Performance degradation during cutover', likelihood: 'Medium', impact: 'High', mitigation: 'Load test using replica traffic in staging environment', status: 'mitigated' },
];


export const MOCK_RELATED_PROJECTS: RelatedProjectLink[] = [
  { id: 'rp-1', projectId: 'proj-1', relatedProjectId: 'proj-fe', relationship: 'child', status: 'active' },
  { id: 'rp-2', projectId: 'proj-1', relatedProjectId: 'proj-be', relationship: 'child', status: 'pending', manualLabel: 'Backend Refresh', manualKey: 'BEND' },
  { id: 'rp-seed-1', projectId: 'proj-1', relatedProjectId: 'proj-2', relationship: 'related', status: 'pending' },
];

export const MOCK_TASKS: WorkTask[] = [
  {
    id: 'task-1', key: 'ONEVO-12', title: 'Refine Work navigation spec', description: 'Update IA and sub-nav patterns for Work module',
    projectId: 'proj-1', projectName: 'OneVo Platform Refresh', projectKey: 'ONEVO', workspaceIds: ['ws-eng', 'ws-product'],
    linkedWorkspaceId: 'ws-eng', assigneeId: 'current-user', assigneeIds: ['current-user'], status: 'in_progress',
    dueDate: '2026-06-14', priority: 'High', labels: ['design', 'navigation'], estimate: 5,
    checklist: [{ id: 'cl-1', name: 'Deliverables', items: [
      { id: 'cli-1', text: 'Sub-nav hierarchy spec', done: true },
      { id: 'cli-2', text: 'Project tree behavior', done: true },
      { id: 'cli-3', text: 'Stakeholder review', done: false },
    ]}],
    watchers: ['user-2', 'user-4'],
    activity: [
      { id: 'a1', text: 'Alex Rivera moved to In Progress', time: '2h ago' },
      { id: 'a2', text: 'Priya Sharma commented on checklist', time: '5h ago' },
    ],
  },
  { id: 'task-2', key: 'ONEVO-13', title: 'Project detail inner layout', description: 'Build project workspace with inner nav and board', projectId: 'proj-1', projectName: 'OneVo Platform Refresh', projectKey: 'ONEVO', workspaceIds: ['ws-eng', 'ws-product'], linkedWorkspaceId: 'ws-product', assigneeId: 'current-user', status: 'todo', dueDate: '2026-06-16', priority: 'Medium', labels: ['frontend'], estimate: 8 },
  { id: 'task-3', key: 'ONEVO-14', title: 'Workspace filter behavior', description: 'Ensure project list respects workspace context', projectId: 'proj-1', projectName: 'OneVo Platform Refresh', projectKey: 'ONEVO', workspaceIds: ['ws-eng', 'ws-product'], linkedWorkspaceId: 'ws-eng', assigneeId: 'user-2', status: 'review', dueDate: '2026-06-12', priority: 'High', labels: ['backend'], estimate: 3, approvalRequired: true, approvalStatus: 'pending', approverId: 'user-2' },
  { id: 'task-4', key: 'ONEVO-15', title: 'Create project drawer UX', description: 'Improve project creation flow with linked workspaces', projectId: 'proj-1', projectName: 'OneVo Platform Refresh', projectKey: 'ONEVO', workspaceIds: ['ws-eng', 'ws-product'], linkedWorkspaceId: null, assigneeId: 'user-4', status: 'backlog', dueDate: '2026-06-20', priority: 'Low', labels: ['ux'] },
  { id: 'task-5', key: 'ONEVO-16', title: 'Project settings page', description: 'General, members, workspaces, danger zone sections', projectId: 'proj-1', projectName: 'OneVo Platform Refresh', projectKey: 'ONEVO', workspaceIds: ['ws-eng', 'ws-product'], linkedWorkspaceId: 'ws-eng', assigneeId: 'current-user', status: 'done', dueDate: '2026-06-18', priority: 'Medium', labels: ['settings'], estimate: 5, approvalStatus: 'approved' },
  {
    id: 'task-6', key: 'GATE-8', title: 'Gateway auth middleware', description: 'Implement JWT validation at gateway layer',
    projectId: 'proj-2', projectName: 'API Gateway Migration', projectKey: 'GATE', workspaceIds: ['ws-backend', 'ws-eng'],
    linkedWorkspaceId: 'ws-backend', assigneeId: 'current-user', status: 'in_progress', dueDate: '2026-06-18', priority: 'High', labels: ['security'],
    estimate: 13, blocked: true, blockedBy: ['GATE-10'],
    checklist: [{ id: 'cl-2', name: 'Implementation', items: [
      { id: 'cli-4', text: 'JWT validation middleware', done: true },
      { id: 'cli-5', text: 'Integration tests', done: false },
    ]}],
    activity: [{ id: 'a3', text: 'Marked as blocked by GATE-10', time: '1d ago' }],
  },
  { id: 'task-7', key: 'GATE-9', title: 'Rate limiting rules', description: 'Configure per-service rate limits', projectId: 'proj-2', projectName: 'API Gateway Migration', projectKey: 'GATE', workspaceIds: ['ws-backend', 'ws-eng'], linkedWorkspaceId: 'ws-backend', assigneeId: 'user-3', status: 'todo', dueDate: '2026-06-22', priority: 'Medium', labels: ['infra'], estimate: 5 },
  { id: 'task-8', key: 'GATE-10', title: 'Migration runbook review', description: 'Review cutover steps with platform team', projectId: 'proj-2', projectName: 'API Gateway Migration', projectKey: 'GATE', workspaceIds: ['ws-backend', 'ws-eng'], linkedWorkspaceId: 'ws-eng', assigneeId: 'user-3', status: 'review', dueDate: '2026-06-15', priority: 'High', labels: ['docs'], blocks: ['GATE-8'] },
  { id: 'task-9', key: 'MOBL-21', title: 'Sprint planning board setup', description: 'Configure Kanban for mobile squad', projectId: 'proj-3', projectName: 'Mobile App v2', projectKey: 'MOBL', workspaceIds: ['ws-product'], linkedWorkspaceId: 'ws-product', assigneeId: 'current-user', status: 'todo', dueDate: '2026-06-20', priority: 'Medium', labels: ['planning'], estimate: 3 },
  { id: 'task-10', key: 'MOBL-22', title: 'Push notification service', description: 'Integrate FCM for mobile alerts', projectId: 'proj-3', projectName: 'Mobile App v2', projectKey: 'MOBL', workspaceIds: ['ws-product'], linkedWorkspaceId: 'ws-product', assigneeId: 'user-5', status: 'in_progress', dueDate: '2026-06-25', priority: 'High', labels: ['mobile'], estimate: 8 },
  { id: 'task-11', key: 'OBSV-4', title: 'Metrics dashboard wiring', description: 'Connect Grafana dashboards to services', projectId: 'proj-5', projectName: 'Backend Observability', projectKey: 'OBSV', workspaceIds: ['ws-backend'], linkedWorkspaceId: 'ws-backend', assigneeId: 'current-user', status: 'todo', dueDate: '2026-06-22', priority: 'Low', labels: ['metrics'], estimate: 5 },
  { id: 'task-12', key: 'OBSV-5', title: 'Distributed tracing rollout', description: 'Enable OpenTelemetry across services', projectId: 'proj-5', projectName: 'Backend Observability', projectKey: 'OBSV', workspaceIds: ['ws-backend'], linkedWorkspaceId: 'ws-backend', assigneeId: 'user-3', status: 'backlog', dueDate: '2026-07-01', priority: 'Medium', labels: ['tracing'], estimate: 13 },
];

export const MOCK_MILESTONES: PlannerMilestone[] = [
  { id: 'ms-1', name: 'Work module beta', description: 'Core Work navigation and project views', projectId: 'proj-1', dueDate: '2026-07-15', status: 'upcoming', ownerId: 'current-user', linkedWorkItemIds: ['task-1', 'task-2', 'task-5'] },
  { id: 'ms-2', name: 'Gateway cutover', description: 'Production gateway migration complete', projectId: 'proj-2', dueDate: '2026-07-20', status: 'upcoming', ownerId: 'user-3', linkedWorkItemIds: ['task-6', 'task-7', 'task-8'] },
  { id: 'ms-3', name: 'Mobile beta launch', description: 'Employee mobile app beta release', projectId: 'proj-3', dueDate: '2026-08-01', status: 'upcoming', ownerId: 'user-5', linkedWorkItemIds: ['task-9', 'task-10'] },
  { id: 'ms-4', name: 'Tracing GA', description: 'OpenTelemetry enabled on all services', projectId: 'proj-5', dueDate: '2026-07-05', status: 'upcoming', ownerId: 'user-3', linkedWorkItemIds: ['task-11', 'task-12'] },
];

export const MOCK_ROADMAP_ITEMS: PlannerRoadmapItem[] = [
  { id: 'rm-1', name: 'Platform Refresh — Q3', projectId: 'proj-1', startDate: '2026-05-01', endDate: '2026-08-30', ownerId: 'current-user', status: 'in_progress' },
  { id: 'rm-2', name: 'Gateway Migration — Q2', projectId: 'proj-2', startDate: '2026-04-10', endDate: '2026-07-31', ownerId: 'user-3', status: 'in_progress' },
  { id: 'rm-3', name: 'Mobile v2 — H2', projectId: 'proj-3', startDate: '2026-03-01', endDate: '2026-09-15', ownerId: 'user-5', status: 'planned' },
  { id: 'rm-4', name: 'Observability rollout', projectId: 'proj-5', startDate: '2026-05-15', endDate: '2026-07-15', ownerId: 'user-3', status: 'in_progress' },
];

export const MOCK_PLANNER: PlannerItem[] = [
  { id: 'pl-1', type: 'board', name: 'Platform Refresh Board', projectId: 'proj-1', projectName: 'OneVo Platform Refresh', workspaceIds: ['ws-eng', 'ws-product'], date: null },
  { id: 'pl-2', type: 'cycle', name: 'Cycle 3 — UX Polish', projectId: 'proj-1', projectName: 'OneVo Platform Refresh', workspaceIds: ['ws-eng', 'ws-product'], date: '2026-06-30', status: 'active' },
  { id: 'pl-3', type: 'sprint', name: 'Sprint 24 — Gateway', projectId: 'proj-2', projectName: 'API Gateway Migration', workspaceIds: ['ws-backend', 'ws-eng'], date: '2026-06-20', status: 'active' },
  { id: 'pl-4', type: 'milestone', name: 'Mobile beta launch', projectId: 'proj-3', projectName: 'Mobile App v2', workspaceIds: ['ws-product'], date: '2026-08-01', status: 'upcoming' },
  { id: 'pl-5', type: 'roadmap', name: 'H2 Engineering Roadmap', projectId: 'proj-1', projectName: 'OneVo Platform Refresh', workspaceIds: ['ws-eng', 'ws-product'], date: '2026-12-31' },
  { id: 'pl-6', type: 'sprint', name: 'Sprint 12 — Observability', projectId: 'proj-5', projectName: 'Backend Observability', workspaceIds: ['ws-backend'], date: '2026-07-01', status: 'upcoming' },
];

export const MOCK_CYCLES: ProjectCycle[] = [
  { id: 'cyc-1', name: 'Cycle 1 — Foundation', projectId: 'proj-1', startDate: '2026-05-01', endDate: '2026-05-31', status: 'completed', ownerId: 'current-user', workItemIds: ['task-1', 'task-2'] },
  {
    id: 'cyc-2',
    name: 'Cycle 1: Backend Stabilization',
    projectId: 'proj-1',
    startDate: '2026-06-13',
    endDate: '2026-06-27',
    status: 'active',
    goal: 'Stabilize backend services and complete gateway integration work.',
    ownerId: 'current-user',
    workItemIds: ['task-1', 'task-2', 'task-3', 'task-5'],
  },
  { id: 'cyc-3', name: 'Cycle 3 — Polish', projectId: 'proj-1', startDate: '2026-07-01', endDate: '2026-07-31', status: 'upcoming', ownerId: 'user-2' },
  {
    id: 'cyc-4',
    name: 'Gateway Sprint A',
    projectId: 'proj-2',
    startDate: '2026-06-01',
    endDate: '2026-06-20',
    status: 'active',
    goal: 'Complete gateway auth and rate limiting rollout.',
    ownerId: 'user-3',
    workItemIds: ['task-6', 'task-7', 'task-8'],
  },
];

export const MOCK_MODULES: ProjectModule[] = [
  { id: 'mod-1', name: 'Navigation', projectId: 'proj-1', description: 'Main nav and Work sub-nav', leadId: 'current-user', status: 'in_progress' },
  { id: 'mod-2', name: 'Project Workspace', projectId: 'proj-1', description: 'Project detail and inner nav', leadId: 'user-2', status: 'in_progress' },
  { id: 'mod-3', name: 'Auth Gateway', projectId: 'proj-2', description: 'Authentication at gateway layer', leadId: 'user-3', status: 'in_progress' },
  { id: 'mod-4', name: 'Push Notifications', projectId: 'proj-3', description: 'Mobile push infrastructure', leadId: 'user-5', status: 'planned' },
];

export const MOCK_DOCUMENTS: WorkDocument[] = [
  { id: 'doc-1', name: 'Work Navigation Requirements', type: 'Spec', ownerId: 'current-user', projectId: 'proj-1', projectName: 'OneVo Platform Refresh', workspaceIds: ['ws-eng', 'ws-product'], scope: 'project', status: 'approved', version: '2.1', locked: true, updatedAt: '2026-06-10T09:00:00Z' },
  { id: 'doc-2', name: 'Gateway Migration Runbook', type: 'Runbook', ownerId: 'user-3', projectId: 'proj-2', projectName: 'API Gateway Migration', workspaceIds: ['ws-backend', 'ws-eng'], scope: 'project', status: 'in_review', version: '1.4', locked: false, updatedAt: '2026-06-08T14:30:00Z' },
  { id: 'doc-3', name: 'Mobile UX Wireframes', type: 'Design', ownerId: 'user-5', projectId: 'proj-3', projectName: 'Mobile App v2', workspaceIds: ['ws-product'], scope: 'project', status: 'draft', version: '0.9', locked: false, updatedAt: '2026-06-05T11:00:00Z' },
  { id: 'doc-4', name: 'Tracing Standards', type: 'Guide', ownerId: 'user-3', projectId: 'proj-5', projectName: 'Backend Observability', workspaceIds: ['ws-backend'], scope: 'project', status: 'published', version: '1.0', locked: true, updatedAt: '2026-06-11T16:00:00Z' },
  { id: 'doc-5', name: 'Project Settings Schema', type: 'Spec', ownerId: 'current-user', projectId: 'proj-1', projectName: 'OneVo Platform Refresh', workspaceIds: ['ws-eng', 'ws-product'], scope: 'project', status: 'draft', version: '0.3', locked: false, updatedAt: '2026-06-12T10:00:00Z' },
  { id: 'doc-6', name: 'Engineering Workspace Guidelines', type: 'Policy', ownerId: 'user-2', projectId: null, projectName: null, workspaceIds: ['ws-eng'], scope: 'workspace', status: 'published', version: '3.0', locked: true, updatedAt: '2026-05-20T08:00:00Z' },
];

export const MOCK_ACTIVITY = [
  { id: 'act-1', projectId: 'proj-1', text: 'Alex Rivera moved ONEVO-12 to In Progress', time: '2h ago' },
  { id: 'act-2', projectId: 'proj-1', text: 'Priya Sharma added ONEVO-14 to Review', time: '5h ago' },
  { id: 'act-3', projectId: 'proj-1', text: 'James Chen linked Product Workspace', time: '1d ago' },
  { id: 'act-4', projectId: 'proj-2', text: 'Maria Lopez updated GATE-8 priority to High', time: '3h ago' },
];


function matchesWorkspace(workspaceIds: string[], filterId: string): boolean {
  if (filterId === ALL_WORKSPACES_ID) return true;
  return workspaceIds.includes(filterId);
}

export function isProjectMember(project: WorkProject, userId = CURRENT_USER_ID): boolean {
  return project.members.some(m => m.employeeId === userId && m.status === 'active');
}

export function canAccessProject(project: WorkProject, userId = CURRENT_USER_ID): boolean {
  if (isProjectMember(project, userId)) return true;
  if (project.visibility === 'public_workspace') {
    const emp = employeeById(userId);
    if (!emp) return false;
    return project.workspaceIds.some(wsId => emp.workspaceIds.includes(wsId));
  }
  return false;
}

export function isProjectAdmin(project: WorkProject, userId = CURRENT_USER_ID): boolean {
  return project.members.some(
    m => m.employeeId === userId && m.status === 'active' && m.accessLevel === 'admin',
  );
}

export function projectHasWorkItems(projectId: string, tasks = MOCK_TASKS): boolean {
  return tasks.some(t => t.projectId === projectId);
}

export function getUserWorkspaceScopes(userId = CURRENT_USER_ID): UserWorkspaceScope[] {
  const emp = employeeById(userId);
  if (!emp) return [];
  return emp.workspaceIds.map(wsId => {
    if (wsId === 'ws-eng' || wsId === 'ws-product') {
      return { workspaceId: wsId, permission: 'manage' as WorkspaceLinkPermission, canViewMemberCount: true };
    }
    if (wsId === 'ws-backend') {
      return { workspaceId: wsId, permission: 'request' as WorkspaceLinkPermission, canViewMemberCount: true };
    }
    return { workspaceId: wsId, permission: 'none' as WorkspaceLinkPermission, canViewMemberCount: false };
  }).filter(s => s.permission !== 'none');
}

export function linkableWorkspaces(userId = CURRENT_USER_ID, workspaces = MOCK_WORKSPACES): WorkWorkspace[] {
  const ids = new Set(
    getUserWorkspaceScopes(userId).filter(s => s.permission === 'manage').map(s => s.workspaceId),
  );
  return workspaces.filter(w => w.status === 'active' && ids.has(w.id));
}

export function requestableWorkspaces(userId = CURRENT_USER_ID, workspaces = MOCK_WORKSPACES): WorkWorkspace[] {
  const ids = new Set(
    getUserWorkspaceScopes(userId).filter(s => s.permission === 'request').map(s => s.workspaceId),
  );
  return workspaces.filter(w => w.status === 'active' && ids.has(w.id));
}

export function canViewWorkspaceMemberCount(workspaceId: string, userId = CURRENT_USER_ID): boolean {
  return getUserWorkspaceScopes(userId).find(s => s.workspaceId === workspaceId)?.canViewMemberCount ?? false;
}

export function visibleWorkspaceIds(userId = CURRENT_USER_ID): string[] {
  return getUserWorkspaceScopes(userId).map(s => s.workspaceId);
}

export function linkableProjects(
  excludeProjectId: string,
  userId = CURRENT_USER_ID,
  projects = MOCK_PROJECTS,
): WorkProject[] {
  return projects.filter(p => p.id !== excludeProjectId && canAccessProject(p, userId));
}

export function relationshipLabel(rel: RelatedProjectRelationship): string {
  const map: Record<RelatedProjectRelationship, string> = {
    parent: 'Parent project',
    child: 'Child project',
    related: 'Related project',
    blocks: 'Blocks',
    blocked_by: 'Blocked by',
  };
  return map[rel];
}

export function visibilityBadgeShort(visibility: ProjectVisibility): string {
  return visibility === 'private' ? 'Private' : 'Workspace visible';
}

export function visibilityLabel(visibility: ProjectVisibility): string {
  return visibility === 'private' ? 'Private' : 'Workspace visible';
}

export const PARTICIPATING_ROLE_OPTIONS: { id: ParticipatingWorkspaceRole; label: string }[] = [
  { id: 'main_team', label: 'Main team' },
  { id: 'supporting_team', label: 'Supporting team' },
  { id: 'reviewer', label: 'Reviewer' },
  { id: 'delivery_partner', label: 'Delivery partner' },
];

export function participatingRoleLabel(role: string): string {
  const match = PARTICIPATING_ROLE_OPTIONS.find(r => r.id === role);
  return match?.label ?? role;
}

export function participatingAccessLabel(
  access: ParticipatingWorkspaceAccess | undefined,
  projectVisibility?: ProjectVisibility,
): string {
  const effective = access ?? (projectVisibility === 'public_workspace' ? 'workspace_visible' : 'private');
  return effective === 'workspace_visible'
    ? 'Workspace visible — workspace members can open this project'
    : 'Private — only invited project members from this workspace can open the project';
}

export function participatingAccessShort(
  access: ParticipatingWorkspaceAccess | undefined,
  projectVisibility?: ProjectVisibility,
): string {
  const effective = access ?? (projectVisibility === 'public_workspace' ? 'workspace_visible' : 'private');
  return effective === 'workspace_visible' ? 'Workspace visible' : 'Private';
}

export function workspaceManagePermission(workspaceId: string, userId = CURRENT_USER_ID): WorkspaceLinkPermission {
  return getUserWorkspaceScopes(userId).find(s => s.workspaceId === workspaceId)?.permission ?? 'none';
}

export function resolveRelatedProjectDisplay(
  link: RelatedProjectLink,
  userId = CURRENT_USER_ID,
  projects = MOCK_PROJECTS,
): RelatedProjectDisplay {
  const rel = relationshipLabel(link.relationship);
  if (!link.relatedProjectId) {
    return {
      id: link.id,
      label: 'Restricted project',
      relationship: rel,
      linkStatus: link.status,
      restricted: true,
    };
  }
  const related = projects.find(p => p.id === link.relatedProjectId);
  if (!related || !canAccessProject(related, userId)) {
    return {
      id: link.id,
      label: 'Restricted project',
      relationship: rel,
      linkStatus: link.status,
      restricted: true,
    };
  }
  return {
    id: link.id,
    label: related.name,
    relationship: rel,
    linkStatus: link.status,
    projectStatus: related.status.replace('_', ' '),
    health: healthLabel(related.health),
    workspace: workspaceName(related.primaryWorkspaceId ?? related.workspaceIds[0] ?? ''),
    owner: employeeName(related.leadId),
    restricted: false,
  };
}

export function deriveProjectKey(name: string, existingKeys: string[]): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  let key = words.map(w => w.replace(/[^a-zA-Z0-9]/g, '').charAt(0)).filter(Boolean).join('').toUpperCase().slice(0, 4);
  if (key.length < 2) key = 'PRJ';
  let candidate = key;
  let n = 1;
  while (existingKeys.includes(candidate)) {
    candidate = `${key}${n}`;
    n += 1;
  }
  return candidate;
}

export function employeesInWorkspace(workspaceId: string): WorkEmployee[] {
  return MOCK_EMPLOYEES.filter(e => e.workspaceIds.includes(workspaceId));
}

export function inviteableEmployees(workspaceIds: string[], excludeIds: string[], userId = CURRENT_USER_ID): WorkEmployee[] {
  const visibleWs = new Set(visibleWorkspaceIds(userId));
  const scopeIds = workspaceIds.length > 0 ? workspaceIds : [...visibleWs];
  return MOCK_EMPLOYEES.filter(
    e =>
      !excludeIds.includes(e.id) &&
      e.workspaceIds.some(wsId => scopeIds.includes(wsId) && visibleWs.has(wsId)),
  );
}

export function accessibleProjects(workspaceId: string, userId = CURRENT_USER_ID, projects = MOCK_PROJECTS): WorkProject[] {
  return projects.filter(
    p => canAccessProject(p, userId) && matchesWorkspace(p.workspaceIds, workspaceId),
  );
}

export function accessibleTasks(workspaceId: string, userId = CURRENT_USER_ID, projects = MOCK_PROJECTS, tasks = MOCK_TASKS): WorkTask[] {
  const projectIds = new Set(accessibleProjects(workspaceId, userId, projects).map(p => p.id));
  return tasks.filter(t => projectIds.has(t.projectId));
}

export function myTasks(workspaceId: string, userId = CURRENT_USER_ID, projects = MOCK_PROJECTS, tasks = MOCK_TASKS): WorkTask[] {
  return accessibleTasks(workspaceId, userId, projects, tasks).filter(t => t.assigneeId === userId);
}

export function projectAssignees(project: WorkProject): WorkEmployee[] {
  return project.members
    .filter(m => m.status === 'active')
    .map(m => employeeById(m.employeeId))
    .filter((e): e is WorkEmployee => Boolean(e));
}

export function projectTasks(projectId: string, tasks = MOCK_TASKS): WorkTask[] {
  return tasks.filter(t => t.projectId === projectId);
}

export function accessiblePlanner(workspaceId: string, userId = CURRENT_USER_ID, projects = MOCK_PROJECTS): PlannerItem[] {
  const projectIds = new Set(accessibleProjects(workspaceId, userId, projects).map(p => p.id));
  return MOCK_PLANNER.filter(p => projectIds.has(p.projectId));
}

export function accessibleDocuments(workspaceId: string, userId = CURRENT_USER_ID, projects = MOCK_PROJECTS, documents = MOCK_DOCUMENTS): WorkDocument[] {
  const projectIds = new Set(accessibleProjects(workspaceId, userId, projects).map(p => p.id));
  return documents.filter(d => {
    if (!matchesWorkspace(d.workspaceIds, workspaceId)) return false;
    if (d.scope === 'workspace') return true;
    return d.projectId !== null && projectIds.has(d.projectId);
  });
}

export function workspaceLabel(id: string, workspaces: WorkWorkspace[]): string {
  if (id === ALL_WORKSPACES_ID) return 'All Workspaces';
  return workspaces.find(w => w.id === id)?.name ?? 'All Workspaces';
}

export function employeeName(id: string): string {
  return MOCK_EMPLOYEES.find(e => e.id === id)?.name ?? 'Unknown';
}

export function employeeById(id: string): WorkEmployee | undefined {
  return MOCK_EMPLOYEES.find(e => e.id === id);
}

export function workspaceOwnerId(workspaceId: string, workspaces = MOCK_WORKSPACES): string | null {
  return workspaces.find(w => w.id === workspaceId)?.ownerId ?? null;
}

export function projectAdminIds(project: WorkProject): string[] {
  return project.members
    .filter(m => m.status === 'active' && m.accessLevel === 'admin')
    .map(m => m.employeeId);
}

export function resolveProjectByKey(key: string, projects = MOCK_PROJECTS): WorkProject | undefined {
  const normalized = key.trim().toUpperCase();
  return projects.find(p => p.key.toUpperCase() === normalized);
}

export function workspaceName(id: string, workspaces = MOCK_WORKSPACES): string {
  return workspaces.find(w => w.id === id)?.name ?? id;
}

export function formatWorkDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' });
}

export function formatWorkDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatWorkDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const sameYear = s.getFullYear() === e.getFullYear();
  const startStr = s.toLocaleDateString(undefined, { month: 'short', day: 'numeric', ...(sameYear ? {} : { year: 'numeric' }) });
  const endStr = e.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  return `${startStr} - ${endStr}`;
}

export function cycleWorkItems(cycle: ProjectCycle, tasks = MOCK_TASKS): WorkTask[] {
  const projectList = projectTasks(cycle.projectId, tasks);
  if (cycle.workItemIds?.length) {
    const idSet = new Set(cycle.workItemIds);
    return projectList.filter(t => idSet.has(t.id));
  }
  return projectList;
}

export function healthBadgeClass(health: ProjectHealth): string {
  if (health === 'on_track') return 'active';
  if (health === 'at_risk') return 'open';
  return 'failed';
}

export function healthLabel(health: ProjectHealth): string {
  if (health === 'on_track') return 'On track';
  if (health === 'at_risk') return 'At risk';
  return 'Delayed';
}

export function statusBadgeClass(status: ProjectStatus): string {
  if (status === 'active') return 'active';
  if (status === 'on_hold') return 'open';
  return 'inactive';
}

export function priorityBadgeClass(priority: TaskPriority): string {
  return priority.toLowerCase();
}

export function countOpenTasks(tasks: WorkTask[]): number {
  return tasks.filter(t => t.status !== 'done').length;
}

export function nextTaskKey(projectKey: string, tasks: WorkTask[]): string {
  const nums = tasks
    .filter(t => t.key.startsWith(`${projectKey}-`))
    .map(t => parseInt(t.key.split('-').pop() ?? '0', 10))
    .filter(n => !Number.isNaN(n));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `${projectKey}-${next}`;
}
