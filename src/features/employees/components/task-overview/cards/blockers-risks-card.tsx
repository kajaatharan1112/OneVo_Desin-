import React from 'react';
import { ShieldAlert } from 'lucide-react';
import type { BlockerRiskItem } from '../../../types/employee-task-overview.types';
import { DashboardCard } from './dashboard-card';

const KIND_LABELS: Record<BlockerRiskItem['kind'], string> = {
  blocked: 'Blocked',
  dependency: 'Dependency',
  'pr-review': 'PR review'
};

interface BlockersRisksCardProps {
  items: BlockerRiskItem[];
  className?: string;
}

export const BlockersRisksCard: React.FC<BlockersRisksCardProps> = ({ items, className }) => {
  return (
    <DashboardCard
      className={`emp-dash-card--alert ${className ?? ''}`.trim()}
      title="Blockers & Risks"
      icon={<ShieldAlert size={15} aria-hidden="true" />}
      ariaLabel="Blockers and risks"
    >
      <ul className="emp-dash-scroll emp-dash-scroll--blockers" aria-label="Important blockers">
        {items.map((item) => (
          <li
            key={item.id}
            className={`emp-dash-blocker-row emp-dash-blocker-row--${item.severity}`}
          >
            <div className="emp-dash-blocker-row__head">
              <span className="emp-dash-blocker-row__title">{item.title}</span>
              <span className={`emp-dash-chip emp-dash-chip--kind-${item.kind}`}>
                {KIND_LABELS[item.kind]}
              </span>
            </div>
            <span className="emp-dash-blocker-row__detail">{item.detail}</span>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
};
