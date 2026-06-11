import React from 'react';
import { useEmployeeRequests } from '../../hooks/use-employee-requests';
import { NeedsActionBanner } from './needs-action-banner';
import { PendingApprovalTimelineCard } from './pending-approval-timeline-card';
import { QuickRequestTypesCard } from './quick-request-types-card';
import { RequestInsightStack } from './request-insight-stack';
import { RequestPolicyNotesCard } from './request-policy-notes-card';
import { RequestStatusBoard } from './request-status-board';

export const RequestApprovalTab: React.FC = () => {
  const {
    needsAction,
    statusBoardGroups,
    shownCount,
    archivedCount,
    totalCount,
    leaveBalance,
    categories,
    maxCategoryCount,
    pendingTimeline,
    quickRequestTypes,
    policyNotes
  } = useEmployeeRequests();

  return (
    <div
      className="employee-request-approval employee-request-approval-grid"
      aria-label="Request and approval tracking"
    >
      <NeedsActionBanner item={needsAction} className="era-span-12" />
      <RequestStatusBoard
        className="era-span-8"
        groups={statusBoardGroups}
        shownCount={shownCount}
        archivedCount={archivedCount}
        totalCount={totalCount}
      />
      <RequestInsightStack
        className="era-span-4"
        leaveBalance={leaveBalance}
        categories={categories}
        maxCount={maxCategoryCount}
      />
      <PendingApprovalTimelineCard items={pendingTimeline} className="era-span-4" />
      <QuickRequestTypesCard types={quickRequestTypes} className="era-span-4" />
      <RequestPolicyNotesCard notes={policyNotes} className="era-span-4" />
    </div>
  );
};
