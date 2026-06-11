export type EmployeeSummaryCardId =
  | 'task-overview'
  | 'requests-approval'
  | 'activity'
  | 'my-calendar';

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

export type SummaryCardId = EmployeeSummaryCardId | TenantSummaryCardId | TenantKpiCardId;

export interface SummaryCardData {
  id: SummaryCardId;
  title: string;
  value: string;
  desc: string;
  color: string;
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
