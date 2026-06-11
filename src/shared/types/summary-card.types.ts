export type EmployeeSummaryCardId =
  | 'task-overview'
  | 'requests-approval'
  | 'activity'
  | 'goals';

export type CeoSummaryCardId =
  | 'workforce-availability'
  | 'company-performance'
  | 'productivity'
  | 'my-priorities'
  | 'project-health'
  | 'schedule';

export type TenantSummaryCardId =
  | 'today-productivity'
  | 'ongoing-projects'
  | 'total-revenue'
  | 'open-requests';

export type SummaryCardId = EmployeeSummaryCardId | CeoSummaryCardId | TenantSummaryCardId;

export type SummaryCardStatus = 'green' | 'amber' | 'red';

export interface SummaryCardData {
  id: SummaryCardId;
  title: string;
  value: string;
  desc: string;
  color: string;
  variant?: 'employee' | 'ceo';
  delta?: string;
  status?: SummaryCardStatus;
  actionLabel?: string;
  actionTab?: string;
}
