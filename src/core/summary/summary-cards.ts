import type { SummaryCardData } from '../../shared/types/summary-card.types';
import { tenantProductivitySummary } from '../../features/tenant/data/tenant-today-productivity.data';

export const employeeSummaryCards: SummaryCardData[] = [
  {
    id: 'task-overview',
    title: 'Work',
    value: '12/15 sprint done',
    desc: '6 open · 2 due today · 1 blocked',
    color: 'var(--accent)'
  },
  {
    id: 'requests-approval',
    title: 'Requests',
    value: '7 waiting',
    desc: '24 days leave left · 1 action needed',
    color: 'var(--accent)'
  },
  {
    id: 'activity',
    title: 'Attendance',
    value: '9:15 AM clocked in',
    desc: '4h 30m worked · On time',
    color: 'var(--accent)'
  },
  {
    id: 'my-calendar',
    title: 'Schedule',
    value: '4 events today',
    desc: 'Next: Sprint Review · No conflicts',
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
    title: 'Annual Analytics and Goals',
    value: '14',
    desc: 'Require system review',
    color: '#f59e0b'
  }
];

export function getSummaryCardsForView(view: 'employee' | 'tenant'): SummaryCardData[] {
  return view === 'tenant' ? tenantSummaryCards : employeeSummaryCards;
}
