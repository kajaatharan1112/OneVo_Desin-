import React from 'react';
import { useWorkDashboard } from '../../hooks/use-work-dashboard';
import { ProfilePanel } from './panels/profile-panel';
import { ReminderPanel } from './panels/reminder-panel';
import { SprintPlanPanel } from './panels/sprint-plan-panel';
import { TaskHourPanel } from './panels/task-hour-panel';
import { TodayTasksPanel } from './panels/today-tasks-panel';
import { WorkHourPanel } from './panels/work-hour-panel';
import { YesterdayStatusPanel } from './panels/yesterday-status-panel';
import './work-dashboard.css';

export const WorkDashboard: React.FC = () => {
  const {
    todayTasks,
    todayHighlight,
    workHours,
    taskHours,
    reminders,
    profileSnapshot,
    yesterdayItems,
    yesterdayHighlight,
    sprintPlan
  } = useWorkDashboard();

  return (
    <div className="work-dashboard" aria-label="Employee work dashboard">
      <TodayTasksPanel tasks={todayTasks} highlight={todayHighlight} />
      <ProfilePanel snapshot={profileSnapshot} />
      <WorkHourPanel data={workHours} />
      <TaskHourPanel data={taskHours} />
      <ReminderPanel items={reminders} />
      <YesterdayStatusPanel items={yesterdayItems} highlight={yesterdayHighlight} />
      <SprintPlanPanel days={sprintPlan} />
    </div>
  );
};
