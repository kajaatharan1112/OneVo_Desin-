import { create } from 'zustand';
import type {
  ApprovalRule,
  NotificationRule,
  Workflow,
  WorkflowEdge,
  WorkflowNode,
  WorkflowRun,
  WorkflowStatus
} from '../types/workflow';

const now = () => new Date().toISOString();
const createId = () => `wf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const SEED_WORKFLOWS: Workflow[] = [
  {
    id: 'wf-1',
    name: 'New Employee Onboarding',
    description: 'Automated onboarding checklist and notifications for new hires.',
    category: 'Employee Lifecycle',
    triggerType: 'Employee Created',
    status: 'active',
    version: 3,
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Employee Created', config: { triggerType: 'Employee Created', scope: 'All departments' }, position: { x: 80, y: 200 } },
      { id: 'n2', type: 'action', label: 'Assign Checklist', config: { actionType: 'Assign Checklist', assignee: 'Employee' }, position: { x: 320, y: 200 } },
      { id: 'n3', type: 'notification', label: 'Notify HR Admin', config: { assignee: 'HR Admin' }, position: { x: 560, y: 200 } },
      { id: 'n4', type: 'end', label: 'End Workflow', config: {}, position: { x: 800, y: 200 } }
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', conditionType: 'default' },
      { id: 'e2', source: 'n2', target: 'n3', conditionType: 'success' },
      { id: 'e3', source: 'n3', target: 'n4', conditionType: 'default' }
    ],
    createdAt: '2025-11-01T10:00:00Z',
    updatedAt: '2026-03-15T08:30:00Z',
    lastRunAt: '2026-06-08T14:22:00Z',
    runCount: 142,
    failureCount: 2
  },
  {
    id: 'wf-2',
    name: 'Leave Request Approval',
    description: 'Routes leave requests through manager and HR approval.',
    category: 'Leave Management',
    triggerType: 'Leave Request Submitted',
    status: 'active',
    version: 5,
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Leave Request Submitted', config: { triggerType: 'Leave Request Submitted' }, position: { x: 80, y: 200 } },
      { id: 'n2', type: 'approval', label: 'Manager Approval', config: { approverType: 'Reporting Manager', approvalMode: 'Single approver', timeout: '48h' }, position: { x: 320, y: 200 } },
      { id: 'n3', type: 'approval', label: 'HR Approval', config: { approverType: 'HR Admin', approvalMode: 'Single approver' }, position: { x: 560, y: 120 } },
      { id: 'n4', type: 'end', label: 'End Workflow', config: {}, position: { x: 800, y: 200 } }
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', conditionType: 'default' },
      { id: 'e2', source: 'n2', target: 'n3', conditionType: 'approved' },
      { id: 'e3', source: 'n3', target: 'n4', conditionType: 'approved' },
      { id: 'e4', source: 'n2', target: 'n4', conditionType: 'rejected' }
    ],
    createdAt: '2025-09-12T09:00:00Z',
    updatedAt: '2026-04-01T11:00:00Z',
    lastRunAt: '2026-06-09T09:15:00Z',
    runCount: 387,
    failureCount: 5
  },
  {
    id: 'wf-3',
    name: 'Attendance Correction Approval',
    description: 'Manager approval for attendance corrections.',
    category: 'Attendance',
    triggerType: 'Attendance Correction Submitted',
    status: 'active',
    version: 2,
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Attendance Correction Submitted', config: { triggerType: 'Attendance Correction Submitted' }, position: { x: 80, y: 200 } },
      { id: 'n2', type: 'approval', label: 'Manager Approval', config: { approverType: 'Reporting Manager' }, position: { x: 320, y: 200 } },
      { id: 'n3', type: 'end', label: 'End Workflow', config: {}, position: { x: 560, y: 200 } }
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', conditionType: 'default' },
      { id: 'e2', source: 'n2', target: 'n3', conditionType: 'approved' },
      { id: 'e3', source: 'n2', target: 'n3', conditionType: 'rejected' }
    ],
    createdAt: '2025-10-20T14:00:00Z',
    updatedAt: '2026-01-10T16:00:00Z',
    lastRunAt: '2026-06-07T17:45:00Z',
    runCount: 89,
    failureCount: 1
  },
  {
    id: 'wf-4',
    name: 'Monitoring Alert Escalation',
    description: 'Escalates high severity monitoring alerts to HR and admins.',
    category: 'Workforce Monitoring',
    triggerType: 'High Severity Alert Created',
    status: 'active',
    version: 4,
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Monitoring Alert Created', config: { triggerType: 'Monitoring Alert Created' }, position: { x: 80, y: 200 } },
      { id: 'n2', type: 'condition', label: 'If Severity Is', config: { field: 'severity', operator: 'equals', value: 'high' }, position: { x: 320, y: 200 } },
      { id: 'n3', type: 'alert', label: 'Create High Alert', config: { severity: 'high', alertTitle: 'Monitoring escalation' }, position: { x: 560, y: 120 } },
      { id: 'n4', type: 'end', label: 'End Workflow', config: {}, position: { x: 800, y: 200 } }
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', conditionType: 'default' },
      { id: 'e2', source: 'n2', target: 'n3', conditionType: 'yes' },
      { id: 'e3', source: 'n3', target: 'n4', conditionType: 'default' },
      { id: 'e4', source: 'n2', target: 'n4', conditionType: 'no' }
    ],
    createdAt: '2025-12-05T08:00:00Z',
    updatedAt: '2026-02-28T10:00:00Z',
    lastRunAt: '2026-06-09T06:30:00Z',
    runCount: 56,
    failureCount: 0
  },
  {
    id: 'wf-5',
    name: 'Employee Offboarding Checklist',
    description: 'Draft offboarding workflow with access revocation and exit tasks.',
    category: 'Employee Lifecycle',
    triggerType: 'Employee Termination Scheduled',
    status: 'draft',
    version: 1,
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Employee Terminated', config: { triggerType: 'Employee Terminated' }, position: { x: 80, y: 200 } },
      { id: 'n2', type: 'action', label: 'Assign Checklist', config: { actionType: 'Assign Checklist' }, position: { x: 320, y: 200 } }
    ],
    edges: [{ id: 'e1', source: 'n1', target: 'n2', conditionType: 'default' }],
    createdAt: '2026-05-01T12:00:00Z',
    updatedAt: '2026-05-20T09:00:00Z',
    lastRunAt: null,
    runCount: 0,
    failureCount: 0
  },
  {
    id: 'wf-6',
    name: 'Overtime Approval Workflow',
    description: 'Manager and department head approval for overtime requests.',
    category: 'Attendance',
    triggerType: 'Overtime Request Submitted',
    status: 'paused',
    version: 2,
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Overtime Request Submitted', config: { triggerType: 'Overtime Request Submitted' }, position: { x: 80, y: 200 } },
      { id: 'n2', type: 'approval', label: 'Manager Approval', config: { approverType: 'Reporting Manager' }, position: { x: 320, y: 200 } },
      { id: 'n3', type: 'end', label: 'End Workflow', config: {}, position: { x: 560, y: 200 } }
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', conditionType: 'default' },
      { id: 'e2', source: 'n2', target: 'n3', conditionType: 'approved' }
    ],
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-03-01T14:00:00Z',
    lastRunAt: '2026-04-28T11:00:00Z',
    runCount: 34,
    failureCount: 3
  }
];

const SEED_RUNS: WorkflowRun[] = [
  { id: 'run-1', workflowId: 'wf-1', status: 'success', startedAt: '2026-06-08T14:22:00Z', completedAt: '2026-06-08T14:22:45Z', triggeredBy: 'System', summary: 'Onboarding checklist assigned to 1 employee' },
  { id: 'run-2', workflowId: 'wf-2', status: 'success', startedAt: '2026-06-09T09:15:00Z', completedAt: '2026-06-09T09:16:12Z', triggeredBy: 'Sarah Chen', summary: 'Leave request approved by manager' },
  { id: 'run-3', workflowId: 'wf-2', status: 'failed', startedAt: '2026-06-08T11:00:00Z', completedAt: '2026-06-08T11:00:30Z', triggeredBy: 'James Park', summary: 'Approval timeout — manager unavailable' },
  { id: 'run-4', workflowId: 'wf-4', status: 'running', startedAt: '2026-06-09T06:30:00Z', completedAt: null, triggeredBy: 'Monitoring Engine', summary: 'Escalating high severity alert' }
];

const SEED_NOTIFICATION_RULES: NotificationRule[] = [
  { id: 'nr-1', name: 'Leave Approved', event: 'Leave Request Approved', channel: 'In-app', recipient: 'Employee', status: 'active', template: 'Your leave request has been approved.' },
  { id: 'nr-2', name: 'New Hire Welcome', event: 'Employee Created', channel: 'Email', recipient: 'Employee', status: 'active', template: 'Welcome to the team!' },
  { id: 'nr-3', name: 'Overtime Pending', event: 'Overtime Request Submitted', channel: 'Slack', recipient: 'Reporting Manager', status: 'active' },
  { id: 'nr-4', name: 'Compliance Alert', event: 'Document Expiring', channel: 'Microsoft Teams', recipient: 'HR Admin', status: 'active' },
  { id: 'nr-5', name: 'Attendance Correction', event: 'Attendance Correction Submitted', channel: 'Email', recipient: 'Reporting Manager', status: 'paused' }
];

const SEED_APPROVAL_RULES: ApprovalRule[] = [
  { id: 'ar-1', name: 'Leave request approval', appliesTo: 'Leave requests', steps: [{ id: 's1', approverType: 'Reporting Manager', label: 'Reporting Manager' }, { id: 's2', approverType: 'HR Admin', label: 'HR Admin' }], timeout: '48 hours', escalationTarget: 'Department Head', rejectionBehavior: 'Notify employee and close', status: 'active' },
  { id: 'ar-2', name: 'Overtime approval', appliesTo: 'Overtime requests', steps: [{ id: 's1', approverType: 'Reporting Manager', label: 'Reporting Manager' }, { id: 's2', approverType: 'Department Head', label: 'Department Head' }], timeout: '24 hours', escalationTarget: 'HR Admin', rejectionBehavior: 'Notify employee', status: 'active' },
  { id: 'ar-3', name: 'Attendance correction approval', appliesTo: 'Attendance corrections', steps: [{ id: 's1', approverType: 'Reporting Manager', label: 'Reporting Manager' }], timeout: '72 hours', escalationTarget: 'HR Admin', rejectionBehavior: 'Auto-reject after timeout', status: 'active' },
  { id: 'ar-4', name: 'Expense approval', appliesTo: 'Expense claims', steps: [{ id: 's1', approverType: 'Reporting Manager', label: 'Manager' }, { id: 's2', approverType: 'Finance Admin', label: 'Finance' }], timeout: '5 business days', escalationTarget: 'Finance Admin', rejectionBehavior: 'Return to submitter', status: 'draft' }
];

interface WorkflowStore {
  workflows: Workflow[];
  runs: WorkflowRun[];
  notificationRules: NotificationRule[];
  approvalRules: ApprovalRule[];
  selectedNodeId: string | null;
  builderDirty: boolean;

  setSelectedNodeId: (id: string | null) => void;
  getWorkflow: (id: string) => Workflow | undefined;
  createWorkflow: (partial?: Partial<Workflow>) => string;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void;
  duplicateWorkflow: (id: string) => string;
  setWorkflowStatus: (id: string, status: WorkflowStatus) => void;
  archiveWorkflow: (id: string) => void;
  updateWorkflowGraph: (id: string, nodes: WorkflowNode[], edges: WorkflowEdge[]) => void;
  addRun: (run: Omit<WorkflowRun, 'id'>) => void;
  getRunsForWorkflow: (workflowId: string) => WorkflowRun[];

  addNotificationRule: (rule: Omit<NotificationRule, 'id'>) => void;
  updateNotificationRule: (id: string, updates: Partial<NotificationRule>) => void;
  toggleNotificationRuleStatus: (id: string) => void;

  addApprovalRule: (rule: Omit<ApprovalRule, 'id'>) => void;
  updateApprovalRule: (id: string, updates: Partial<ApprovalRule>) => void;
}

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  workflows: SEED_WORKFLOWS,
  runs: SEED_RUNS,
  notificationRules: SEED_NOTIFICATION_RULES,
  approvalRules: SEED_APPROVAL_RULES,
  selectedNodeId: null,
  builderDirty: false,

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  getWorkflow: (id) => get().workflows.find(w => w.id === id),

  createWorkflow: (partial) => {
    const id = createId();
    const workflow: Workflow = {
      id,
      name: partial?.name ?? 'Untitled Workflow',
      description: partial?.description ?? '',
      category: partial?.category ?? 'Employee Lifecycle',
      triggerType: partial?.triggerType ?? '',
      status: 'draft',
      version: 1,
      nodes: partial?.nodes ?? [],
      edges: partial?.edges ?? [],
      createdAt: now(),
      updatedAt: now(),
      lastRunAt: null,
      runCount: 0,
      failureCount: 0
    };
    set(s => ({ workflows: [...s.workflows, workflow], builderDirty: false }));
    return id;
  },

  updateWorkflow: (id, updates) => {
    set(s => ({
      workflows: s.workflows.map(w =>
        w.id === id ? { ...w, ...updates, updatedAt: now() } : w
      ),
      builderDirty: false
    }));
  },

  duplicateWorkflow: (id) => {
    const source = get().workflows.find(w => w.id === id);
    if (!source) return '';
    const newId = createId();
    const copy: Workflow = {
      ...source,
      id: newId,
      name: `${source.name} (Copy)`,
      status: 'draft',
      version: 1,
      nodes: source.nodes.map(n => ({ ...n, id: `${n.id}-copy-${Math.random().toString(36).slice(2, 5)}` })),
      edges: [],
      createdAt: now(),
      updatedAt: now(),
      lastRunAt: null,
      runCount: 0,
      failureCount: 0
    };
    set(s => ({ workflows: [...s.workflows, copy] }));
    return newId;
  },

  setWorkflowStatus: (id, status) => {
    get().updateWorkflow(id, { status });
  },

  archiveWorkflow: (id) => {
    get().setWorkflowStatus(id, 'archived');
  },

  updateWorkflowGraph: (id, nodes, edges) => {
    const trigger = nodes.find(n => n.type === 'trigger');
    set(s => ({
      workflows: s.workflows.map(w =>
        w.id === id
          ? {
              ...w,
              nodes,
              edges,
              triggerType: trigger?.config.triggerType ?? trigger?.label ?? w.triggerType,
              updatedAt: now()
            }
          : w
      ),
      builderDirty: true
    }));
  },

  addRun: (run) => {
    const id = `run-${Date.now()}`;
    set(s => ({ runs: [{ ...run, id }, ...s.runs] }));
  },

  getRunsForWorkflow: (workflowId) => get().runs.filter(r => r.workflowId === workflowId),

  addNotificationRule: (rule) => {
    set(s => ({
      notificationRules: [...s.notificationRules, { ...rule, id: `nr-${Date.now()}` }]
    }));
  },

  updateNotificationRule: (id, updates) => {
    set(s => ({
      notificationRules: s.notificationRules.map(r => (r.id === id ? { ...r, ...updates } : r))
    }));
  },

  toggleNotificationRuleStatus: (id) => {
    set(s => ({
      notificationRules: s.notificationRules.map(r =>
        r.id === id ? { ...r, status: r.status === 'active' ? 'paused' : 'active' } : r
      )
    }));
  },

  addApprovalRule: (rule) => {
    set(s => ({
      approvalRules: [...s.approvalRules, { ...rule, id: `ar-${Date.now()}` }]
    }));
  },

  updateApprovalRule: (id, updates) => {
    set(s => ({
      approvalRules: s.approvalRules.map(r => (r.id === id ? { ...r, ...updates } : r))
    }));
  }
}));
