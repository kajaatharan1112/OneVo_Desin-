export interface NotificationDelivery {
  inApp: boolean;
  email: boolean;
}

export interface NotificationTypeDef {
  id: string;
  category: string;
  name: string;
  description: string;
  eventKey: string;
  defaults: NotificationDelivery;
  preview: {
    inApp: string;
    emailSubject: string;
    emailBody: string;
    recipients: string;
    rules: string;
  };
}

interface RowInput {
  category: string;
  name: string;
  description: string;
  defaults: NotificationDelivery;
  eventKey: string;
  preview: NotificationTypeDef['preview'];
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function row(input: RowInput): NotificationTypeDef {
  return {
    id: slugify(input.name),
    category: input.category,
    name: input.name,
    description: input.description,
    eventKey: input.eventKey,
    defaults: { ...input.defaults },
    preview: { ...input.preview },
  };
}

export const NOTIFICATION_CATALOG: NotificationTypeDef[] = [
  ...[
    ['Employee promotion', 'Sent when an employee is promoted.', 'employee.promotion'],
    ['Employee invitation', 'Sent when a new employee invitation is created.', 'employee.invitation'],
    ['Employee transfer', 'Sent when an employee moves to another department or position.', 'employee.transfer'],
    ['Employee offboarding', 'Sent when an employee offboarding process starts.', 'employee.offboarding'],
    ['Employee access blocked', 'Sent when employee login access is blocked.', 'employee.access.blocked'],
  ].map(([name, description, eventKey]) => row({ category: 'Employee', name, description, eventKey, defaults: { inApp: true, email: true }, preview: { inApp: description, emailSubject: name, emailBody: description, recipients: 'Employee and relevant managers', rules: 'Sent when this employee event occurs.' } })),
  ...[
    ['Position created', 'Sent when a new position is added to the hierarchy.', 'setup.position.created'],
    ['Position updated', 'Sent when position details or reporting line changes.', 'setup.position.updated'],
    ['Position member assigned', 'Sent when an employee is assigned to a position.', 'setup.position.member.assigned'],
  ].map(([name, description, eventKey]) => row({ category: 'Setup', name, description, eventKey, defaults: { inApp: true, email: false }, preview: { inApp: description, emailSubject: name, emailBody: description, recipients: 'Organization administrators', rules: 'Sent when this setup event occurs.' } })),
  row({
    category: 'Projects',
    name: 'Project invite received',
    description: 'Sent when someone is invited to join a project.',
    eventKey: 'project.invite.received',
    defaults: { inApp: true, email: true },
    preview: {
      inApp: 'You were invited to join "Q3 Roadmap".',
      emailSubject: 'You’ve been invited to a project',
      emailBody: 'You have been invited to join the project "Q3 Roadmap". Open OneVo to accept or decline.',
      recipients: 'Invited user',
      rules: 'Sent once when a project invite is created.',
    },
  }),
  row({
    category: 'Projects',
    name: 'Project invite accepted',
    description: 'Sent when an invited user accepts a project invite.',
    eventKey: 'project.invite.accepted',
    defaults: { inApp: true, email: false },
    preview: {
      inApp: 'Priya Sharma accepted your invite to "Q3 Roadmap".',
      emailSubject: 'Project invite accepted',
      emailBody: 'Priya Sharma accepted the invite to join "Q3 Roadmap".',
      recipients: 'Project owner / inviter',
      rules: 'Sent once when the invite is accepted.',
    },
  }),
  row({
    category: 'Projects',
    name: 'Project invite declined',
    description: 'Sent when an invited user declines a project invite.',
    eventKey: 'project.invite.declined',
    defaults: { inApp: true, email: false },
    preview: {
      inApp: 'James Chen declined your invite to "Q3 Roadmap".',
      emailSubject: 'Project invite declined',
      emailBody: 'James Chen declined the invite to join "Q3 Roadmap".',
      recipients: 'Project owner / inviter',
      rules: 'Sent once when the invite is declined.',
    },
  }),
  row({
    category: 'Workspaces',
    name: 'Workspace participation requested',
    description: 'Sent when an employee requests to join a workspace.',
    eventKey: 'workspace.participation.requested',
    defaults: { inApp: true, email: true },
    preview: {
      inApp: 'Maria Lopez requested to join the "Design" workspace.',
      emailSubject: 'New workspace participation request',
      emailBody: 'Maria Lopez has requested to join the "Design" workspace and is waiting for approval.',
      recipients: 'Workspace admins',
      rules: 'Sent once when a participation request is created.',
    },
  }),
  row({
    category: 'Workspaces',
    name: 'Workspace participation approved',
    description: 'Sent when a workspace participation request is approved.',
    eventKey: 'workspace.participation.approved',
    defaults: { inApp: true, email: false },
    preview: {
      inApp: 'Your request to join "Design" was approved.',
      emailSubject: 'Workspace request approved',
      emailBody: 'Your request to join the "Design" workspace has been approved.',
      recipients: 'Requesting employee',
      rules: 'Sent once when the request is approved.',
    },
  }),
  row({
    category: 'Workspaces',
    name: 'Workspace participation rejected',
    description: 'Sent when a workspace participation request is rejected.',
    eventKey: 'workspace.participation.rejected',
    defaults: { inApp: true, email: false },
    preview: {
      inApp: 'Your request to join "Design" was declined.',
      emailSubject: 'Workspace request declined',
      emailBody: 'Your request to join the "Design" workspace has been declined.',
      recipients: 'Requesting employee',
      rules: 'Sent once when the request is rejected.',
    },
  }),
  row({
    category: 'Projects',
    name: 'Related project link requested',
    description: 'Sent when a project requests to link with another project.',
    eventKey: 'project.link.requested',
    defaults: { inApp: true, email: true },
    preview: {
      inApp: '"Q3 Roadmap" requested to link with "Mobile App Launch".',
      emailSubject: 'New related project link request',
      emailBody: 'The project "Q3 Roadmap" has requested to be linked with "Mobile App Launch".',
      recipients: 'Target project owner',
      rules: 'Sent once when a link request is created.',
    },
  }),
  row({
    category: 'Projects',
    name: 'Related project link approved',
    description: 'Sent when a related project link request is approved.',
    eventKey: 'project.link.approved',
    defaults: { inApp: true, email: false },
    preview: {
      inApp: 'Your link request with "Mobile App Launch" was approved.',
      emailSubject: 'Project link approved',
      emailBody: 'The request to link "Q3 Roadmap" with "Mobile App Launch" has been approved.',
      recipients: 'Requesting project owner',
      rules: 'Sent once when the request is approved.',
    },
  }),
  row({
    category: 'Projects',
    name: 'Related project link rejected',
    description: 'Sent when a related project link request is rejected.',
    eventKey: 'project.link.rejected',
    defaults: { inApp: true, email: false },
    preview: {
      inApp: 'Your link request with "Mobile App Launch" was declined.',
      emailSubject: 'Project link declined',
      emailBody: 'The request to link "Q3 Roadmap" with "Mobile App Launch" has been declined.',
      recipients: 'Requesting project owner',
      rules: 'Sent once when the request is rejected.',
    },
  }),
  row({
    category: 'Work Items',
    name: 'Work item assigned',
    description: 'Sent when a work item is assigned to someone.',
    eventKey: 'work_item.assigned',
    defaults: { inApp: true, email: true },
    preview: {
      inApp: 'You were assigned "Fix login redirect bug".',
      emailSubject: 'A work item was assigned to you',
      emailBody: 'You have been assigned the work item "Fix login redirect bug" in "Mobile App Launch".',
      recipients: 'Assignee',
      rules: 'Sent once when the assignee changes.',
    },
  }),
  row({
    category: 'Work Items',
    name: 'Work item mentioned',
    description: 'Sent when someone is @mentioned on a work item.',
    eventKey: 'work_item.mentioned',
    defaults: { inApp: true, email: false },
    preview: {
      inApp: 'David Nguyen mentioned you on "Fix login redirect bug".',
      emailSubject: 'You were mentioned',
      emailBody: 'David Nguyen mentioned you in a comment on "Fix login redirect bug".',
      recipients: 'Mentioned user',
      rules: 'Sent once per mention.',
    },
  }),
  row({
    category: 'Work Items',
    name: 'Work item due soon',
    description: 'Reminder sent shortly before a work item is due.',
    eventKey: 'work_item.due_soon',
    defaults: { inApp: true, email: true },
    preview: {
      inApp: '"Fix login redirect bug" is due tomorrow.',
      emailSubject: 'Upcoming due date',
      emailBody: 'The work item "Fix login redirect bug" assigned to you is due tomorrow.',
      recipients: 'Assignee',
      rules: 'Sent once, 24 hours before the due date.',
    },
  }),
  row({
    category: 'Leave',
    name: 'Leave request submitted',
    description: 'Sent to approvers when an employee submits a leave request.',
    eventKey: 'leave.request.submitted',
    defaults: { inApp: true, email: false },
    preview: {
      inApp: 'Priya Sharma requested 3 days of annual leave.',
      emailSubject: 'New leave request awaiting approval',
      emailBody: 'Priya Sharma has requested 3 days of annual leave from 20-22 Jun. Review and respond in OneVo.',
      recipients: 'Direct manager / approver',
      rules: 'Sent once when the request is submitted.',
    },
  }),
  row({
    category: 'Leave',
    name: 'Leave request approved',
    description: 'Sent to the employee when their leave request is approved.',
    eventKey: 'leave.request.approved',
    defaults: { inApp: true, email: true },
    preview: {
      inApp: 'Your leave request for 20-22 Jun was approved.',
      emailSubject: 'Your leave request was approved',
      emailBody: 'Your request for 3 days of annual leave from 20-22 Jun has been approved.',
      recipients: 'Requesting employee',
      rules: 'Sent once when the request is approved.',
    },
  }),
  row({
    category: 'Leave',
    name: 'Leave request rejected',
    description: 'Sent to the employee when their leave request is rejected.',
    eventKey: 'leave.request.rejected',
    defaults: { inApp: true, email: true },
    preview: {
      inApp: 'Your leave request for 20-22 Jun was declined.',
      emailSubject: 'Your leave request was declined',
      emailBody: 'Your request for 3 days of annual leave from 20-22 Jun has been declined. See manager comments in OneVo.',
      recipients: 'Requesting employee',
      rules: 'Sent once when the request is rejected.',
    },
  }),
  row({
    category: 'Attendance',
    name: 'Attendance correction submitted',
    description: 'Sent to approvers when an employee submits an attendance correction.',
    eventKey: 'attendance.correction.submitted',
    defaults: { inApp: true, email: false },
    preview: {
      inApp: 'James Chen submitted an attendance correction for 10 Jun.',
      emailSubject: 'New attendance correction awaiting approval',
      emailBody: 'James Chen has submitted an attendance correction for 10 Jun. Review and respond in OneVo.',
      recipients: 'Direct manager / approver',
      rules: 'Sent once when the correction is submitted.',
    },
  }),
  row({
    category: 'Documents',
    name: 'Document requested',
    description: 'Sent when an employee is asked to submit a document.',
    eventKey: 'document.requested',
    defaults: { inApp: true, email: true },
    preview: {
      inApp: 'HR requested your "Proof of Address" document.',
      emailSubject: 'Document requested',
      emailBody: 'HR has requested that you upload your "Proof of Address" document in OneVo.',
      recipients: 'Employee',
      rules: 'Sent once when the request is created.',
    },
  }),
  row({
    category: 'Documents',
    name: 'Document approved',
    description: 'Sent when a submitted document is reviewed and approved.',
    eventKey: 'document.approved',
    defaults: { inApp: true, email: false },
    preview: {
      inApp: 'Your "Proof of Address" document was approved.',
      emailSubject: 'Document approved',
      emailBody: 'Your submitted document "Proof of Address" has been reviewed and approved.',
      recipients: 'Employee',
      rules: 'Sent once when the document is approved.',
    },
  }),
  row({
    category: 'Automations',
    name: 'Automation alert created',
    description: 'Sent when an automation rule creates a new alert.',
    eventKey: 'automation.alert.created',
    defaults: { inApp: true, email: false },
    preview: {
      inApp: 'Automation "Idle time exceeded" created a new alert for Maria Lopez.',
      emailSubject: 'New automation alert',
      emailBody: 'The automation rule "Idle time exceeded" created a new alert for Maria Lopez.',
      recipients: 'Automation owner / admins',
      rules: 'Sent once per alert created.',
    },
  }),
  row({
    category: 'Approvals',
    name: 'Approval request assigned',
    description: 'Sent when an approval step is assigned to someone.',
    eventKey: 'approval.request.assigned',
    defaults: { inApp: true, email: true },
    preview: {
      inApp: 'You have a new approval request: "Q3 Budget Increase".',
      emailSubject: 'New approval request assigned to you',
      emailBody: 'You have been assigned an approval step for "Q3 Budget Increase". Review and respond in OneVo.',
      recipients: 'Assigned approver',
      rules: 'Sent once when the approval step is assigned.',
    },
  }),
];

export const NOTIFICATION_CATEGORIES = [
  'Employee',
  'Setup',
  'Projects',
  'Workspaces',
  'Work Items',
  'Leave',
  'Attendance',
  'Documents',
  'Automations',
  'Approvals',
];

export function cloneDelivery(d: NotificationDelivery): NotificationDelivery {
  return { ...d };
}

export function deliveryKey(id: string, delivery: NotificationDelivery): string {
  return `${id}:${delivery.inApp}:${delivery.email}`;
}

export function serializeDeliveries(catalog: NotificationTypeDef[], values: Record<string, NotificationDelivery>): string {
  return catalog.map(n => deliveryKey(n.id, values[n.id] ?? n.defaults)).join('|');
}

export function buildInitialDeliveries(catalog: NotificationTypeDef[]): Record<string, NotificationDelivery> {
  return Object.fromEntries(catalog.map(n => [n.id, cloneDelivery(n.defaults)]));
}
