export interface ExecutiveDashboardMeta {
  organizationName: string;
  currentView: string;
  currentUser: {
    name: string;
    role: string;
    avatarUrl: string;
  };
  systemDate: string;
  unreadNotificationsCount: number;
}

export interface ExecutiveKpiSummary {
  totalEmployees: number;
  presentToday: number;
  attendancePercentage: number;
}

export interface ExecutiveWorkforceBreakdown {
  total: number;
  onlineNow: number;
  attended: number;
  absent: number;
}

export interface ExecutiveAlertItem {
  id: string;
  type: string;
  employee: string;
  department: string;
  resolved: boolean;
}

export interface ExecutiveModuleBadge {
  id: string;
  name: string;
  badgeCount: number;
}

export interface ExecutiveScheduleEvent {
  id: string;
  time: string;
  title: string;
  context: string;
  attendeesCount?: number;
  hasJoinLink?: boolean;
  isEvent?: boolean;
}

export interface ExecutivePendingRequest {
  id: string;
  category: string;
  requester: string;
  department: string;
  timestamp: string;
  daysPending: number;
}

export interface ExecutiveProjectGoal {
  id: string;
  name: string;
  progressPercent: number;
}

export interface ExecutiveDashboardSpec {
  dashboardId: string;
  meta: ExecutiveDashboardMeta;
  kpiSummary: ExecutiveKpiSummary;
  attendanceBreakdown: {
    title: string;
    onSite: ExecutiveWorkforceBreakdown;
    remote: ExecutiveWorkforceBreakdown;
  };
  companyAlerts: {
    title: string;
    alertsCount: number;
    items: ExecutiveAlertItem[];
  };
  moduleBadges: ExecutiveModuleBadge[];
  schedule: {
    title: string;
    totalToday: number;
    events: ExecutiveScheduleEvent[];
  };
  pendingRequests: {
    title: string;
    items: ExecutivePendingRequest[];
  };
  projectGoals: {
    title: string;
    projects: ExecutiveProjectGoal[];
  };
}

export const executiveDashboard: ExecutiveDashboardSpec = {
  dashboardId: 'dash_exec_001',
  meta: {
    organizationName: 'OneVo',
    currentView: 'Executive View',
    currentUser: {
      name: 'Marcus Chen',
      role: 'Chief Executive Officer',
      avatarUrl: 'https://assets.onevo.com/profiles/marcus_chen.jpg'
    },
    systemDate: '2025-11-12T00:00:00Z',
    unreadNotificationsCount: 6
  },
  kpiSummary: {
    totalEmployees: 404,
    presentToday: 353,
    attendancePercentage: 87
  },
  attendanceBreakdown: {
    title: 'Overall Today Attendance',
    onSite: { total: 248, onlineNow: 187, attended: 211, absent: 37 },
    remote: { total: 156, onlineNow: 118, attended: 142, absent: 14 }
  },
  companyAlerts: {
    title: 'Company Alerts',
    alertsCount: 5,
    items: [
      { id: 'alt_01', type: 'Late clock-in', employee: 'Marcus Vance', department: 'Operations', resolved: false },
      { id: 'alt_02', type: 'Late clock-in', employee: 'Elena Rostova', department: 'HRMS', resolved: false },
      { id: 'alt_03', type: 'Late clock-in', employee: 'Sarah Jenkins', department: 'Finance', resolved: false },
      { id: 'alt_04', type: 'Missed check-out', employee: 'Arjun Sethi', department: 'Engineering', resolved: false },
      { id: 'alt_05', type: 'Late clock-in', employee: 'Neha Kapoor', department: 'Payroll', resolved: false }
    ]
  },
  moduleBadges: [
    { id: 'mod_01', name: 'HRMS Tasks', badgeCount: 5 },
    { id: 'mod_02', name: 'Attendance Alerts', badgeCount: 3 },
    { id: 'mod_03', name: 'Payroll Invoices', badgeCount: 2 },
    { id: 'mod_04', name: 'Projects Updates', badgeCount: 4 },
    { id: 'mod_05', name: 'Requests Approval', badgeCount: 6 }
  ],
  schedule: {
    title: 'Schedule',
    totalToday: 5,
    events: [
      {
        id: 'evt_01',
        time: '09:30 AM',
        title: 'Leadership standup',
        context: 'Weekly sync - Board room A',
        attendeesCount: 3
      },
      {
        id: 'evt_02',
        time: '11:00 AM',
        title: 'HRMS sprint review',
        context: 'Demo new tenant dashboard - Microsoft Teams',
        hasJoinLink: true
      },
      {
        id: 'evt_03',
        time: 'All Day',
        title: "Sarah Jenkins' Birthday",
        context: 'Office / Remote',
        isEvent: true
      },
      {
        id: 'evt_04',
        time: '02:00 PM',
        title: 'Payroll reconciliation',
        context: 'Monthly close - Finance wing',
        attendeesCount: 1
      }
    ]
  },
  pendingRequests: {
    title: 'Pending Requests',
    items: [
      {
        id: 'req_01',
        category: 'Leave extension',
        requester: 'Priya N.',
        department: 'Attendance - HR desk',
        timestamp: 'Today, 9:15 AM',
        daysPending: 3
      },
      {
        id: 'req_02',
        category: 'Purchase order #PO-8821',
        requester: 'Finance - Procurement',
        department: 'Finance - Procurement',
        timestamp: 'Yesterday, 2:30 PM',
        daysPending: 2
      }
    ]
  },
  projectGoals: {
    title: "Today's Goals",
    projects: [
      { id: 'prj_01', name: 'Selfwora', progressPercent: 72 },
      { id: 'prj_02', name: 'OneVo Customer Mobile App', progressPercent: 65 },
      { id: 'prj_03', name: 'Watercraft', progressPercent: 81 },
      { id: 'prj_04', name: 'Athvo Client Core', progressPercent: 88 },
      { id: 'prj_05', name: 'Bubble Mobile', progressPercent: 48 },
      { id: 'prj_06', name: 'OneVo HRMS', progressPercent: 72 }
    ]
  }
};
