import {
  workDashboardProfileSnapshot,
  workDashboardReminders,
  workDashboardSprintPlan,
  workDashboardSummary,
  workDashboardTaskHours,
  workDashboardTodayHighlight,
  workDashboardTodayTasks,
  workDashboardWorkHours,
  workDashboardYesterdayHighlight,
  workDashboardYesterdayItems
} from '../data/work-dashboard.data';

export function useWorkDashboard() {
  return {
    summary: workDashboardSummary,
    todayTasks: workDashboardTodayTasks,
    todayHighlight: workDashboardTodayHighlight,
    workHours: workDashboardWorkHours,
    taskHours: workDashboardTaskHours,
    reminders: workDashboardReminders,
    profileSnapshot: workDashboardProfileSnapshot,
    yesterdayItems: workDashboardYesterdayItems,
    yesterdayHighlight: workDashboardYesterdayHighlight,
    sprintPlan: workDashboardSprintPlan
  };
}
