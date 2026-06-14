export const CURRENT_USER_ID = 'current-user';

export type WorkspaceStatus = 'active' | 'archived';
export type ProjectStatus = 'active' | 'on_hold' | 'completed';
export type ProjectHealth = 'on_track' | 'at_risk' | 'blocked';
export type WorkspaceRole = 'admin' | 'member' | 'viewer';
export type ProjectAccessLevel = 'admin' | 'member' | 'viewer';
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type LinkedWorkspaceStatus = 'active' | 'pending';

export interface WorkWorkspace {
  id: string;
  name: string;
  description: string;
  ownerName: string;
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

export interface LinkedWorkspace {
  workspaceId: string;
  status: LinkedWorkspaceStatus;
  role: string;
}

export interface WorkProject {
  id: string;
  key: string;
  name: string;
  description: string;
  status: ProjectStatus;
  health: ProjectHealth;
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
  coverColor: string;
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
  status: TaskStatus;
  dueDate: string | null;
  priority: TaskPriority;
  labels: string[];
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

export interface WorkDocument {
  id: string;
  name: string;
  type: string;
  ownerId: string;
  projectId: string;
  projectName: string;
  workspaceIds: string[];
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
  { id: 'ws-eng', name: 'Engineering Workspace', description: 'Engineering delivery context', ownerName: 'Priya Sharma', memberCount: 18, linkedProjectCount: 4, status: 'active' },
  { id: 'ws-backend', name: 'Backend Workspace', description: 'Backend squad context', ownerName: 'Maria Lopez', memberCount: 9, linkedProjectCount: 2, status: 'active' },
  { id: 'ws-product', name: 'Product Workspace', description: 'Product initiatives', ownerName: 'James Chen', memberCount: 12, linkedProjectCount: 3, status: 'active' },
  { id: 'ws-hr', name: 'HR Operations Workspace', description: 'HR operations projects', ownerName: 'James Chen', memberCount: 6, linkedProjectCount: 1, status: 'active' },
];

export const MOCK_PROJECTS: WorkProject[] = [
  {
    id: 'proj-1', key: 'ONEVO', name: 'OneVo Platform Refresh', description: 'Navigation and work experience improvements',
    status: 'active', health: 'on_track', workspaceIds: ['ws-eng', 'ws-product'],
    linkedWorkspaces: [
      { workspaceId: 'ws-eng', status: 'active', role: 'Delivery' },
      { workspaceId: 'ws-product', status: 'active', role: 'Product context' },
    ],
    members: [
      { id: 'pm-1', employeeId: 'current-user', accessLevel: 'admin', status: 'active', workspaceSourceId: 'ws-eng' },
      { id: 'pm-2', employeeId: 'user-2', accessLevel: 'member', status: 'active', workspaceSourceId: 'ws-eng' },
      { id: 'pm-3', employeeId: 'user-4', accessLevel: 'member', status: 'active', workspaceSourceId: 'ws-product' },
    ],
    openTasks: 14, dueDate: '2026-08-15', startDate: '2026-05-01', endDate: '2026-08-30',
    defaultPriority: 'High', timezone: 'America/New_York', icon: 'layers', coverColor: '#6366f1',
  },
  {
    id: 'proj-2', key: 'GATE', name: 'API Gateway Migration', description: 'Move internal services to unified gateway',
    status: 'active', health: 'at_risk', workspaceIds: ['ws-backend', 'ws-eng'],
    linkedWorkspaces: [
      { workspaceId: 'ws-backend', status: 'active', role: 'Backend squad' },
      { workspaceId: 'ws-eng', status: 'active', role: 'Platform support' },
    ],
    members: [
      { id: 'pm-4', employeeId: 'current-user', accessLevel: 'admin', status: 'active', workspaceSourceId: 'ws-backend' },
      { id: 'pm-5', employeeId: 'user-3', accessLevel: 'admin', status: 'active', workspaceSourceId: 'ws-backend' },
    ],
    openTasks: 8, dueDate: '2026-07-20', startDate: '2026-04-10', endDate: '2026-07-31',
    defaultPriority: 'Medium', timezone: 'UTC', icon: 'server', coverColor: '#f59e0b',
  },
  {
    id: 'proj-3', key: 'MOBL', name: 'Mobile App v2', description: 'Employee mobile experience',
    status: 'active', health: 'on_track', workspaceIds: ['ws-product'],
    linkedWorkspaces: [{ workspaceId: 'ws-product', status: 'active', role: 'Product delivery' }],
    members: [
      { id: 'pm-6', employeeId: 'current-user', accessLevel: 'member', status: 'active', workspaceSourceId: 'ws-product' },
      { id: 'pm-7', employeeId: 'user-5', accessLevel: 'admin', status: 'active', workspaceSourceId: 'ws-product' },
    ],
    openTasks: 22, dueDate: '2026-09-01', startDate: '2026-03-01', endDate: '2026-09-15',
    defaultPriority: 'High', timezone: 'America/Los_Angeles', icon: 'smartphone', coverColor: '#10b981',
  },
  {
    id: 'proj-4', key: 'HRON', name: 'HR Onboarding Revamp', description: 'Streamline onboarding workflows',
    status: 'on_hold', health: 'blocked', workspaceIds: ['ws-hr'],
    linkedWorkspaces: [{ workspaceId: 'ws-hr', status: 'active', role: 'HR operations' }],
    members: [{ id: 'pm-8', employeeId: 'user-2', accessLevel: 'admin', status: 'active', workspaceSourceId: 'ws-hr' }],
    openTasks: 3, dueDate: '2026-10-01', startDate: '2026-06-01', endDate: null,
    defaultPriority: 'Low', timezone: 'Europe/London', icon: 'users', coverColor: '#ef4444',
  },
  {
    id: 'proj-5', key: 'OBSV', name: 'Backend Observability', description: 'Tracing and metrics rollout',
    status: 'active', health: 'on_track', workspaceIds: ['ws-backend'],
    linkedWorkspaces: [{ workspaceId: 'ws-backend', status: 'active', role: 'Infrastructure' }],
    members: [
      { id: 'pm-9', employeeId: 'current-user', accessLevel: 'member', status: 'active', workspaceSourceId: 'ws-backend' },
      { id: 'pm-10', employeeId: 'user-3', accessLevel: 'admin', status: 'active', workspaceSourceId: 'ws-backend' },
    ],
    openTasks: 6, dueDate: '2026-07-05', startDate: '2026-05-15', endDate: '2026-07-15',
    defaultPriority: 'Medium', timezone: 'UTC', icon: 'activity', coverColor: '#8b5cf6',
  },
];

export const MOCK_TASKS: WorkTask[] = [
  { id: 'task-1', key: 'ONEVO-12', title: 'Refine Work navigation spec', description: 'Update IA and sub-nav patterns for Work module', projectId: 'proj-1', projectName: 'OneVo Platform Refresh', projectKey: 'ONEVO', workspaceIds: ['ws-eng', 'ws-product'], linkedWorkspaceId: 'ws-eng', assigneeId: 'current-user', status: 'in_progress', dueDate: '2026-06-14', priority: 'High', labels: ['design', 'navigation'] },
  { id: 'task-2', key: 'ONEVO-13', title: 'Project detail inner layout', description: 'Build project workspace with inner nav and board', projectId: 'proj-1', projectName: 'OneVo Platform Refresh', projectKey: 'ONEVO', workspaceIds: ['ws-eng', 'ws-product'], linkedWorkspaceId: 'ws-product', assigneeId: 'current-user', status: 'todo', dueDate: '2026-06-16', priority: 'Medium', labels: ['frontend'] },
  { id: 'task-3', key: 'ONEVO-14', title: 'Workspace filter behavior', description: 'Ensure project list respects workspace context', projectId: 'proj-1', projectName: 'OneVo Platform Refresh', projectKey: 'ONEVO', workspaceIds: ['ws-eng', 'ws-product'], linkedWorkspaceId: 'ws-eng', assigneeId: 'user-2', status: 'review', dueDate: '2026-06-12', priority: 'High', labels: ['backend'] },
  { id: 'task-4', key: 'ONEVO-15', title: 'Create project drawer UX', description: 'Improve project creation flow with linked workspaces', projectId: 'proj-1', projectName: 'OneVo Platform Refresh', projectKey: 'ONEVO', workspaceIds: ['ws-eng', 'ws-product'], linkedWorkspaceId: null, assigneeId: 'user-4', status: 'backlog', dueDate: '2026-06-20', priority: 'Low', labels: ['ux'] },
  { id: 'task-5', key: 'ONEVO-16', title: 'Project settings page', description: 'General, members, workspaces, danger zone sections', projectId: 'proj-1', projectName: 'OneVo Platform Refresh', projectKey: 'ONEVO', workspaceIds: ['ws-eng', 'ws-product'], linkedWorkspaceId: 'ws-eng', assigneeId: 'current-user', status: 'done', dueDate: '2026-06-18', priority: 'Medium', labels: ['settings'] },
  { id: 'task-6', key: 'GATE-8', title: 'Gateway auth middleware', description: 'Implement JWT validation at gateway layer', projectId: 'proj-2', projectName: 'API Gateway Migration', projectKey: 'GATE', workspaceIds: ['ws-backend', 'ws-eng'], linkedWorkspaceId: 'ws-backend', assigneeId: 'current-user', status: 'in_progress', dueDate: '2026-06-18', priority: 'High', labels: ['security'] },
  { id: 'task-7', key: 'GATE-9', title: 'Rate limiting rules', description: 'Configure per-service rate limits', projectId: 'proj-2', projectName: 'API Gateway Migration', projectKey: 'GATE', workspaceIds: ['ws-backend', 'ws-eng'], linkedWorkspaceId: 'ws-backend', assigneeId: 'user-3', status: 'todo', dueDate: '2026-06-22', priority: 'Medium', labels: ['infra'] },
  { id: 'task-8', key: 'GATE-10', title: 'Migration runbook review', description: 'Review cutover steps with platform team', projectId: 'proj-2', projectName: 'API Gateway Migration', projectKey: 'GATE', workspaceIds: ['ws-backend', 'ws-eng'], linkedWorkspaceId: 'ws-eng', assigneeId: 'user-3', status: 'review', dueDate: '2026-06-15', priority: 'High', labels: ['docs'] },
  { id: 'task-9', key: 'MOBL-21', title: 'Sprint planning board setup', description: 'Configure Kanban for mobile squad', projectId: 'proj-3', projectName: 'Mobile App v2', projectKey: 'MOBL', workspaceIds: ['ws-product'], linkedWorkspaceId: 'ws-product', assigneeId: 'current-user', status: 'todo', dueDate: '2026-06-20', priority: 'Medium', labels: ['planning'] },
  { id: 'task-10', key: 'MOBL-22', title: 'Push notification service', description: 'Integrate FCM for mobile alerts', projectId: 'proj-3', projectName: 'Mobile App v2', projectKey: 'MOBL', workspaceIds: ['ws-product'], linkedWorkspaceId: 'ws-product', assigneeId: 'user-5', status: 'in_progress', dueDate: '2026-06-25', priority: 'High', labels: ['mobile'] },
  { id: 'task-11', key: 'OBSV-4', title: 'Metrics dashboard wiring', description: 'Connect Grafana dashboards to services', projectId: 'proj-5', projectName: 'Backend Observability', projectKey: 'OBSV', workspaceIds: ['ws-backend'], linkedWorkspaceId: 'ws-backend', assigneeId: 'current-user', status: 'todo', dueDate: '2026-06-22', priority: 'Low', labels: ['metrics'] },
  { id: 'task-12', key: 'OBSV-5', title: 'Distributed tracing rollout', description: 'Enable OpenTelemetry across services', projectId: 'proj-5', projectName: 'Backend Observability', projectKey: 'OBSV', workspaceIds: ['ws-backend'], linkedWorkspaceId: 'ws-backend', assigneeId: 'user-3', status: 'backlog', dueDate: '2026-07-01', priority: 'Medium', labels: ['tracing'] },
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
  { id: 'doc-1', name: 'Work Navigation Requirements', type: 'Spec', ownerId: 'current-user', projectId: 'proj-1', projectName: 'OneVo Platform Refresh', workspaceIds: ['ws-eng', 'ws-product'], updatedAt: '2026-06-10T09:00:00Z' },
  { id: 'doc-2', name: 'Gateway Migration Runbook', type: 'Runbook', ownerId: 'user-3', projectId: 'proj-2', projectName: 'API Gateway Migration', workspaceIds: ['ws-backend', 'ws-eng'], updatedAt: '2026-06-08T14:30:00Z' },
  { id: 'doc-3', name: 'Mobile UX Wireframes', type: 'Design', ownerId: 'user-5', projectId: 'proj-3', projectName: 'Mobile App v2', workspaceIds: ['ws-product'], updatedAt: '2026-06-05T11:00:00Z' },
  { id: 'doc-4', name: 'Tracing Standards', type: 'Guide', ownerId: 'user-3', projectId: 'proj-5', projectName: 'Backend Observability', workspaceIds: ['ws-backend'], updatedAt: '2026-06-11T16:00:00Z' },
  { id: 'doc-5', name: 'Project Settings Schema', type: 'Spec', ownerId: 'current-user', projectId: 'proj-1', projectName: 'OneVo Platform Refresh', workspaceIds: ['ws-eng', 'ws-product'], updatedAt: '2026-06-12T10:00:00Z' },
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

export function accessibleProjects(workspaceId: string, userId = CURRENT_USER_ID, projects = MOCK_PROJECTS): WorkProject[] {
  return projects.filter(
    p => isProjectMember(p, userId) && matchesWorkspace(p.workspaceIds, workspaceId)
  );
}

export function accessibleTasks(workspaceId: string, userId = CURRENT_USER_ID, projects = MOCK_PROJECTS, tasks = MOCK_TASKS): WorkTask[] {
  const projectIds = new Set(accessibleProjects(workspaceId, userId, projects).map(p => p.id));
  return tasks.filter(t => projectIds.has(t.projectId));
}

export function projectTasks(projectId: string, tasks = MOCK_TASKS): WorkTask[] {
  return tasks.filter(t => t.projectId === projectId);
}

export function accessiblePlanner(workspaceId: string, userId = CURRENT_USER_ID, projects = MOCK_PROJECTS): PlannerItem[] {
  const projectIds = new Set(accessibleProjects(workspaceId, userId, projects).map(p => p.id));
  return MOCK_PLANNER.filter(p => projectIds.has(p.projectId));
}

export function accessibleDocuments(workspaceId: string, userId = CURRENT_USER_ID, projects = MOCK_PROJECTS): WorkDocument[] {
  const projectIds = new Set(accessibleProjects(workspaceId, userId, projects).map(p => p.id));
  return MOCK_DOCUMENTS.filter(d => projectIds.has(d.projectId));
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
