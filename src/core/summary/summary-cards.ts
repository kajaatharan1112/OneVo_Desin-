import type { SummaryCardData, TenantKpiCardData } from '../../shared/types/summary-card.types';
import { getEmployeeData } from '../../features/employees/data/employee-data.registry';
import { EMPLOYEE_DASHBOARD_EMPTY } from '../../features/employees/config/employee-dashboard.config';
import { workDashboardSummary } from '../../features/employees/data/work-dashboard.data';
import type { EmployeeId } from '../../features/employees/types/employee.types';

export const employeeSummaryCards: SummaryCardData[] = [
  {
    id: 'task-overview',
    title: 'Work',
    value: `${workDashboardSummary.totalTasks}/${workDashboardSummary.pendingTasks}`,
    desc: `Today · Sprint ${workDashboardSummary.sprintCompletedPercent}% complete`,
    color: 'var(--accent)'
  },
  {
    id: 'requests-approval',
    title: 'Requests',
    value: '—',
    desc: 'New design in progress',
    color: 'var(--accent)'
  },
  {
    id: 'activity',
    title: 'Attendance',
    value: '—',
    desc: 'New design in progress',
    color: 'var(--accent)'
  },
  {
    id: 'my-calendar',
    title: 'Schedule',
    value: '—',
    desc: 'New design in progress',
    color: 'var(--accent)'
  }
];

export const tenantKpiCards: TenantKpiCardData[] = [
  {
    id: 'total-employees',
    title: 'Total Employees',
    value: '126',
    desc: 'Active employees',
    accent: 'blue'
  },
  {
    id: 'departments',
    title: 'Departments',
    value: '8',
    desc: 'Active departments',
    accent: 'blue'
  },
  {
    id: 'active-projects',
    title: 'Active Projects',
    value: '14',
    desc: 'Running projects',
    accent: 'indigo'
  },
  {
    id: 'monthly-revenue',
    title: 'Monthly Revenue',
    value: '$42.8k',
    subtitle: 'This month',
    trend: '+12% vs last month',
    accent: 'green'
  },
  {
    id: 'pending-approvals',
    title: 'Pending Approvals',
    value: '9',
    desc: 'Need owner action',
    accent: 'orange'
  }
];

/** @deprecated Legacy tenant tab cards */
export const tenantSummaryCards: SummaryCardData[] = [
  {
    id: 'today-productivity',
    title: 'Today',
    value: 'Productivity 87%',
    desc: '+4% higher than yesterday',
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

export function getCeoSummaryCards(): SummaryCardData[] {
  const { ceoSummaryCards } = getEmployeeData('marcus');

  return (ceoSummaryCards ?? []).map((card) => ({
    id: card.id,
    title: card.title,
    value: EMPLOYEE_DASHBOARD_EMPTY ? '—' : card.value,
    desc: EMPLOYEE_DASHBOARD_EMPTY ? 'New design in progress' : card.desc,
    delta: EMPLOYEE_DASHBOARD_EMPTY ? undefined : card.delta,
    status: EMPLOYEE_DASHBOARD_EMPTY ? undefined : card.status,
    color: card.color,
    actionLabel: EMPLOYEE_DASHBOARD_EMPTY ? undefined : card.actionLabel,
    actionTab: EMPLOYEE_DASHBOARD_EMPTY ? undefined : card.actionTab,
    variant: 'ceo' as const
  }));
}

export function getSummaryCardsForView(
  view: 'employee' | 'tenant',
  employeeId: EmployeeId = 'alex'
): SummaryCardData[] {
  if (view === 'tenant') {
    return tenantSummaryCards;
  }

  return employeeId === 'marcus' ? getCeoSummaryCards() : employeeSummaryCards;
}

export function isCeoSummaryCardId(id: SummaryCardData['id']): boolean {
  return (
    id === 'workforce-availability' ||
    id === 'company-performance' ||
    id === 'productivity' ||
    id === 'my-priorities' ||
    id === 'project-health' ||
    id === 'schedule'
  );
}
