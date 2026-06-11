export type EmployeeSummaryCardId =
  | 'task-overview'
  | 'requests-approval'
  | 'activity'
  | 'my-calendar';

export type TenantSummaryCardId =
  | 'today-productivity'
  | 'ongoing-projects'
  | 'total-revenue'
  | 'open-requests';

export type SummaryCardId = EmployeeSummaryCardId | TenantSummaryCardId;

export interface SummaryCardData {
  id: SummaryCardId;
  title: string;
  value: string;
  desc: string;
  color: string;
}
