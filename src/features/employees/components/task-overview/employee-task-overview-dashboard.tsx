import React from 'react';
import { StickyNotesPanel } from './widgets/sticky-notes-panel';
import { WorkHoursPie } from './widgets/work-hours-pie';
import { TaskCastPie } from './widgets/task-cast-pie';
import { TodayPanel } from './widgets/today-panel';
import { NotificationSummaryBar } from './widgets/notification-summary-bar';
import { WeeklyTimelinePanel } from './widgets/weekly-timeline-panel';
import { YesterdayWorkPanel } from './widgets/yesterday-work-panel';

interface EmployeeTaskOverviewDashboardProps {
  onNavigateToTasks: () => void;
}

export const EmployeeTaskOverviewDashboard: React.FC<EmployeeTaskOverviewDashboardProps> = ({
  onNavigateToTasks
}) => {
  return (
    <div className="employee-task-overview" aria-label="Task overview dashboard">
      <StickyNotesPanel onOpenTasks={onNavigateToTasks} />
      <WorkHoursPie />
      <TaskCastPie />
      <TodayPanel />
      <NotificationSummaryBar />
      <YesterdayWorkPanel />
      <WeeklyTimelinePanel />
    </div>
  );
};
