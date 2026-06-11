import React from 'react';
import { Palmtree } from 'lucide-react';
import type { LeaveBalance } from '../../types/employee-requests.types';

interface LeaveBalanceCardProps {
  balance: LeaveBalance;
  className?: string;
}

export const LeaveBalanceCard: React.FC<LeaveBalanceCardProps> = ({ balance, className = '' }) => {
  return (
    <section
      className={`era-panel era-leave-balance-card ${className}`.trim()}
      aria-label="Leave balance"
    >
      <header className="era-section__head">
        <Palmtree size={14} aria-hidden="true" />
        <h3 className="era-section__title">Leave Balance</h3>
        <span className="era-leave-balance__total">{balance.totalRemaining} days left</span>
      </header>
      <dl className="era-leave-balance__metrics">
        {balance.items.map((item) => {
          const remaining = item.total - item.used;

          return (
            <div key={item.id}>
              <dt>{item.label}</dt>
              <dd>
                {remaining}/{item.total} left
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
};
