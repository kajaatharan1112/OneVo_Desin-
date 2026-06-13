export interface NotificationDelivery {
  inApp: boolean;
  email: boolean;
  inbox: boolean;
}

export interface NotificationTypeDef {
  id: string;
  category: string;
  name: string;
  description: string;
  eventKey: string;
  /** Actionable items can use Inbox delivery. */
  actionable: boolean;
  defaults: NotificationDelivery;
  preview: {
    inApp: string;
    emailSubject: string;
    emailBody: string;
    recipients: string;
    rules: string;
  };
}

type RowInput = {
  category: string;
  name: string;
  description: string;
  actionable: boolean;
  defaults: NotificationDelivery;
  id?: string;
  eventKey?: string;
  preview?: Partial<NotificationTypeDef['preview']>;
};

function row(input: RowInput): NotificationTypeDef {
  const id = input.id ?? input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const eventKey = input.eventKey ?? `notifications.${id.replace(/-/g, '.')}`;
  return {
    id,
    category: input.category,
    name: input.name,
    description: input.description,
    eventKey,
    actionable: input.actionable,
    defaults: { ...input.defaults },
    preview: {
      inApp: input.preview?.inApp ?? `${input.name} — in-app notification preview.`,
      emailSubject: input.preview?.emailSubject ?? input.name,
      emailBody: input.preview?.emailBody ?? input.description,
      recipients: input.preview?.recipients ?? 'Affected users based on event context.',
      rules: input.preview?.rules ?? 'Delivered according to tenant notification defaults.',
    },
  };
}

const PEOPLE: NotificationTypeDef[] = [
  row({
    category: 'Employee / People',
    name: 'Employee invite',
    description: 'Sent when login access is created for an employee.',
    actionable: false,
    defaults: { inApp: false, email: true, inbox: false },
    preview: {
      recipients: 'Invited employee',
      emailSubject: 'You have been invited to OneVo',
      emailBody: 'Use the link below to activate your account and set up sign-in.',
    },
  }),
  row({ category: 'Employee / People', name: 'Onboarding task assigned', description: 'Notifies assignees when onboarding checklist tasks are created.', actionable: true, defaults: { inApp: true, email: false, inbox: true } }),
  row({ category: 'Employee / People', name: 'Offboarding task assigned', description: 'Notifies assignees when offboarding checklist tasks are created.', actionable: true, defaults: { inApp: true, email: false, inbox: true } }),
  row({ category: 'Employee / People', name: 'Employee transfer completed', description: 'Notifies affected managers when an employee moves position or department.', actionable: false, defaults: { inApp: true, email: false, inbox: false } }),
  row({ category: 'Employee / People', name: 'Employee promotion completed', description: 'Notifies the employee and affected manager after promotion confirmation.', actionable: false, defaults: { inApp: true, email: false, inbox: false } }),
  row({ category: 'Employee / People', name: 'Employee offboarding started', description: 'Notifies task assignees and responsible managers.', actionable: true, defaults: { inApp: true, email: false, inbox: true } }),
];

const LEAVE: NotificationTypeDef[] = [
  row({ category: 'Leave', name: 'Leave request submitted', description: 'Notifies assigned approver when an employee submits leave.', actionable: true, defaults: { inApp: true, email: false, inbox: true } }),
  row({ category: 'Leave', name: 'Leave request approved', description: 'Notifies employee when leave is approved.', actionable: false, defaults: { inApp: true, email: true, inbox: false } }),
  row({ category: 'Leave', name: 'Leave request rejected', description: 'Notifies employee when leave is rejected.', actionable: false, defaults: { inApp: true, email: true, inbox: false } }),
  row({ category: 'Leave', name: 'Leave request cancelled', description: 'Notifies employee/manager when a pending or approved leave is cancelled.', actionable: false, defaults: { inApp: true, email: false, inbox: false } }),
  row({ category: 'Leave', name: 'Leave approval reminder', description: 'Reminder to approver when leave remains pending.', actionable: true, defaults: { inApp: true, email: false, inbox: true } }),
  row({ category: 'Leave', name: 'Leave approval escalated', description: 'Notifies escalation recipient when leave approval SLA is missed.', actionable: true, defaults: { inApp: true, email: true, inbox: true } }),
  row({ category: 'Leave', name: 'Leave balance warning', description: 'Warns employee/admin when leave balance is low or over-utilized.', actionable: false, defaults: { inApp: true, email: false, inbox: false } }),
];

const ATTENDANCE: NotificationTypeDef[] = [
  row({ category: 'Attendance', name: 'Attendance correction submitted', description: 'Notifies approver when employee submits attendance correction.', actionable: true, defaults: { inApp: true, email: false, inbox: true } }),
  row({ category: 'Attendance', name: 'Attendance correction approved', description: 'Notifies employee when correction is approved.', actionable: false, defaults: { inApp: true, email: false, inbox: false } }),
  row({ category: 'Attendance', name: 'Attendance correction rejected', description: 'Notifies employee when correction is rejected.', actionable: false, defaults: { inApp: true, email: false, inbox: false } }),
  row({ category: 'Attendance', name: 'Late attendance alert', description: 'Notifies configured resolver when lateness crosses configured threshold.', actionable: false, defaults: { inApp: true, email: false, inbox: false } }),
  row({ category: 'Attendance', name: 'Missed punch alert', description: 'Notifies employee or resolver when clock-in/out is missing.', actionable: false, defaults: { inApp: true, email: false, inbox: false } }),
  row({ category: 'Attendance', name: 'Overtime request submitted', description: 'Notifies approver when overtime needs review.', actionable: true, defaults: { inApp: true, email: false, inbox: true } }),
  row({ category: 'Attendance', name: 'Overtime approved', description: 'Notifies employee after overtime approval.', actionable: false, defaults: { inApp: true, email: false, inbox: false } }),
  row({ category: 'Attendance', name: 'Overtime rejected', description: 'Notifies employee after overtime rejection.', actionable: false, defaults: { inApp: true, email: false, inbox: false } }),
];

const DOCUMENTS: NotificationTypeDef[] = [
  row({ category: 'Documents', name: 'Document requires acknowledgement', description: 'Notifies employees that a policy/document requires acknowledgement.', actionable: true, defaults: { inApp: true, email: true, inbox: true } }),
  row({ category: 'Documents', name: 'Document acknowledgement reminder', description: 'Reminds employees who have not acknowledged required document.', actionable: true, defaults: { inApp: true, email: true, inbox: true } }),
  row({ category: 'Documents', name: 'Document acknowledgement overdue', description: 'Escalates overdue acknowledgement to manager/resolver.', actionable: true, defaults: { inApp: true, email: true, inbox: true } }),
  row({ category: 'Documents', name: 'New document published', description: 'Notifies affected employees when a new document is published.', actionable: false, defaults: { inApp: true, email: false, inbox: false } }),
  row({ category: 'Documents', name: 'Document version updated', description: 'Notifies employees when acknowledgement resets after document update.', actionable: true, defaults: { inApp: true, email: true, inbox: true } }),
];

const PAYROLL: NotificationTypeDef[] = [
  row({ category: 'Payroll', name: 'Payslip available', description: 'Notifies employee when payslip is ready.', actionable: false, defaults: { inApp: true, email: true, inbox: false } }),
  row({ category: 'Payroll', name: 'Payroll run completed', description: 'Notifies payroll/admin users when payroll run completes.', actionable: false, defaults: { inApp: true, email: true, inbox: false } }),
  row({ category: 'Payroll', name: 'Payroll run failed', description: 'Notifies payroll/admin users when payroll processing fails.', actionable: true, defaults: { inApp: true, email: true, inbox: true } }),
  row({ category: 'Payroll', name: 'Payroll approval required', description: 'Notifies assigned approver when payroll requires approval.', actionable: true, defaults: { inApp: true, email: true, inbox: true } }),
];

const PERFORMANCE: NotificationTypeDef[] = [
  row({ category: 'Performance', name: 'Review cycle launched', description: 'Notifies participants that review cycle has started.', actionable: false, defaults: { inApp: true, email: true, inbox: false } }),
  row({ category: 'Performance', name: 'Self-assessment due', description: 'Reminds employee to complete self-assessment.', actionable: true, defaults: { inApp: true, email: false, inbox: true } }),
  row({ category: 'Performance', name: 'Manager review due', description: 'Reminds manager to complete team review.', actionable: true, defaults: { inApp: true, email: false, inbox: true } }),
  row({ category: 'Performance', name: 'Peer feedback requested', description: 'Notifies employee they were asked to provide peer feedback.', actionable: true, defaults: { inApp: true, email: false, inbox: true } }),
  row({ category: 'Performance', name: 'Review completed', description: 'Notifies employee that review results are available.', actionable: false, defaults: { inApp: true, email: true, inbox: false } }),
  row({ category: 'Performance', name: 'Goal assigned', description: 'Notifies employee when a goal is assigned.', actionable: false, defaults: { inApp: true, email: false, inbox: false } }),
  row({ category: 'Performance', name: 'Improvement plan assigned', description: 'Notifies employee, mentor, and HR when improvement plan is assigned.', actionable: true, defaults: { inApp: true, email: true, inbox: true } }),
  row({ category: 'Performance', name: 'PIP check-in overdue', description: 'Notifies responsible users when improvement-plan check-in is overdue.', actionable: true, defaults: { inApp: true, email: true, inbox: true } }),
  row({ category: 'Performance', name: 'Recognition received', description: 'Notifies employee when recognition is received.', actionable: false, defaults: { inApp: true, email: false, inbox: false } }),
];

const MONITORING: NotificationTypeDef[] = [
  row({ category: 'Exceptions / Monitoring', name: 'Exception alert created', description: 'Notifies resolver when a formal exception alert is created.', actionable: true, defaults: { inApp: true, email: false, inbox: true } }),
  row({ category: 'Exceptions / Monitoring', name: 'Exception alert escalated', description: 'Notifies escalation resolver when exception is escalated.', actionable: true, defaults: { inApp: true, email: true, inbox: true } }),
  row({ category: 'Exceptions / Monitoring', name: 'Agent offline too long', description: 'Notifies resolver when employee device/agent is offline longer than allowed.', actionable: false, defaults: { inApp: true, email: false, inbox: false } }),
  row({ category: 'Exceptions / Monitoring', name: 'Identity verification failed', description: 'Notifies resolver when identity verification fails.', actionable: true, defaults: { inApp: true, email: true, inbox: true } }),
  row({ category: 'Exceptions / Monitoring', name: 'App usage violation detected', description: 'Notifies resolver when monitored app usage violates policy.', actionable: false, defaults: { inApp: true, email: false, inbox: false } }),
  row({ category: 'Exceptions / Monitoring', name: 'Location mismatch detected', description: 'Notifies resolver when employee work location evidence mismatches policy.', actionable: true, defaults: { inApp: true, email: false, inbox: true } }),
  row({ category: 'Exceptions / Monitoring', name: 'Idle time exceeded threshold', description: 'Notifies resolver when idle time crosses configured threshold.', actionable: false, defaults: { inApp: true, email: false, inbox: false } }),
];

const REPORTS: NotificationTypeDef[] = [
  row({ category: 'Reports / Analytics', name: 'Scheduled report ready', description: 'Notifies recipients when scheduled report is ready.', actionable: false, defaults: { inApp: true, email: true, inbox: false } }),
  row({ category: 'Reports / Analytics', name: 'Export ready', description: 'Notifies user when large data export is ready.', actionable: false, defaults: { inApp: true, email: true, inbox: false } }),
  row({ category: 'Reports / Analytics', name: 'Report delivery failed', description: 'Notifies report owner when scheduled delivery fails.', actionable: true, defaults: { inApp: true, email: true, inbox: true } }),
];

const SECURITY: NotificationTypeDef[] = [
  row({ category: 'Security / Access', name: 'Role assigned', description: 'Notifies user when a security role is assigned.', actionable: false, defaults: { inApp: true, email: false, inbox: false } }),
  row({ category: 'Security / Access', name: 'Permission changed', description: 'Notifies affected user/admin when permissions change.', actionable: false, defaults: { inApp: true, email: false, inbox: false } }),
  row({ category: 'Security / Access', name: 'Account invite sent', description: 'Sent when login access invite is created.', actionable: false, defaults: { inApp: false, email: true, inbox: false } }),
  row({ category: 'Security / Access', name: 'Password reset requested', description: 'Sends password reset link.', actionable: false, defaults: { inApp: false, email: true, inbox: false } }),
  row({ category: 'Security / Access', name: 'MFA changed', description: 'Notifies user when MFA is enabled, disabled, or reset.', actionable: false, defaults: { inApp: true, email: true, inbox: false } }),
  row({ category: 'Security / Access', name: 'User account locked', description: 'Notifies admin/user when account is locked.', actionable: false, defaults: { inApp: true, email: true, inbox: false } }),
  row({ category: 'Security / Access', name: 'User account unlocked', description: 'Notifies user when account is unlocked.', actionable: false, defaults: { inApp: true, email: false, inbox: false } }),
];

const SYSTEM: NotificationTypeDef[] = [
  row({ category: 'System', name: 'Settings changed', description: 'Notifies admins when tenant settings are changed.', actionable: false, defaults: { inApp: true, email: false, inbox: false } }),
  row({ category: 'System', name: 'Billing invoice available', description: 'Notifies billing admins when invoice is available.', actionable: false, defaults: { inApp: true, email: true, inbox: false } }),
  row({ category: 'System', name: 'Billing payment failed', description: 'Notifies billing admins when payment fails.', actionable: true, defaults: { inApp: true, email: true, inbox: true } }),
  row({ category: 'System', name: 'Subscription changed', description: 'Notifies admins when subscription or modules change.', actionable: false, defaults: { inApp: true, email: true, inbox: false } }),
];

export function buildNotificationCatalog(includeMonitoring: boolean): NotificationTypeDef[] {
  return [
    ...PEOPLE,
    ...LEAVE,
    ...ATTENDANCE,
    ...DOCUMENTS,
    ...PAYROLL,
    ...PERFORMANCE,
    ...(includeMonitoring ? MONITORING : []),
    ...REPORTS,
    ...SECURITY,
    ...SYSTEM,
  ];
}

export function cloneDelivery(d: NotificationDelivery): NotificationDelivery {
  return { ...d };
}

export function deliveryKey(id: string, delivery: NotificationDelivery): string {
  return `${id}:${delivery.inApp}:${delivery.email}:${delivery.inbox}`;
}

export function serializeDeliveries(catalog: NotificationTypeDef[], values: Record<string, NotificationDelivery>): string {
  return catalog.map(n => deliveryKey(n.id, values[n.id] ?? n.defaults)).join('|');
}

export function buildInitialDeliveries(catalog: NotificationTypeDef[]): Record<string, NotificationDelivery> {
  return Object.fromEntries(catalog.map(n => [n.id, cloneDelivery(n.defaults)]));
}

export const NOTIFICATION_CATEGORIES = [
  'Employee / People',
  'Leave',
  'Attendance',
  'Documents',
  'Payroll',
  'Performance',
  'Exceptions / Monitoring',
  'Reports / Analytics',
  'Security / Access',
  'System',
] as const;

export type DeliveryMethodFilter = 'in-app' | 'email' | 'inbox';
