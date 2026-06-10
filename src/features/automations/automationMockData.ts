import type { Automation, AutomationAlert, TemplateOption } from './automationTypes';

const ts = (d: string) => d;

export const SEED_AUTOMATIONS: Automation[] = [
  {
    id: 'auto-1',
    name: 'New Employee Onboarding',
    description: 'Onboarding tasks and HR notification for new hires.',
    summary: 'When an employee is created, assign onboarding tasks and notify HR.',
    area: 'Employee Lifecycle',
    trigger: 'Employee created',
    status: 'active',
    steps: [
      { id: 's1', type: 'trigger', config: { triggerKey: 'employee_created' }, sectionId: 'main', sortOrder: 0 },
      { id: 's2', type: 'action', config: { actionKey: 'create_onboarding_checklist' }, sectionId: 'main', sortOrder: 1 },
      { id: 's3', type: 'notification', config: { recipientType: 'Role', recipientRole: 'HR Admin', channel: 'In-app' }, sectionId: 'main', sortOrder: 2 },
      { id: 's4', type: 'end', config: {}, sectionId: 'main', sortOrder: 3 }
    ],
    lastRunAt: '2026-06-08T14:22:00Z',
    runCount: 142,
    failureCount: 2,
    alertsCreated: 0,
    openAlerts: 0,
    createdAt: ts('2025-11-01T10:00:00Z'),
    updatedAt: ts('2026-03-15T08:30:00Z')
  },
  {
    id: 'auto-2',
    name: 'Leave Request Approval',
    description: 'Manager approval and employee notification for leave.',
    summary: 'When leave is requested, ask reporting manager for approval and notify the employee.',
    area: 'Leave',
    trigger: 'Leave request submitted',
    status: 'active',
    steps: [
      { id: 's1', type: 'trigger', config: { triggerKey: 'leave_request_submitted' }, sectionId: 'main', sortOrder: 0 },
      { id: 's2', type: 'approval', config: { approverType: 'Reporting Manager', approvalTimeout: '48 hours', onRejected: 'Notify requester' }, sectionId: 'main', sortOrder: 1 },
      { id: 's3', type: 'notification', config: { recipientType: 'Employee', channel: 'Email' }, sectionId: 'main', sortOrder: 2 },
      { id: 's4', type: 'end', config: {}, sectionId: 'main', sortOrder: 3 }
    ],
    lastRunAt: '2026-06-09T09:15:00Z',
    runCount: 387,
    failureCount: 5,
    alertsCreated: 2,
    openAlerts: 1,
    createdAt: ts('2025-09-12T09:00:00Z'),
    updatedAt: ts('2026-04-01T11:00:00Z')
  },
  {
    id: 'auto-3',
    name: 'Late Attendance Alert',
    description: 'Alert reporting manager on repeated late check-ins.',
    summary: 'When an employee is late more than 3 times in 7 days, create an alert for the reporting manager.',
    area: 'Attendance',
    trigger: 'Employee checked in late',
    status: 'active',
    steps: [
      { id: 's1', type: 'trigger', config: { triggerKey: 'employee_checked_in_late' }, sectionId: 'main', sortOrder: 0 },
      { id: 's2', type: 'condition', config: { field: 'late_count_in_period', operator: 'greater_than', value: '3' }, sectionId: 'main', sortOrder: 1 },
      { id: 's3', type: 'alert', config: { alertTitle: 'Repeated late check-in', severity: 'medium', assignToType: 'Reporting Manager', sla: '24 hours' }, sectionId: 'main', sortOrder: 2 },
      { id: 's4', type: 'end', config: {}, sectionId: 'main', sortOrder: 3 }
    ],
    lastRunAt: '2026-06-07T17:45:00Z',
    runCount: 89,
    failureCount: 1,
    alertsCreated: 5,
    openAlerts: 2,
    createdAt: ts('2025-10-20T14:00:00Z'),
    updatedAt: ts('2026-01-10T16:00:00Z')
  },
  {
    id: 'auto-4',
    name: 'Position Change Check',
    description: 'Verify reporting manager exists after position change.',
    summary: 'When an employee position changes, check whether reporting manager exists and alert HR if missing.',
    area: 'Organization',
    trigger: 'Position assignment changed',
    status: 'draft',
    steps: [
      { id: 's1', type: 'trigger', config: { triggerKey: 'position_assignment_changed' }, sectionId: 'main', sortOrder: 0 },
      { id: 's2', type: 'condition', config: { field: 'reporting_manager', operator: 'does_not_exist' }, sectionId: 'main', sortOrder: 1 },
      { id: 's3', type: 'alert', config: { alertTitle: 'Missing reporting manager', severity: 'high', assignToType: 'Role', assignToRole: 'HR Admin' }, sectionId: 'main', sortOrder: 2 }
    ],
    lastRunAt: null,
    runCount: 0,
    failureCount: 0,
    alertsCreated: 0,
    openAlerts: 0,
    createdAt: ts('2025-12-05T08:00:00Z'),
    updatedAt: ts('2026-02-28T10:00:00Z')
  },
  {
    id: 'auto-5',
    name: 'Document Expiry Reminder',
    description: 'Remind employee and escalate unresolved document expiry.',
    summary: 'When a document expires soon, notify employee and create a compliance alert if unresolved.',
    area: 'Documents',
    trigger: 'Document expiring soon',
    status: 'paused',
    steps: [
      { id: 's1', type: 'trigger', config: { triggerKey: 'document_expiring_soon' }, sectionId: 'main', sortOrder: 0 },
      { id: 's2', type: 'notification', config: { recipientType: 'Employee', channel: 'Email' }, sectionId: 'main', sortOrder: 1 },
      { id: 's3', type: 'alert', config: { alertTitle: 'Document expiry unresolved', severity: 'critical', assignToType: 'Role', assignToRole: 'Compliance Admin', escalate: true, escalationTargetType: 'Role', escalationRole: 'HR Admin', sla: '24 hours' }, sectionId: 'main', sortOrder: 2 },
      { id: 's4', type: 'end', config: {}, sectionId: 'main', sortOrder: 3 }
    ],
    lastRunAt: '2026-06-05T11:00:00Z',
    runCount: 34,
    failureCount: 0,
    alertsCreated: 3,
    openAlerts: 1,
    createdAt: ts('2026-01-15T10:00:00Z'),
    updatedAt: ts('2026-03-01T14:00:00Z')
  }
];

export const SEED_ALERTS: AutomationAlert[] = [
  { id: 'al-1', automationId: 'auto-2', title: 'Leave approval overdue', severity: 'high', area: 'Leave', assignedTo: 'Department Head', status: 'open', createdAt: '2026-06-06T10:00:00Z', slaRemaining: '4h 12m' },
  { id: 'al-2', automationId: 'auto-3', title: 'Late check-in repeated', severity: 'medium', area: 'Attendance', assignedTo: 'Reporting Manager', status: 'open', createdAt: '2026-06-08T08:15:00Z', slaRemaining: '18h 30m' },
  { id: 'al-3', automationId: 'auto-3', title: 'Late check-in repeated', severity: 'medium', area: 'Attendance', assignedTo: 'Reporting Manager', status: 'resolved', createdAt: '2026-06-01T08:15:00Z', slaRemaining: '—' },
  { id: 'al-4', automationId: 'auto-5', title: 'Document expiring soon', severity: 'critical', area: 'Documents', assignedTo: 'Compliance Admin', status: 'open', createdAt: '2026-06-05T09:00:00Z', slaRemaining: '12d' }
];

export const TEMPLATES: TemplateOption[] = [
  {
    id: 'blank',
    name: 'Start from blank',
    description: 'Build your automation step by step.',
    area: 'Employee Lifecycle',
    triggerKey: '',
    summary: '',
    steps: [{ type: 'trigger', config: {}, sectionId: 'main', sortOrder: 0 }]
  },
  {
    id: 'onboarding',
    name: 'Employee onboarding',
    description: 'Onboard new employees automatically.',
    area: 'Employee Lifecycle',
    triggerKey: 'employee_created',
    summary: 'When an employee is created, assign onboarding tasks and notify HR.',
    steps: [
      { type: 'trigger', config: { triggerKey: 'employee_created' }, sectionId: 'main', sortOrder: 0 },
      { type: 'action', config: { actionKey: 'create_onboarding_checklist' }, sectionId: 'main', sortOrder: 1 },
      { type: 'notification', config: { recipientType: 'Role', recipientRole: 'HR Admin', channel: 'In-app' }, sectionId: 'main', sortOrder: 2 },
      { type: 'end', config: {}, sectionId: 'main', sortOrder: 3 }
    ]
  },
  {
    id: 'leave',
    name: 'Leave approval',
    description: 'Route leave requests for manager approval.',
    area: 'Leave',
    triggerKey: 'leave_request_submitted',
    summary: 'When leave is requested, ask reporting manager for approval and notify the employee.',
    steps: [
      { type: 'trigger', config: { triggerKey: 'leave_request_submitted' }, sectionId: 'main', sortOrder: 0 },
      { type: 'approval', config: { approverType: 'Reporting Manager', approvalTimeout: '48 hours' }, sectionId: 'main', sortOrder: 1 },
      { type: 'notification', config: { recipientType: 'Employee', channel: 'Email' }, sectionId: 'main', sortOrder: 2 },
      { type: 'end', config: {}, sectionId: 'main', sortOrder: 3 }
    ]
  },
  {
    id: 'attendance',
    name: 'Late attendance alert',
    description: 'Alert when repeated late check-ins occur.',
    area: 'Attendance',
    triggerKey: 'employee_checked_in_late',
    summary: 'When an employee is late more than 3 times in 7 days, create an alert for the reporting manager.',
    steps: [
      { type: 'trigger', config: { triggerKey: 'employee_checked_in_late' }, sectionId: 'main', sortOrder: 0 },
      { type: 'condition', config: { field: 'late_count_in_period', operator: 'greater_than', value: '3' }, sectionId: 'main', sortOrder: 1 },
      { type: 'alert', config: { alertTitle: 'Late attendance', severity: 'medium', assignToType: 'Reporting Manager' }, sectionId: 'main', sortOrder: 2 },
      { type: 'end', config: {}, sectionId: 'main', sortOrder: 3 }
    ]
  },
  {
    id: 'position',
    name: 'Position change check',
    description: 'Check reporting manager after position change.',
    area: 'Organization',
    triggerKey: 'position_assignment_changed',
    summary: 'When an employee position changes, check whether reporting manager exists and alert HR if missing.',
    steps: [
      { type: 'trigger', config: { triggerKey: 'position_assignment_changed' }, sectionId: 'main', sortOrder: 0 },
      { type: 'condition', config: { field: 'reporting_manager', operator: 'does_not_exist' }, sectionId: 'main', sortOrder: 1 },
      { type: 'alert', config: { alertTitle: 'Missing reporting manager', severity: 'high', assignToType: 'Role', assignToRole: 'HR Admin' }, sectionId: 'main', sortOrder: 2 },
      { type: 'end', config: {}, sectionId: 'main', sortOrder: 3 }
    ]
  },
  {
    id: 'document',
    name: 'Document expiry reminder',
    description: 'Notify and escalate document expiry.',
    area: 'Documents',
    triggerKey: 'document_expiring_soon',
    summary: 'When a document expires soon, notify employee and create a compliance alert if unresolved.',
    steps: [
      { type: 'trigger', config: { triggerKey: 'document_expiring_soon' }, sectionId: 'main', sortOrder: 0 },
      { type: 'notification', config: { recipientType: 'Employee', channel: 'Email' }, sectionId: 'main', sortOrder: 1 },
      { type: 'alert', config: { alertTitle: 'Document expiry', severity: 'critical', assignToType: 'Role', assignToRole: 'Compliance Admin' }, sectionId: 'main', sortOrder: 2 },
      { type: 'end', config: {}, sectionId: 'main', sortOrder: 3 }
    ]
  }
];
