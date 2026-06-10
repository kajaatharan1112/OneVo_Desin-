import type { AppNotification } from '../../shared/types/notification.types';
import type { EmployeeId } from '../../features/employees/types/employee.types';

const alexEmployeeNew: AppNotification[] = [
  {
    id: 'emp-n1',
    category: 'approval',
    title: 'Acting request',
    message: 'James Carter requested you to act on his behalf from Mon 26 – Wed 28 May.',
    timeLabel: '12 min ago',
    filter: 'new',
    actions: [
      { id: 'approve', label: 'Approve', variant: 'primary' },
      { id: 'cancel', label: 'Cancel', variant: 'secondary' }
    ]
  },
  {
    id: 'emp-n2',
    category: 'meeting',
    title: 'Meeting reminder',
    message: 'Team standup starts in 15 minutes · Conference Room B / Teams link ready.',
    timeLabel: '25 min ago',
    filter: 'new',
    actions: [{ id: 'join', label: 'Join', variant: 'primary' }]
  },
  {
    id: 'emp-n3',
    category: 'task-review',
    title: 'New task assigned',
    message: 'Q2 client report draft — due Friday. Review scope and attachments before starting.',
    timeLabel: '1 hr ago',
    filter: 'new',
    actions: [{ id: 'view-task', label: 'View Task', variant: 'primary' }]
  },
  {
    id: 'emp-n4',
    category: 'todo-request',
    title: 'Task to do',
    message: 'Submit weekly timesheet for approval before end of day.',
    timeLabel: '2 hrs ago',
    filter: 'new',
    actions: [
      { id: 'accept', label: 'Accept', variant: 'primary' },
      { id: 'denied', label: 'Denied', variant: 'danger' }
    ]
  },
  {
    id: 'emp-n5',
    category: 'warning',
    title: 'Late clock in',
    message: 'System recorded clock-in at 9:42 AM today — 42 minutes after your scheduled start.',
    timeLabel: 'Today',
    filter: 'new',
    actions: []
  }
];

const alexEmployeePast: AppNotification[] = [
  {
    id: 'emp-p1',
    category: 'approval',
    title: 'Acting request (resolved)',
    message: 'You approved Priya Nair’s acting request for 19–20 May.',
    timeLabel: '3 days ago',
    filter: 'past',
    actions: []
  },
  {
    id: 'emp-p2',
    category: 'task-review',
    title: 'Task completed',
    message: 'Sprint backlog grooming — marked complete by reviewer.',
    timeLabel: 'Last week',
    filter: 'past',
    actions: []
  }
];

const marcusEmployeeNew: AppNotification[] = [
  {
    id: 'ceo-n1',
    category: 'approval',
    title: 'Executive budget approval',
    message: 'Finance team submitted FY26 department budgets — 5 items awaiting your sign-off.',
    timeLabel: '10 min ago',
    filter: 'new',
    actions: [
      { id: 'approve', label: 'Review', variant: 'primary' },
      { id: 'cancel', label: 'Later', variant: 'secondary' }
    ]
  },
  {
    id: 'ceo-n2',
    category: 'meeting',
    title: 'Board meeting reminder',
    message: 'Quarterly board session starts at 2:00 PM · Board deck v3 attached.',
    timeLabel: '20 min ago',
    filter: 'new',
    actions: [{ id: 'join', label: 'Open Deck', variant: 'primary' }]
  },
  {
    id: 'ceo-n3',
    category: 'task-review',
    title: 'Investor update draft',
    message: 'Q3 investor relations summary ready for review — publish window closes Friday.',
    timeLabel: '45 min ago',
    filter: 'new',
    actions: [{ id: 'view-task', label: 'Review', variant: 'primary' }]
  },
  {
    id: 'ceo-n4',
    category: 'todo-request',
    title: 'Leadership hire decision',
    message: 'VP Sales final offer package requires executive approval before end of day.',
    timeLabel: '1 hr ago',
    filter: 'new',
    actions: [
      { id: 'accept', label: 'Approve', variant: 'primary' },
      { id: 'denied', label: 'Defer', variant: 'danger' }
    ]
  },
  {
    id: 'ceo-n5',
    category: 'meeting',
    title: 'All-hands keynote',
    message: 'Company-wide address scheduled tomorrow 10:00 AM — slides need final review.',
    timeLabel: 'Today',
    filter: 'new',
    actions: [{ id: 'view-task', label: 'View Slides', variant: 'primary' }]
  }
];

const marcusEmployeePast: AppNotification[] = [
  {
    id: 'ceo-p1',
    category: 'approval',
    title: 'APAC expansion (approved)',
    message: 'You approved the APAC market entry pilot plan for Q1 FY26.',
    timeLabel: '2 days ago',
    filter: 'past',
    actions: []
  },
  {
    id: 'ceo-p2',
    category: 'task-review',
    title: 'Enterprise client win',
    message: 'Apex Corp contract signed — $480K ARR added to pipeline.',
    timeLabel: 'Last week',
    filter: 'past',
    actions: []
  }
];

const employeeNotificationsById: Record<EmployeeId, AppNotification[]> = {
  alex: [...alexEmployeeNew, ...alexEmployeePast],
  marcus: [...marcusEmployeeNew, ...marcusEmployeePast]
};

const tenantNew: AppNotification[] = [
  {
    id: 'ten-n1',
    category: 'approval',
    title: 'Edit profile request',
    message: 'Maria Lopez requested changes to job title and department — review before approval.',
    timeLabel: '8 min ago',
    filter: 'new',
    actions: [
      { id: 'approve', label: 'Approve', variant: 'primary' },
      { id: 'cancel', label: 'Cancel', variant: 'secondary' }
    ]
  },
  {
    id: 'ten-n2',
    category: 'approval',
    title: 'Leave request',
    message: 'Tom Richardson applied for 3 days annual leave (2–4 Jun). Policy balance: 12 days left.',
    timeLabel: '34 min ago',
    filter: 'new',
    actions: [
      { id: 'approve', label: 'Approve', variant: 'primary' },
      { id: 'cancel', label: 'Cancel', variant: 'secondary' }
    ]
  },
  {
    id: 'ten-n3',
    category: 'meeting',
    title: 'Meeting reminder',
    message: 'Budget review with finance — starts in 30 minutes. Agenda attached.',
    timeLabel: '45 min ago',
    filter: 'new',
    actions: [{ id: 'join', label: 'Join', variant: 'primary' }]
  },
  {
    id: 'ten-n4',
    category: 'task-review',
    title: 'Report request reminder',
    message: 'Monthly attendance summary is due from your team — 2 submissions pending.',
    timeLabel: '2 hrs ago',
    filter: 'new',
    actions: [{ id: 'view-task', label: 'View Task', variant: 'primary' }]
  },
  {
    id: 'ten-n5',
    category: 'todo-request',
    title: 'Report to do',
    message: 'Q2 payroll summary report — assign owner and due date for department heads.',
    timeLabel: '3 hrs ago',
    filter: 'new',
    actions: [
      { id: 'accept', label: 'Accept', variant: 'primary' },
      { id: 'denied', label: 'Denied', variant: 'danger' }
    ]
  },
  {
    id: 'ten-n6',
    category: 'warning',
    title: 'Late clock in detected',
    message: 'Alexander Pierce clocked in at 9:38 AM — 38 minutes late. Attendance flag raised.',
    timeLabel: 'Today',
    filter: 'new',
    actions: []
  }
];

const tenantPast: AppNotification[] = [
  {
    id: 'ten-p1',
    category: 'approval',
    title: 'Leave request (approved)',
    message: 'You approved annual leave for Sarah Jenkins (12–14 May).',
    timeLabel: '5 days ago',
    filter: 'past',
    actions: []
  },
  {
    id: 'ten-p2',
    category: 'warning',
    title: 'Late clock in (resolved)',
    message: 'Late arrival alert for James Carter on 18 May — marked reviewed.',
    timeLabel: 'Last week',
    filter: 'past',
    actions: []
  }
];

export function getNotificationsForView(
  view: 'employee' | 'tenant',
  employeeId: EmployeeId = 'alex'
): AppNotification[] {
  if (view === 'employee') {
    return employeeNotificationsById[employeeId] ?? employeeNotificationsById.alex;
  }
  return [...tenantNew, ...tenantPast];
}

export function countNewNotifications(
  view: 'employee' | 'tenant',
  employeeId: EmployeeId = 'alex'
): number {
  return getNotificationsForView(view, employeeId).filter((n) => n.filter === 'new').length;
}
