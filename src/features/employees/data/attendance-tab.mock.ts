export type AttendancePunctuality = 'on-time' | 'late' | 'remote';

export interface AttendanceQuickAction {
  id: string;
  label: string;
}

export interface AttendanceClockStatus {
  clockIn: string;
  currentStatus: string;
  mode: string;
  targetCheckout: string;
  punctuality: AttendancePunctuality;
  dayProgressPercent: number;
  breakTaken: string;
  lunchDuration: string;
  workingSince: string;
}

export interface AttendanceWorkHoursSummary {
  expected: string;
  completed: string;
  remaining: string;
  breakDuration: string;
  completedPercent: number;
}

export interface AttendanceInsight {
  onTimeThisWeek: string;
  todayMode: string;
  weeklyAvgHours: string;
  pendingCorrections: number;
  avgCheckIn: string;
  attendanceRate: string;
}

export interface AttendanceTimelineEvent {
  id: string;
  time: string;
  title: string;
}

export type AttendanceDayMode = 'Office' | 'Remote';

export interface AttendanceWeeklyDay {
  day: string;
  mode: AttendanceDayMode;
  loggedHours: string;
}

export interface AttendanceWeeklyPatternTotals {
  summary: string;
  totalLabel: string;
}

export type AttendanceAlertTone = 'warning' | 'info' | 'success';

/** Canonical worked-today — home: Work Hours Summary donut only. */
export const ATTENDANCE_WORKED_TODAY = '4h 30m';
export const ATTENDANCE_BREAK_TODAY = '1h';
export const ATTENDANCE_REMAINING_TODAY = '3h 30m';
export const ATTENDANCE_EXPECTED_TODAY = '8h';

export interface AttendanceAlert {
  id: string;
  message: string;
  tone: AttendanceAlertTone;
}

export interface AttendanceBreakSession {
  id: string;
  label: string;
  timeRange: string;
  duration: string;
}

export interface AttendanceFocusBlock {
  id: string;
  label: string;
  timeRange: string;
  status: 'done' | 'now' | 'next';
}

export const attendanceClockStatus: AttendanceClockStatus = {
  clockIn: '9:15 AM',
  currentStatus: 'Working',
  mode: 'Office',
  targetCheckout: '6:00 PM',
  punctuality: 'on-time',
  dayProgressPercent: 56,
  breakTaken: ATTENDANCE_BREAK_TODAY,
  lunchDuration: '45m',
  workingSince: '1:45 PM'
};

export const attendanceWorkHours: AttendanceWorkHoursSummary = {
  expected: ATTENDANCE_EXPECTED_TODAY,
  completed: ATTENDANCE_WORKED_TODAY,
  remaining: ATTENDANCE_REMAINING_TODAY,
  breakDuration: ATTENDANCE_BREAK_TODAY,
  completedPercent: 56
};

export const attendanceInsight: AttendanceInsight = {
  onTimeThisWeek: '5/5',
  todayMode: 'Office',
  weeklyAvgHours: '7h 45m',
  pendingCorrections: 1,
  avgCheckIn: '9:12 AM',
  attendanceRate: '100%'
};

export const attendanceTimeline: AttendanceTimelineEvent[] = [
  { id: 'tl-1', time: '9:15 AM', title: 'Checked in' },
  { id: 'tl-2', time: '11:00 AM', title: 'Break start' },
  { id: 'tl-3', time: '11:15 AM', title: 'Break end' },
  { id: 'tl-4', time: '1:00 PM', title: 'Lunch out' },
  { id: 'tl-5', time: '1:45 PM', title: 'Lunch in' },
  { id: 'tl-6', time: '3:30 PM', title: 'Short break start' },
  { id: 'tl-7', time: '3:45 PM', title: 'Short break end' },
  { id: 'tl-8', time: '5:00 PM', title: 'Final checkout prep' }
];

export const attendanceWeeklyPattern: AttendanceWeeklyDay[] = [
  { day: 'Mon', mode: 'Office', loggedHours: '8h' },
  { day: 'Tue', mode: 'Remote', loggedHours: '7h 30m' },
  { day: 'Wed', mode: 'Office', loggedHours: '8h 15m' },
  { day: 'Thu', mode: 'Office', loggedHours: '7h 45m' },
  { day: 'Fri', mode: 'Remote', loggedHours: '7h 15m' }
];

export const attendanceWeeklyPatternTotals: AttendanceWeeklyPatternTotals = {
  summary: '3 office · 2 remote',
  totalLabel: '38h 45m total'
};

export const attendanceBreakSessions: AttendanceBreakSession[] = [
  { id: 'break-1', label: 'Short break', timeRange: '11:00–11:15 AM', duration: '15m' },
  { id: 'break-2', label: 'Lunch', timeRange: '1:00–1:45 PM', duration: '45m' }
];

export const attendanceFocusBlocks: AttendanceFocusBlock[] = [
  { id: 'focus-1', label: 'Deep work — sprint tasks', timeRange: '9:30–11:00 AM', status: 'done' },
  { id: 'focus-2', label: 'Feature delivery block', timeRange: '1:45–3:30 PM', status: 'done' },
  { id: 'focus-3', label: 'Wrap-up & daily logs', timeRange: '4:00–5:00 PM', status: 'next' }
];

export const attendanceAlerts: AttendanceAlert[] = [
  { id: 'alert-1', message: 'Checkout reminder at 5:45 PM', tone: 'warning' },
  { id: 'alert-2', message: 'No late check-ins this week', tone: 'success' },
  { id: 'alert-3', message: 'Next focus block starts 4:00 PM', tone: 'info' },
  { id: 'alert-4', message: '1h break used · within daily limit', tone: 'success' }
];

export const attendanceQuickActions: AttendanceQuickAction[] = [
  { id: 'attendance-sheet', label: 'View Attendance Sheet' },
  { id: 'apply-leave', label: 'Apply Leave' },
  { id: 'submit-correction', label: 'Submit Correction' },
  { id: 'download-timesheet', label: 'Download Timesheet' }
];
