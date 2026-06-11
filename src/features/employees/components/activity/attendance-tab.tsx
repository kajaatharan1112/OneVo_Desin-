import React from 'react';
import { useAttendanceTab } from '../../hooks/use-attendance-tab';
import { AttendanceClockStatusCard } from './attendance-clock-status-card';
import { AttendanceFocusBreakAlertsCard } from './attendance-focus-break-alerts-card';
import { AttendanceInsightCard } from './attendance-insight-card';
import { AttendanceQuickActionsBar } from './attendance-quick-actions-bar';
import { AttendanceTimelineCard } from './attendance-timeline-card';
import { AttendanceWeeklyPatternCard } from './attendance-weekly-pattern-card';
import { AttendanceWorkHoursCard } from './attendance-work-hours-card';

export const AttendanceTab: React.FC = () => {
  const {
    isLoading,
    clockStatus,
    workHours,
    attendanceInsight,
    timeline,
    timelineCount,
    weeklyPattern,
    weeklyPatternCount,
    weeklyPatternTotals,
    breakSessions,
    focusBlocks,
    alerts,
    quickActions
  } = useAttendanceTab();

  return (
    <div className="attendance-tab" aria-label="Attendance dashboard">
      <AttendanceClockStatusCard status={clockStatus} />

      <AttendanceWorkHoursCard summary={workHours} />

      <AttendanceInsightCard insight={attendanceInsight} />

      <AttendanceTimelineCard
        events={timeline}
        isLoading={isLoading}
        isEmpty={!isLoading && timelineCount === 0}
      />

      <AttendanceWeeklyPatternCard
        days={weeklyPattern}
        totals={weeklyPatternTotals}
        isLoading={isLoading}
        isEmpty={!isLoading && weeklyPatternCount === 0}
      />

      <AttendanceFocusBreakAlertsCard
        breakSessions={breakSessions}
        focusBlocks={focusBlocks}
        alerts={alerts}
      />

      <AttendanceQuickActionsBar
        actions={quickActions}
        className="attendance-tab__quick-bar"
      />
    </div>
  );
};
