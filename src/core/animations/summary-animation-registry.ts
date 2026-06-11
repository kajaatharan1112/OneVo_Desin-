import type { LottieAnimationData } from '../../shared/components/lottie-player/lottie-player';
import employeeLeaves from '../../assets/animations/employee-leaves.json';
import employeeTasks from '../../assets/animations/employee-tasks.json';
import tenantEmployees from '../../assets/animations/tenant-employees.json';
import tenantProjects from '../../assets/animations/tenant-projects.json';
import tenantRevenue from '../../assets/animations/tenant-revenue.json';
import tenantRequests from '../../assets/animations/tenant-requests.json';

/** key = summary card title, value = Lottie JSON (per 3DAnimation.md) */
export const summaryAnimationRegistry: Record<string, LottieAnimationData> = {
  Work: employeeTasks as LottieAnimationData,
  Requests: tenantRequests as LottieAnimationData,
  Attendance: employeeLeaves as LottieAnimationData,
  Schedule: employeeTasks as LottieAnimationData,
  Today: tenantEmployees as LottieAnimationData,
  'Active Employees': tenantEmployees as LottieAnimationData,
  'This week': tenantProjects as LottieAnimationData,
  'Monthly Review': tenantRevenue as LottieAnimationData,
  'Annual Analytics and Goals': tenantRequests as LottieAnimationData
};

export function getSummaryAnimation(title: string): LottieAnimationData | undefined {
  return summaryAnimationRegistry[title];
}
