import { executiveDashboard } from './executive-dashboard.data';
import type {
  ExecutiveAlertItem,
  ExecutiveModuleBadge,
  ExecutivePendingRequest,
  ExecutiveProjectGoal,
  ExecutiveScheduleEvent,
  ExecutiveWorkforceBreakdown
} from './executive-dashboard.data';

/** @deprecated Use executiveDashboard — kept for legacy widget imports */
export interface WorkforceMetrics {
  total: number;
  attendedToday: number;
  onlineNow: number;
  absent?: number;
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
  hasJoinLink?: boolean;
  isEvent?: boolean;
  context?: string;
  attendeesCount?: number;
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

export interface OverallAttendanceData {
  percent: number;
  present: number;
  total: number;
  changeVsYesterday: number;
}

function toWorkforceMetrics(slice: ExecutiveWorkforceBreakdown): WorkforceMetrics {
  return {
    total: slice.total,
    attendedToday: slice.attended,
    onlineNow: slice.onlineNow,
    absent: slice.absent
  };
}

function scheduleEventType(event: ExecutiveScheduleEvent): TodayMeeting['type'] {
  if (event.isEvent) return 'birthday';
  return 'meeting';
}

function mapScheduleEvent(event: ExecutiveScheduleEvent): TodayMeeting {
  const [purpose, location] = event.context.includes(' - ')
    ? event.context.split(' - ').map((part) => part.trim())
    : [event.context, undefined];

  return {
    id: event.id,
    time: event.time,
    title: event.title,
    purpose: purpose || event.context,
    location,
    type: scheduleEventType(event),
    hasJoinLink: event.hasJoinLink,
    isEvent: event.isEvent,
    context: event.context,
    attendeesCount: event.attendeesCount,
    members: event.attendeesCount ? Array.from({ length: event.attendeesCount }, (_, i) => `member-${i}`) : undefined
  };
}

function mapAlert(alert: ExecutiveAlertItem): TenantTodayAlert {
  return {
    id: alert.id,
    message: alert.type,
    severity: 'warning',
    employeeName: alert.employee,
    employeeDepartment: alert.department
  };
}

function mapModuleBadge(badge: ExecutiveModuleBadge): TenantModuleNotification {
  const [module, ...typeParts] = badge.name.split(' ');
  return {
    id: badge.id,
    module: module ?? badge.name,
    type: typeParts.join(' ') || 'Updates',
    count: badge.badgeCount
  };
}

function mapPendingRequest(item: ExecutivePendingRequest): PendingApprovalItem {
  const request =
    item.requester === item.department ? item.category : `${item.category} — ${item.requester}`;

  return {
    id: item.id,
    request,
    category: item.department,
    requestedBy: item.requester,
    requestedAt: item.timestamp,
    pendingDays: item.daysPending,
    pendingEmphasis: item.daysPending >= 3
  };
}

function mapProjectGoal(project: ExecutiveProjectGoal): TodayCompanyProject {
  const remaining = Math.max(0, 100 - project.progressPercent);
  return {
    id: project.id,
    name: project.name,
    completedPercent: project.progressPercent,
    remainingPercent: remaining
  };
}

export { executiveDashboard };

export const overallAttendance: OverallAttendanceData = {
  percent: executiveDashboard.kpiSummary.attendancePercentage,
  present: executiveDashboard.kpiSummary.presentToday,
  total: executiveDashboard.kpiSummary.totalEmployees,
  changeVsYesterday: 4
};

export const onSiteWorkforce = toWorkforceMetrics(executiveDashboard.attendanceBreakdown.onSite);
export const remoteWorkforce = toWorkforceMetrics(executiveDashboard.attendanceBreakdown.remote);

export const tenantTodayAlerts = executiveDashboard.companyAlerts.items
  .filter((item) => !item.resolved)
  .map(mapAlert);

export const tenantModuleNotifications = executiveDashboard.moduleBadges.map(mapModuleBadge);

export const todayMeetings = executiveDashboard.schedule.events.map(mapScheduleEvent);

export const scheduleTotalToday = executiveDashboard.schedule.totalToday;

export const pendingApprovalsToday = executiveDashboard.pendingRequests.items.map(mapPendingRequest);

export const todayCompanyProjects = executiveDashboard.projectGoals.projects.map(mapProjectGoal);

/** @deprecated Legacy exports */
export const tenantProductivitySummary = {
  productivityPercent: executiveDashboard.kpiSummary.attendancePercentage,
  changeVsYesterday: 4
};

export const pendingOwnerApprovals = pendingApprovalsToday;

export interface AttentionItem {
  id: string;
  value: number;
  title: string;
  hint: string;
  severity: 'critical' | 'warning' | 'neutral' | 'info';
}

export const attentionItems: AttentionItem[] = [];

export interface HealthGaugeData {
  centerValue: number;
  centerLabel: string;
  segments: { label: string; value: number; percent: number; color: string }[];
}

export const projectDeliveryHealth: HealthGaugeData = {
  centerValue: 0,
  centerLabel: 'Projects',
  segments: []
};

export const hiringRetention: HealthGaugeData = {
  centerValue: 0,
  centerLabel: 'Total',
  segments: []
};

export interface AttendanceTrendData {
  date: string;
  total: number;
  attended: number;
  leave: number;
}

export const attendanceTrendData: AttendanceTrendData[] = [];
