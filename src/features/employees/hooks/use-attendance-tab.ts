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

function formatElapsedDisplay(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

export function useAttendanceTab() {
  const [isLoading, setIsLoading] = useState(true);
  const { selectedEmployee } = useEmployeeContext();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [, setClockInTime] = useState<number | null>(null);
  const [liveHoursStr, setLiveHoursStr] = useState('0s');
  const [livePercent, setLivePercent] = useState(0);

  const formatClockInTime = (timestamp: number | null) => {
    if (!timestamp) return '--';
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${strMinutes} ${ampm}`;
  };

  const [effectiveClockInTime, setEffectiveClockInTime] = useState<number | null>(null);

  useEffect(() => {
    const timerId = window.setTimeout(() => setIsLoading(false), LOAD_DELAY_MS);
    return () => window.clearTimeout(timerId);
  }, []);

  useEffect(() => {
    const storageKeyStatus = `clock_in_status_${selectedEmployee.id}`;
    const storageKeyTime = `clock_in_time_${selectedEmployee.id}`;

    const updateState = () => {
      const active = localStorage.getItem(storageKeyStatus) === 'true';
      const timeVal = localStorage.getItem(storageKeyTime);
      const parsedTime = timeVal ? parseInt(timeVal, 10) : null;
      setIsClockedIn(active);
      setClockInTime(parsedTime);

      if (active && parsedTime) {
        setEffectiveClockInTime(parsedTime);
        const diffMs = Date.now() - parsedTime;
        const elapsedSecs = Math.max(0, Math.floor(diffMs / 1000));

        setLiveHoursStr(formatElapsedDisplay(elapsedSecs));
        const expectedSeconds = 28800; // 8h
        const percent = Math.min(100, Math.round((elapsedSecs / expectedSeconds) * 100));
        setLivePercent(percent);
      } else {
        const lastTimeVal = localStorage.getItem(`last_clock_in_time_${selectedEmployee.id}`);
        const lastElapsedVal = localStorage.getItem(`last_elapsed_secs_${selectedEmployee.id}`);

        if (lastTimeVal) {
          setEffectiveClockInTime(parseInt(lastTimeVal, 10));
        } else {
          setEffectiveClockInTime(null);
        }

        if (lastElapsedVal) {
          const lastElapsedSecs = parseInt(lastElapsedVal, 10);
          setLiveHoursStr(formatElapsedDisplay(lastElapsedSecs));
          const expectedSeconds = 28800; // 8h
          const percent = Math.min(100, Math.round((lastElapsedSecs / expectedSeconds) * 100));
          setLivePercent(percent);
        } else {
          setLiveHoursStr(attendanceWorkHours.completed);
          setLivePercent(attendanceWorkHours.completedPercent);
        }
      }
    };

    updateState();
    const interval = setInterval(updateState, 1000);

    const handleClockInChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.employeeId === selectedEmployee.id) {
        setIsClockedIn(customEvent.detail.isClockedIn);
        setClockInTime(customEvent.detail.clockInTime);
      } else {
        updateState();
      }
    };

    window.addEventListener('clock_in_change', handleClockInChange);
    window.addEventListener('storage', updateState);

    return () => {
      clearInterval(interval);
      window.removeEventListener('clock_in_change', handleClockInChange);
      window.removeEventListener('storage', updateState);
    };
  }, [selectedEmployee.id]);

  const dynamicClockStatus = {
    ...attendanceClockStatus,
    clockIn: effectiveClockInTime ? formatClockInTime(effectiveClockInTime) : attendanceClockStatus.clockIn,
    currentStatus: isClockedIn ? 'Working' : 'Clocked Out',
    mode: attendanceClockStatus.mode,
    workingSince: effectiveClockInTime ? formatClockInTime(effectiveClockInTime) : attendanceClockStatus.workingSince,
    dayProgressPercent: livePercent,
  };

  const dynamicWorkHours = {
    ...attendanceWorkHours,
    completed: liveHoursStr,
    completedPercent: livePercent,
  };

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
