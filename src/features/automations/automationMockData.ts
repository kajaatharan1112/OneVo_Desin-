import type { Automation, AutomationAlert } from './automationTypes';
import type { AutomationTemplate } from './automationContextRules';

const ts = (d: string) => d;

export const AUTOMATION_TEMPLATES: AutomationTemplate[] = [
  {
    id: 'new_employee_setup',
    name: 'New Employee Setup',
    description: 'Onboarding tasks, invite, and notifications for new hires.',
    summary: 'Set up tasks, invite, access suggestions, and notifications when a new employee is created.',
    area: 'Employee Lifecycle',
    triggerKey: 'employee_created',
    steps: [
      { type: 'trigger', config: { triggerKey: 'employee_created' }, sectionId: 'main', sortOrder: 0 },
      { type: 'action', config: { actionKey: 'create_onboarding_checklist_from_template', checklistTemplateId: 'ct-onboarding-standard' }, sectionId: 'main', sortOrder: 1 },
      { type: 'notification', config: { recipientType: 'Reporting Manager', channel: 'In-app' }, sectionId: 'main', sortOrder: 2 },
      { type: 'end', config: {}, sectionId: 'main', sortOrder: 3 }
    ]
  },
  {
    id: 'employee_offboarding',
    name: 'Employee Offboarding',
    description: 'Offboarding checklist and notifications when employee offboarding starts.',
    summary: 'Create offboarding checklist and notify managers when employee offboarding starts.',
    area: 'Employee Lifecycle',
    triggerKey: 'employee_offboarding_started',
    steps: [
      { type: 'trigger', config: { triggerKey: 'employee_offboarding_started' }, sectionId: 'main', sortOrder: 0 },
      { type: 'action', config: { actionKey: 'create_offboarding_checklist_from_template', checklistTemplateId: 'ct-offboarding-standard' }, sectionId: 'main', sortOrder: 1 },
      { type: 'notification', config: { recipientType: 'Reporting Manager', channel: 'In-app' }, sectionId: 'main', sortOrder: 2 },
      { type: 'notification', config: { recipientType: 'Role', recipientRole: 'HR Admin', channel: 'In-app' }, sectionId: 'main', sortOrder: 3 },
      { type: 'end', config: {}, sectionId: 'main', sortOrder: 4 }
    ]
  },
  {
    id: 'leave_request_approval',
    name: 'Leave Request Approval',
    description: 'Manager approval and employee notification for leave.',
    summary: 'When leave request submitted, ask reporting manager to approve, then notify employee.',
    area: 'Leave',
    triggerKey: 'leave_request_submitted',
    steps: [
      { type: 'trigger', config: { triggerKey: 'leave_request_submitted' }, sectionId: 'main', sortOrder: 0 },
      {
        type: 'approval',
        config: {
          approverType: 'Reporting Manager',
          approvalTimeoutEnabled: false,
          approvalTimeoutHours: 48,
          approvalTimeoutMinutes: 0,
          onApproved: 'Continue',
          onRejected: 'Notify employee',
          onTimeout: 'Do nothing'
        },
        sectionId: 'main',
        sortOrder: 1
      },
      { type: 'notification', config: { recipientType: 'Employee', channel: 'Email', subject: '', body: '' }, sectionId: 'main', sortOrder: 2 },
      { type: 'end', config: {}, sectionId: 'main', sortOrder: 3 }
    ]
  },
  {
    id: 'attendance_correction_approval',
    name: 'Attendance Correction Approval',
    description: 'Manager approval and employee notification for attendance corrections.',
    summary: 'When attendance correction submitted, ask reporting manager to approve, then notify employee.',
    area: 'Attendance',
    triggerKey: 'attendance_correction_submitted',
    steps: [
      { type: 'trigger', config: { triggerKey: 'attendance_correction_submitted' }, sectionId: 'main', sortOrder: 0 },
      {
        type: 'approval',
        config: {
          approverType: 'Reporting Manager',
          approvalTimeoutEnabled: false,
          approvalTimeoutHours: 24,
          approvalTimeoutMinutes: 0,
          onApproved: 'Continue',
          onRejected: 'Notify employee',
          onTimeout: 'Do nothing'
        },
        sectionId: 'main',
        sortOrder: 1
      },
      { type: 'notification', config: { recipientType: 'Employee', channel: 'In-app', subject: '', body: '' }, sectionId: 'main', sortOrder: 2 },
      { type: 'end', config: {}, sectionId: 'main', sortOrder: 3 }
    ]
  },
  {
    id: 'late_attendance_alert',
    name: 'Late Attendance Alert',
    description: 'Alert reporting manager on repeated late check-ins.',
    summary: 'Create an attendance alert when late check-ins exceed a threshold in a period.',
    area: 'Attendance',
    triggerKey: 'employee_checked_in_late',
    steps: [
      { type: 'trigger', config: { triggerKey: 'employee_checked_in_late' }, sectionId: 'main', sortOrder: 0 },
      { type: 'condition', config: { field: 'late_count_in_period', operator: 'greater_than', value: '3' }, sectionId: 'main', sortOrder: 1 },
      { type: 'alert', config: { alertTitle: 'Repeated late check-in', severity: 'medium', assignToType: 'Reporting Manager', sla: '24 hours' }, sectionId: 'main', sortOrder: 2 },
      { type: 'end', config: {}, sectionId: 'main', sortOrder: 3 }
    ]
  },
  {
    id: 'position_change_check',
    name: 'Position Change Check',
    description: 'Verify reporting manager exists after position change.',
    summary: 'Check reporting manager and department head rules when an employee moves position.',
    area: 'Organization',
    triggerKey: 'position_assignment_changed',
    steps: [
      { type: 'trigger', config: { triggerKey: 'position_assignment_changed' }, sectionId: 'main', sortOrder: 0 },
      {
        type: 'condition',
        config: {
          conditions: [{ id: 'c1', field: 'reporting_manager', operator: 'does_not_exist', value: '' }],
          hasBranch: false
        },
        sectionId: 'main',
        sortOrder: 1
      },
      { type: 'alert', config: { alertTitle: 'Missing reporting manager', severity: 'high', assignToType: 'Role', assignToRole: 'HR Admin', sla: '24 hours' }, sectionId: 'main', sortOrder: 2 },
      { type: 'end', config: {}, sectionId: 'main', sortOrder: 3 }
    ]
  },
  {
    id: 'monitoring_alert_escalation',
    name: 'Monitoring Alert Escalation',
    description: 'Escalate monitoring alerts for engineering violations.',
    summary: 'Assign and escalate monitoring alerts when severity is high or critical.',
    area: 'Monitoring',
    triggerKey: 'app_usage_violation_detected',
    steps: [
      { type: 'trigger', config: { triggerKey: 'app_usage_violation_detected' }, sectionId: 'main', sortOrder: 0 },
      { type: 'condition', config: { field: 'department', operator: 'is', value: 'dept-eng' }, sectionId: 'main', sortOrder: 1 },
      { type: 'alert', config: { alertTitle: 'App usage violation', severity: 'high', assignToType: 'Reporting Manager', sla: '4 hours' }, sectionId: 'main', sortOrder: 2 },
      { type: 'end', config: {}, sectionId: 'main', sortOrder: 3 }
    ]
  }
];

export const SEED_AUTOMATIONS: Automation[] = [
  {
    id: 'auto-1',
    templateId: 'new_employee_setup',
    name: 'New Employee Setup',
    description: 'Onboarding tasks, invite, and notifications for new hires.',
    summary: 'Set up tasks, invite, access suggestions, and notifications when a new employee is created.',
    area: 'Employee Lifecycle',
    trigger: 'Employee created',
    status: 'active',
    steps: [
      { id: 's1', type: 'trigger', config: { triggerKey: 'employee_created' }, sectionId: 'main', sortOrder: 0 },
      { id: 's2', type: 'action', config: { actionKey: 'create_onboarding_checklist_from_template', checklistTemplateId: 'ct-onboarding-standard' }, sectionId: 'main', sortOrder: 1 },
      { id: 's3', type: 'notification', config: { recipientType: 'Reporting Manager', channel: 'In-app' }, sectionId: 'main', sortOrder: 2 },
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
    id: 'auto-7',
    templateId: 'employee_offboarding',
    name: 'Employee Offboarding',
    description: 'Offboarding checklist and notifications when employee offboarding starts.',
    summary: 'Create offboarding checklist and notify managers when employee offboarding starts.',
    area: 'Employee Lifecycle',
    trigger: 'Employee offboarding started',
    status: 'active',
    steps: [
      { id: 's1', type: 'trigger', config: { triggerKey: 'employee_offboarding_started' }, sectionId: 'main', sortOrder: 0 },
      { id: 's2', type: 'action', config: { actionKey: 'create_offboarding_checklist_from_template', checklistTemplateId: 'ct-offboarding-standard' }, sectionId: 'main', sortOrder: 1 },
      { id: 's3', type: 'notification', config: { recipientType: 'Reporting Manager', channel: 'In-app' }, sectionId: 'main', sortOrder: 2 },
      { id: 's4', type: 'notification', config: { recipientType: 'Role', recipientRole: 'HR Admin', channel: 'In-app' }, sectionId: 'main', sortOrder: 3 },
      { id: 's5', type: 'end', config: {}, sectionId: 'main', sortOrder: 4 }
    ],
    lastRunAt: '2026-06-07T11:00:00Z',
    runCount: 28,
    failureCount: 0,
    alertsCreated: 0,
    openAlerts: 0,
    createdAt: ts('2025-12-01T10:00:00Z'),
    updatedAt: ts('2026-04-10T09:00:00Z')
  },
  {
    id: 'auto-2',
    templateId: 'leave_request_approval',
    name: 'Leave Request Approval',
    description: 'Manager approval and employee notification for leave.',
    summary: 'When leave request submitted, ask reporting manager to approve, then notify employee.',
    area: 'Leave',
    trigger: 'Leave request submitted',
    status: 'active',
    steps: [
      { id: 's1', type: 'trigger', config: { triggerKey: 'leave_request_submitted' }, sectionId: 'main', sortOrder: 0 },
      {
        id: 's2',
        type: 'approval',
        config: {
          approverType: 'Reporting Manager',
          approvalTimeoutEnabled: false,
          approvalTimeoutHours: 48,
          approvalTimeoutMinutes: 0,
          onApproved: 'Continue',
          onRejected: 'Notify employee',
          onTimeout: 'Do nothing'
        },
        sectionId: 'main',
        sortOrder: 1
      },
      { id: 's3', type: 'notification', config: { recipientType: 'Employee', channel: 'Email', subject: '', body: '' }, sectionId: 'main', sortOrder: 2 },
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
    templateId: 'late_attendance_alert',
    name: 'Late Attendance Alert',
    description: 'Alert reporting manager on repeated late check-ins.',
    summary: 'Create an attendance alert when late check-ins exceed a threshold in a period.',
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
    templateId: 'position_change_check',
    name: 'Position Change Check',
    description: 'Verify reporting manager exists after position change.',
    summary: 'Check reporting manager and department head rules when an employee moves position.',
    area: 'Organization',
    trigger: 'Position assignment changed',
    status: 'draft',
    steps: [
      { id: 's1', type: 'trigger', config: { triggerKey: 'position_assignment_changed' }, sectionId: 'main', sortOrder: 0 },
      {
        id: 's2',
        type: 'condition',
        config: {
          conditions: [{ id: 'c1', field: 'reporting_manager', operator: 'does_not_exist', value: '' }],
          hasBranch: false
        },
        sectionId: 'main',
        sortOrder: 1
      },
      { id: 's3', type: 'alert', config: { alertTitle: 'Missing reporting manager', severity: 'high', assignToType: 'Role', assignToRole: 'HR Admin', sla: '24 hours' }, sectionId: 'main', sortOrder: 2 },
      { id: 's4', type: 'end', config: {}, sectionId: 'main', sortOrder: 3 }
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
    id: 'auto-6',
    templateId: 'monitoring_alert_escalation',
    name: 'Monitoring Alert Escalation',
    description: 'Escalate monitoring alerts for engineering violations.',
    summary: 'Assign and escalate monitoring alerts when severity is high or critical.',
    area: 'Monitoring',
    trigger: 'App usage violation detected',
    status: 'active',
    steps: [
      { id: 's1', type: 'trigger', config: { triggerKey: 'app_usage_violation_detected' }, sectionId: 'main', sortOrder: 0 },
      { id: 's2', type: 'condition', config: { field: 'department', operator: 'is', value: 'dept-eng' }, sectionId: 'main', sortOrder: 1 },
      { id: 's3', type: 'alert', config: { alertTitle: 'App usage violation', severity: 'high', assignToType: 'Reporting Manager', sla: '4 hours' }, sectionId: 'main', sortOrder: 2 },
      { id: 's4', type: 'end', config: {}, sectionId: 'main', sortOrder: 3 }
    ],
    lastRunAt: '2026-06-09T16:30:00Z',
    runCount: 56,
    failureCount: 0,
    alertsCreated: 8,
    openAlerts: 3,
    createdAt: ts('2026-02-01T10:00:00Z'),
    updatedAt: ts('2026-06-01T12:00:00Z')
  }
];

export const SEED_ALERTS: AutomationAlert[] = [
  { id: 'al-1', automationId: 'auto-2', title: 'Leave approval overdue', severity: 'high', area: 'Leave', assignedTo: 'Department Head', status: 'open', createdAt: '2026-06-06T10:00:00Z', slaRemaining: '4h 12m' },
  { id: 'al-2', automationId: 'auto-3', title: 'Late check-in repeated', severity: 'medium', area: 'Attendance', assignedTo: 'Reporting Manager', status: 'open', createdAt: '2026-06-08T08:15:00Z', slaRemaining: '18h 30m' },
  { id: 'al-3', automationId: 'auto-3', title: 'Late check-in repeated', severity: 'medium', area: 'Attendance', assignedTo: 'Reporting Manager', status: 'resolved', createdAt: '2026-06-01T08:15:00Z', slaRemaining: '—' },
  { id: 'al-5', automationId: 'auto-6', title: 'App usage violation', severity: 'high', area: 'Monitoring', assignedTo: 'Reporting Manager', status: 'open', createdAt: '2026-06-09T14:00:00Z', slaRemaining: '2h 45m' }
];

export function getTemplateById(id: string) {
  return AUTOMATION_TEMPLATES.find(t => t.id === id);
}
