import type { SummaryCardData } from '../../shared/types/summary-card.types';
import { getEmployeeData } from '../../features/employees/data/employee-data.registry';
import type { EmployeeId } from '../../features/employees/types/employee.types';
import { tenantProductivitySummary } from '../../features/tenant/data/tenant-today-productivity.data';

export function getEmployeeSummaryCards(): SummaryCardData[] {
  const { summaryCards, goalsSummary } = getEmployeeData('alex');

  return [
    {
      id: 'task-overview',
      title: 'Task Overview',
      value: summaryCards.taskOverviewValue,
      desc: summaryCards.taskOverviewDesc,
      color: 'var(--accent)',
      variant: 'employee'
    },
    {
      id: 'requests-approval',
      title: 'Request & Approval',
      value: summaryCards.requestsValue,
      desc: summaryCards.requestsDesc,
      color: 'var(--accent)',
      variant: 'employee'
    },
    {
      id: 'activity',
      title: 'Activity',
      value: summaryCards.activityValue,
      desc: summaryCards.activityDesc,
      color: 'var(--accent)',
      variant: 'employee'
    },
    {
      id: 'goals',
      title: 'Goals',
      value: `${goalsSummary.activePlans} plans · ${goalsSummary.activeGoals} goals`,
      desc: `${goalsSummary.achievementsCount} achievements · ${goalsSummary.decisionsCount} decisions`,
      color: 'var(--accent)',
      variant: 'employee'
    }
  ];
}

export function getCeoSummaryCards(): SummaryCardData[] {
  const { ceoSummaryCards } = getEmployeeData('marcus');

  return (ceoSummaryCards ?? []).map((card) => ({
    id: card.id,
    title: card.title,
    value: card.value,
    desc: card.desc,
    delta: card.delta,
    status: card.status,
    color: card.color,
    actionLabel: card.actionLabel,
    actionTab: card.actionTab,
    variant: 'ceo' as const
  }));
}

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
    title: 'Annual Analytics and Goals',
    value: '14',
    desc: 'Require system review',
    color: '#f59e0b'
  }
];

export function getSummaryCardsForView(
  view: 'employee' | 'tenant',
  employeeId: EmployeeId = 'alex'
): SummaryCardData[] {
  if (view === 'tenant') {
    return tenantSummaryCards;
  }

  return employeeId === 'marcus' ? getCeoSummaryCards() : getEmployeeSummaryCards();
}

export function isCeoSummaryCardId(id: SummaryCardData['id']): boolean {
  return (
    id === 'workforce-availability' ||
    id === 'company-performance' ||
    id === 'project-health' ||
    id === 'productivity-score'
  );
}
