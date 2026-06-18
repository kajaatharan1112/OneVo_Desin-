import type { EmployeeProfile } from '../../features/employees/types/employee.types';

export interface ProfileCapabilities {
  shellMode: 'employee' | 'tenant';
  canSeeOrganization: boolean;
  canSeePeopleAdmin: boolean;
  canSeeLeaveConfig: boolean;
  canSeeTimeAttendanceConfig: boolean;
  canSeeMonitoring: boolean;
  canSeeAdminSettings: boolean;
  canSeeAutomations: boolean;
}

const MANAGEMENT_IDS = new Set(['marcus', 'manager']);

export function getProfileCapabilities(profile: EmployeeProfile): ProfileCapabilities {
  const isManagement = MANAGEMENT_IDS.has(profile.id);
  return {
    shellMode: isManagement ? 'tenant' : 'employee',
    canSeeOrganization: isManagement,
    canSeePeopleAdmin: isManagement,
    canSeeLeaveConfig: isManagement,
    canSeeTimeAttendanceConfig: isManagement,
    canSeeMonitoring: isManagement,
    canSeeAdminSettings: true,
    canSeeAutomations: isManagement,
  };
}

const MANAGEMENT_ONLY_PATHS = ['/organization/', '/people/checklist-templates', '/automations'];

export function isManagementOnlyPath(pathname: string): boolean {
  return MANAGEMENT_ONLY_PATHS.some(p => pathname.startsWith(p));
}
