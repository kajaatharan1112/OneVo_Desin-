import { useMemo } from 'react';
import {
  employeeActiveRequests,
  employeeLeaveBalance,
  employeeNeedsAction,
  employeePendingApprovalTimeline,
  employeeQuickRequestTypes,
  employeeRequestCategories,
  employeeRequestPolicyNotes,
  employeeRequestStats
} from '../data/employee-requests.data';
import type { EmployeeRequest, RequestStatusGroup } from '../types/employee-requests.types';

const GROUP_CONFIG: { id: RequestStatusGroup['id']; title: string; match: EmployeeRequest['status'][] }[] = [
  { id: 'needs-action', title: 'Needs Your Action', match: ['needs-action'] },
  { id: 'pending', title: 'Pending Review', match: ['pending'] },
  { id: 'approved', title: 'Approved / Ready', match: ['approved'] }
];

const STATUS_BOARD_GROUP_IDS = new Set<RequestStatusGroup['id']>([
  'needs-action',
  'pending',
  'approved'
]);

const STATUS_BOARD_ROWS_MAX = 6;
const PENDING_TIMELINE_VISIBLE_MAX = 4;
const POLICY_NOTES_VISIBLE_MAX = 4;

function buildStatusGroups(requests: EmployeeRequest[]): RequestStatusGroup[] {
  return GROUP_CONFIG.map((group) => ({
    id: group.id,
    title: group.title,
    requests: requests.filter((request) => group.match.includes(request.status))
  })).filter((group) => group.requests.length > 0);
}

function limitStatusBoardGroups(groups: RequestStatusGroup[], maxRows: number): RequestStatusGroup[] {
  let remaining = maxRows;

  return groups
    .map((group) => {
      if (remaining <= 0) {
        return { ...group, requests: [] };
      }

      const requests = group.requests.slice(0, remaining);
      remaining -= requests.length;

      return { ...group, requests };
    })
    .filter((group) => group.requests.length > 0);
}

export function useEmployeeRequests() {
  const boardRequests = useMemo(
    () => employeeActiveRequests.filter((request) => request.status !== 'rejected'),
    []
  );

  const statusGroups = useMemo(() => buildStatusGroups(boardRequests), [boardRequests]);

  const statusBoardGroups = useMemo(() => {
    const filtered = statusGroups.filter((group) => STATUS_BOARD_GROUP_IDS.has(group.id));
    return limitStatusBoardGroups(filtered, STATUS_BOARD_ROWS_MAX);
  }, [statusGroups]);

  const maxCategoryCount = useMemo(
    () => Math.max(...employeeRequestCategories.map((category) => category.count)),
    []
  );

  const policyNotes = useMemo(
    () => employeeRequestPolicyNotes.slice(0, POLICY_NOTES_VISIBLE_MAX),
    []
  );

  const pendingTimeline = useMemo(
    () => employeePendingApprovalTimeline.slice(0, PENDING_TIMELINE_VISIBLE_MAX),
    []
  );

  const shownCount = boardRequests.length;
  const archivedCount = employeeRequestStats.total - shownCount;

  return {
    needsAction: employeeNeedsAction,
    stats: employeeRequestStats,
    statusGroups,
    statusBoardGroups,
    shownCount,
    totalCount: employeeRequestStats.total,
    archivedCount,
    leaveBalance: employeeLeaveBalance,
    categories: employeeRequestCategories,
    maxCategoryCount,
    pendingTimeline,
    quickRequestTypes: employeeQuickRequestTypes,
    policyNotes
  };
}
