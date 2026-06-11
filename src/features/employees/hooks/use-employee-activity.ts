import { useMemo } from 'react';
import { employeeActivityData } from '../data/employee-activity.data';
import type { WeeklyPatternDay } from '../types/employee-activity.types';
import {
  getWorkHoursRingStyle,
  getWorkHoursStackSegments,
  getWorkHoursStatItems
} from '../utils/activity-work-hours-display.utils';

const ALERTS_VISIBLE_MAX = 3;
const TIMELINE_VISIBLE_MAX = 6;

function getWeeklyInsight(days: WeeklyPatternDay[]): string {
  const office = days.filter((day) => day.status === 'Office').length;
  const remote = days.filter((day) => day.status === 'Remote').length;

  return `${office} office day${office === 1 ? '' : 's'} · ${remote} remote day${remote === 1 ? '' : 's'}`;
}

export function useEmployeeActivity() {
  const {
    clockStatus,
    workHours,
    attendanceInsight,
    focusBreak,
    timeline,
    weeklyPattern,
    alerts,
    quickActions
  } = employeeActivityData;

  const visibleAlerts = useMemo(() => alerts.slice(0, ALERTS_VISIBLE_MAX), [alerts]);
  const visibleTimeline = useMemo(() => timeline.slice(0, TIMELINE_VISIBLE_MAX), [timeline]);
  const weeklyInsight = useMemo(() => getWeeklyInsight(weeklyPattern), [weeklyPattern]);

  const focusBreakTotal = useMemo(
    () => focusBreak.focusHours + focusBreak.meetingHours + focusBreak.breakHours,
    [focusBreak]
  );

  const workHoursStackSegments = useMemo(() => getWorkHoursStackSegments(workHours), [workHours]);
  const workHoursStatItems = useMemo(() => getWorkHoursStatItems(workHours), [workHours]);
  const workHoursRingStyle = useMemo(
    () => getWorkHoursRingStyle(workHours.completedPercent),
    [workHours.completedPercent]
  );

  return {
    clockStatus,
    workHours,
    workHoursStackSegments,
    workHoursStatItems,
    workHoursRingStyle,
    attendanceInsight,
    focusBreak,
    focusBreakTotal,
    timeline: visibleTimeline,
    weeklyPattern,
    weeklyInsight,
    alerts: visibleAlerts,
    quickActions
  };
}
