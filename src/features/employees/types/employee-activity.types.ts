export type ActivityTimelineStatus = 'Completed' | 'Pending' | 'Upcoming';

export type WeeklyDayStatus = 'Office' | 'Remote' | 'Off' | 'Leave';

export type PunctualityChip = 'on-time' | 'late' | 'remote';

export type ActivityAlertType = 'warning' | 'info' | 'success';

export interface ActivityEmployeeContext {
  name: string;
  role: string;
  department: string;
  date: string;
}

export interface ActivityClockStatus {
  clockIn: string;
  punctuality: PunctualityChip;
  currentStatus: string;
  mode: 'Office' | 'Remote';
  workedSoFar: string;
  targetCheckout: string;
}

export interface ActivityWorkHoursSegments {
  workedHours: number;
  breakHours: number;
  remainingHours: number;
  expectedHours: number;
}

export interface ActivityWorkHoursSummary {
  expected: string;
  completed: string;
  remaining: string;
  breakDuration: string;
  completedPercent: number;
  segments: ActivityWorkHoursSegments;
}

export interface ActivityAttendanceInsight {
  onTimeDays: number;
  workDaysThisWeek: number;
  todayMode: string;
  pendingCorrections: number;
  weeklyAvgHours: string;
}

export interface ActivityFocusBreakBalance {
  focusHours: number;
  meetingHours: number;
  breakHours: number;
}

export interface ActivityTimelineItem {
  id: string;
  time: string;
  title: string;
  detail: string;
  status: ActivityTimelineStatus;
}

export interface WeeklyPatternDay {
  day: string;
  status: WeeklyDayStatus;
}

export interface ActivityAlert {
  id: string;
  title: string;
  type: ActivityAlertType;
}

export interface EmployeeActivityData {
  employee: ActivityEmployeeContext;
  clockStatus: ActivityClockStatus;
  workHours: ActivityWorkHoursSummary;
  attendanceInsight: ActivityAttendanceInsight;
  focusBreak: ActivityFocusBreakBalance;
  timeline: ActivityTimelineItem[];
  weeklyPattern: WeeklyPatternDay[];
  alerts: ActivityAlert[];
  quickActions: string[];
}
