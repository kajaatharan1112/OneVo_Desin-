import React from 'react';
import { DecisionsAgingPanel } from './widgets/decisions-aging-panel';
import { DecisionsApprovalQueue } from './widgets/decisions-approval-queue';
import { DecisionsCategoryPanel } from './widgets/decisions-category-panel';
import { DecisionsDeptPendingPanel } from './widgets/decisions-dept-pending-panel';
import { DecisionsHighImpactPanel } from './widgets/decisions-high-impact-panel';
import { DecisionsSummaryPanel } from './widgets/decisions-summary-panel';

export const CeoDecisionsDashboard: React.FC = () => {
  return (
    <div className="ceo-decisions-overview" aria-label="Pending decisions">
      <DecisionsSummaryPanel />
      <DecisionsCategoryPanel />
      <DecisionsAgingPanel />
      <DecisionsApprovalQueue />
      <DecisionsDeptPendingPanel />
      <DecisionsHighImpactPanel />
    </div>
  );
};
