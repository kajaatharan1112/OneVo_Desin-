export type EmployeeSummaryCardId =
  | 'task-overview'
  | 'requests-approval'
  | 'activity'
  | 'my-calendar';

export type CeoSummaryCardId =
  | 'workforce-availability'
  | 'company-performance'
  | 'productivity'
  | 'my-priorities'
  | 'project-health'
  | 'schedule';

export type TenantKpiCardId =
  | 'total-employees'
  | 'departments'
  | 'active-projects'
  | 'monthly-revenue'
  | 'pending-approvals';

/** @deprecated Legacy tab IDs — kept for type compatibility */
export type TenantSummaryCardId =
  | 'today-productivity'
  | 'ongoing-projects'
  | 'total-revenue'
  | 'open-requests';

export type SummaryCardId =
  | EmployeeSummaryCardId
  | CeoSummaryCardId
  | TenantSummaryCardId
  | TenantKpiCardId;

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

export interface TenantKpiCardData {
  id: TenantKpiCardId;
  title: string;
  value: string;
  desc?: string;
  subtitle?: string;
  trend?: string;
  accent: 'blue' | 'indigo' | 'green' | 'orange';
}
