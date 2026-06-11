import { useEffect, useState } from 'react';
import {
  attendanceAlerts,
  attendanceBreakSessions,
  attendanceClockStatus,
  attendanceFocusBlocks,
  attendanceInsight,
  attendanceQuickActions,
  attendanceTimeline,
  attendanceWeeklyPattern,
  attendanceWeeklyPatternTotals,
  attendanceWorkHours
} from '../data/attendance-tab.mock';

const LOAD_DELAY_MS = 350;

export function useAttendanceTab() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timerId = window.setTimeout(() => setIsLoading(false), LOAD_DELAY_MS);
    return () => window.clearTimeout(timerId);
  }, []);

  return {
    isLoading,
    clockStatus: attendanceClockStatus,
    workHours: attendanceWorkHours,
    attendanceInsight,
    timeline: attendanceTimeline,
    timelineCount: attendanceTimeline.length,
    weeklyPattern: attendanceWeeklyPattern,
    weeklyPatternCount: attendanceWeeklyPattern.length,
    weeklyPatternTotals: attendanceWeeklyPatternTotals,
    breakSessions: attendanceBreakSessions,
    focusBlocks: attendanceFocusBlocks,
    alerts: attendanceAlerts,
    quickActions: attendanceQuickActions
  };
}
