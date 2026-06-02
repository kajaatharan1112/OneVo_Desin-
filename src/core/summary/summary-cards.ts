import type { SummaryCardData } from '../../shared/types/summary-card.types';
import { employeeGoalsSummary } from '../../features/employees/data/employee-goals.data';
import { tenantProductivitySummary } from '../../features/tenant/data/tenant-today-productivity.data';

export const employeeSummaryCards: SummaryCardData[] = [
  {
    id: 'task-overview',
    title: 'Task Overview',
    value: '12 / 15 ',
    desc: 'Sprint completed · 8 notifications',
    color: 'var(--accent)'
  },
  {
    id: 'requests-approval',
    title: 'Request & Approval',
    value: '24 received',
    desc: '7 pending approval',
    color: 'var(--accent)'
  },
  {
    id: 'activity',
    title: 'Activity',
    value: '8 leaves left',
    desc: 'Clock in today: 9:15 AM',
    color: 'var(--accent)'
  },
  {
    id: 'goals',
    title: 'Goals',
    value: `${employeeGoalsSummary.activePlans} plans · ${employeeGoalsSummary.activeGoals} goals`,
    desc: `${employeeGoalsSummary.achievementsCount} achievements · ${employeeGoalsSummary.decisionsCount} decisions`,
    color: 'var(--accent)'
  }
];

export const tenantSummaryCards: SummaryCardData[] = [
  {
    id: 'today-productivity',
    title: 'Today',
    value: `Productivity ${tenantProductivitySummary.productivityPercent}%`,
    desc: `${tenantProductivitySummary.changeVsYesterday}% higher than yesterday`,
    color: 'var(--accent)'
  },
  {
    id: 'ongoing-projects',
    title: 'This week',
    value: 'Productivity 79%',
    desc: '2 days remaining',
    color: '#3b82f6'
  },
  {
    id: 'total-revenue',
    title: 'Monthly Review',
    value: '12 Goals Achieved',
    desc: 'Performance review',
    color: '#10b981'
  },
  {
    id: 'open-requests',
    title: 'Open Requests',
    value: '14',
    desc: 'Require system review',
    color: '#f59e0b'
  }
];

export function getSummaryCardsForView(view: 'employee' | 'tenant'): SummaryCardData[] {
  return view === 'tenant' ? tenantSummaryCards : employeeSummaryCards;
}
