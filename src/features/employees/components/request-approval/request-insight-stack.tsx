import React from 'react';
import type { LeaveBalance, RequestCategoryCount } from '../../types/employee-requests.types';
import { LeaveBalanceCard } from './leave-balance-card';
import { RequestCategoryBreakdown } from './request-category-breakdown';

interface RequestInsightStackProps {
  leaveBalance: LeaveBalance;
  categories: RequestCategoryCount[];
  maxCount: number;
  className?: string;
}

export const RequestInsightStack: React.FC<RequestInsightStackProps> = ({
  leaveBalance,
  categories,
  maxCount,
  className = ''
}) => {
  return (
    <div className={`era-insight-stack ${className}`.trim()} aria-label="Request insights">
      <LeaveBalanceCard balance={leaveBalance} />
      <RequestCategoryBreakdown categories={categories} maxCount={maxCount} />
    </div>
  );
};
