export interface WorkforceMetrics {
  total: number;
  attendedToday: number;
  onlineNow: number;
}

export interface TenantTodayAlert {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  employeeName?: string;
  employeeDepartment?: string;
  employeeProject?: string;
}

export interface TenantModuleNotification {
  id: string;
  module: string;
  type: string;
  count: number;
}

export interface TodayMeeting {
  id: string;
  time: string;
  title: string;
  location?: string;
  purpose?: string;
  type?: 'meeting' | 'birthday' | 'task';
  scheduledAt?: string;
  scheduledBy?: string;
  members?: string[];
}

export interface PendingApprovalItem {
  id: string;
  title: string;
  module: string;
  requestedBy: string;
  requestedAt: string;
  pendingDays: number;
  priority: 'high' | 'medium' | 'low';
}

export interface TodayCompanyProject {
  id: string;
  name: string;
  completedPercent: number;
  remainingPercent: number;
}

export const tenantProductivitySummary = {
  productivityPercent: 89,
  changeVsYesterday: 11
};

export const onSiteWorkforce: WorkforceMetrics = {
  total: 248,
  attendedToday: 211,
  onlineNow: 187
};

export const remoteWorkforce: WorkforceMetrics = {
  total: 156,
  attendedToday: 142,
  onlineNow: 118
};

export const tenantTodayAlerts: TenantTodayAlert[] = [
  {
    id: 'a1',
    message: 'Late clock-in',
    severity: 'warning',
    employeeName: 'Marcus Vance',
    employeeDepartment: 'Operations',
    employeeProject: 'HRMS'
  },
  {
    id: 'a2',
    message: 'Late clock-in',
    severity: 'warning',
    employeeName: 'Elena Rostova',
    employeeDepartment: 'Human Resources',
    employeeProject: 'Client portal'
  },
  {
    id: 'a3',
    message: 'Late clock-in',
    severity: 'warning',
    employeeName: 'Sarah Jenkins',
    employeeDepartment: 'Marketing',
    employeeProject: 'Analytics'
  },
  {
    id: 'a4',
    message: 'Unapproved leave request',
    severity: 'critical',
    employeeName: 'Rajesh Kumar',
    employeeDepartment: 'Engineering',
    employeeProject: 'Mobile app'
  },
  {
    id: 'a5',
    message: 'Unapproved leave request',
    severity: 'critical',
    employeeName: 'David Lee',
    employeeDepartment: 'Design',
    employeeProject: 'Watercraft'
  }
];

export const tenantModuleNotifications: TenantModuleNotification[] = [
  { id: 'n1', module: 'HRMS', type: 'Tasks', count: 5 },
  { id: 'n2', module: 'Attendance', type: 'Alerts', count: 3 },
  { id: 'n3', module: 'Payroll', type: 'Invoices', count: 2 },
  { id: 'n4', module: 'Projects', type: 'Updates', count: 4 },
  { id: 'n5', module: 'Requests', type: 'Approval', count: 6 }
];

export const todayMeetings: TodayMeeting[] = [
  {
    id: 'm1',
    time: '9:30 AM',
    title: 'Leadership standup',
    location: 'Board room A',
    purpose: 'Weekly sync and blockers',
    type: 'meeting',
    scheduledAt: 'Scheduled yesterday',
    scheduledBy: 'HR Admin',
    members: ['Alex', 'Sarah', 'John']
  },
  {
    id: 'm2',
    time: '11:00 AM',
    title: 'HRMS sprint review',
    location: 'Teams · Product',
    purpose: 'Demo new tenant dashboard',
    type: 'meeting',
    scheduledAt: 'Scheduled 2 days ago',
    scheduledBy: 'Tech Lead',
    members: ['Priya', 'David', '+4 others']
  },
  {
    id: 'b1',
    time: 'All Day',
    title: "Sarah Jenkins' Birthday",
    location: 'Office / Remote',
    purpose: 'Send wishes and celebrate',
    type: 'birthday',
    scheduledBy: 'System Auto'
  },
  {
    id: 't1',
    time: '2:00 PM',
    title: 'Review candidate profiles',
    purpose: 'Frontend Developer role (3 profiles)',
    type: 'task',
    scheduledAt: 'Scheduled today 9:00 AM',
    scheduledBy: 'Recruitment Team'
  },
  {
    id: 'm3',
    time: '4:30 PM',
    title: 'Vendor contract check-in',
    location: 'Zoom',
    purpose: 'Finalize Q3 terms',
    type: 'meeting',
    scheduledAt: 'Scheduled last week',
    scheduledBy: 'Finance Dept',
    members: ['Mike', 'Vendor Rep']
  }
];

export const pendingApprovalsToday: PendingApprovalItem[] = [
  {
    id: 'p1',
    title: 'Leave extension — Priya N.',
    module: 'Attendance',
    requestedBy: 'HR desk',
    requestedAt: 'Oct 24, 09:15 AM',
    pendingDays: 3,
    priority: 'high'
  },
  {
    id: 'p2',
    title: 'Purchase order #PO-8821',
    module: 'Finance',
    requestedBy: 'Procurement',
    requestedAt: 'Oct 25, 14:30 PM',
    pendingDays: 2,
    priority: 'high'
  },
  {
    id: 'p3',
    title: 'Role change — Backend team',
    module: 'People',
    requestedBy: 'Engineering lead',
    requestedAt: 'Oct 21, 11:00 AM',
    pendingDays: 6,
    priority: 'medium'
  },
  {
    id: 'p4',
    title: 'Overtime batch — Week 45',
    module: 'Payroll',
    requestedBy: 'Payroll ops',
    requestedAt: 'Oct 26, 16:45 PM',
    pendingDays: 1,
    priority: 'medium'
  }
];

export const todayCompanyProjects: TodayCompanyProject[] = [
  { id: 'pr1', name: 'selfwora', completedPercent: 72, remainingPercent: 28 },
  { id: 'pr2', name: 'Onevo customer mobile app', completedPercent: 54, remainingPercent: 46 },
  { id: 'pr3', name: 'selfwora web', completedPercent: 81, remainingPercent: 19 },
  { id: 'pr4', name: 'selfwora mobil app', completedPercent: 38, remainingPercent: 62 },
  { id: 'pr5', name: 'Onevo Admin application', completedPercent: 60, remainingPercent: 40 },
  { id: 'pr6', name: 'Watercraft', completedPercent: 90, remainingPercent: 10 }
];

export interface AttendanceTrendData {
  date: string;
  total: number;
  attended: number;
  leave: number;
}

export const attendanceTrendData: AttendanceTrendData[] = [
  { date: 'Mon', total: 404, attended: 380, leave: 24 },
  { date: 'Tue', total: 404, attended: 390, leave: 14 },
  { date: 'Wed', total: 404, attended: 385, leave: 19 },
  { date: 'Thu', total: 404, attended: 370, leave: 34 },
  { date: 'Fri', total: 404, attended: 350, leave: 54 },
  { date: 'Sat', total: 404, attended: 40, leave: 364 },
  { date: 'Sun', total: 404, attended: 45, leave: 359 }
];
