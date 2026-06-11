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
  request: string;
  category: string;
  requestedBy: string;
  requestedAt: string;
  pendingDays: number;
  pendingEmphasis?: boolean;
}

export interface TodayCompanyProject {
  id: string;
  name: string;
  completedPercent: number;
  remainingPercent: number;
}

export interface AttentionItem {
  id: string;
  value: number;
  title: string;
  hint: string;
  severity: 'critical' | 'warning' | 'neutral' | 'info';
}

export interface HealthGaugeSegment {
  label: string;
  value: number;
  percent: number;
  color: string;
}

export interface HealthGaugeData {
  centerValue: number;
  centerLabel: string;
  segments: HealthGaugeSegment[];
}

export interface OverallAttendanceData {
  percent: number;
  present: number;
  total: number;
  changeVsYesterday: number;
}

export const overallAttendance: OverallAttendanceData = {
  percent: 87,
  present: 353,
  total: 404,
  changeVsYesterday: 4
};

export const attentionItems: AttentionItem[] = [
  {
    id: 'deadline-risks',
    value: 4,
    title: 'Project deadline risks',
    hint: 'Due within 7 days',
    severity: 'critical'
  },
  {
    id: 'leave-approvals',
    value: 6,
    title: 'Leave approvals pending',
    hint: 'Awaiting owner sign-off',
    severity: 'warning'
  },
  {
    id: 'low-productivity',
    value: 5,
    title: 'Low productivity teams',
    hint: 'Below 80% target this week',
    severity: 'neutral'
  },
  {
    id: 'missing-documents',
    value: 7,
    title: 'Employee documents missing',
    hint: 'ID, contract, or compliance',
    severity: 'info'
  }
];

export const projectDeliveryHealth: HealthGaugeData = {
  centerValue: 14,
  centerLabel: 'Projects',
  segments: [
    { label: 'On track', value: 9, percent: 64, color: '#2563eb' },
    { label: 'At risk', value: 3, percent: 21, color: '#f59e0b' },
    { label: 'Delayed', value: 2, percent: 14, color: '#ef4444' }
  ]
};

export const hiringRetention: HealthGaugeData = {
  centerValue: 6,
  centerLabel: 'Total',
  segments: [
    { label: 'Interviews', value: 12, percent: 55, color: '#2563eb' },
    { label: 'Offers', value: 3, percent: 14, color: '#3b82f6' },
    { label: 'Notice period', value: 4, percent: 31, color: '#ef4444' }
  ]
};

export const pendingOwnerApprovals: PendingApprovalItem[] = [
  {
    id: 'p1',
    request: 'Leave extension approval',
    category: 'Attendance',
    requestedBy: 'Priya N. · HR desk',
    requestedAt: 'Oct 24, 09:15 AM',
    pendingDays: 3,
    pendingEmphasis: true
  },
  {
    id: 'p2',
    request: 'Purchase order approval',
    category: 'Finance',
    requestedBy: 'Arjun S. · Procurement',
    requestedAt: 'Oct 25, 02:30 PM',
    pendingDays: 2
  },
  {
    id: 'p3',
    request: 'Salary revision approval',
    category: 'Finance',
    requestedBy: 'Neha K. · Finance',
    requestedAt: 'Oct 25, 04:10 PM',
    pendingDays: 2
  }
];

/** @deprecated Legacy data — kept for backward compatibility */
export const tenantProductivitySummary = {
  productivityPercent: 87,
  changeVsYesterday: 4
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
  }
];

export const tenantModuleNotifications: TenantModuleNotification[] = [
  { id: 'n1', module: 'HRMS', type: 'Tasks', count: 5 }
];

export const todayMeetings: TodayMeeting[] = [];

export const pendingApprovalsToday: PendingApprovalItem[] = pendingOwnerApprovals;

export const todayCompanyProjects: TodayCompanyProject[] = [];

export interface AttendanceTrendData {
  date: string;
  total: number;
  attended: number;
  leave: number;
}

export const attendanceTrendData: AttendanceTrendData[] = [];
