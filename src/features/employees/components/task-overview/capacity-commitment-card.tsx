import React, { useMemo } from 'react';
import { Gauge } from 'lucide-react';
import type { WorkCapacityCommitment } from '../../data/work-tab.mock';
import { DashboardCard } from './cards/dashboard-card';

interface CapacityCommitmentCardProps {
  data: WorkCapacityCommitment;
  className?: string;
}

export const CapacityCommitmentCard: React.FC<CapacityCommitmentCardProps> = ({
  data,
  className = ''
}) => {
  const fillPercent = useMemo(
    () => Math.min(100, Math.round((data.committedHours / data.availableHours) * 100)),
    [data.availableHours, data.committedHours]
  );

  return (
    <DashboardCard
      title="Capacity vs Commitment"
      icon={<Gauge size={15} aria-hidden="true" />}
      className={`work-tab__cell work-tab__cell--static ${className}`.trim()}
      ariaLabel="Capacity versus commitment"
    >
      <div className="work-capacity">
        <div className="work-capacity__headline">
          <div>
            <span className="work-capacity__label">Available</span>
            <span className="work-capacity__value">{data.availableHours}h</span>
          </div>
          <span className="work-capacity__vs" aria-hidden="true">
            vs
          </span>
          <div>
            <span className="work-capacity__label">Committed</span>
            <span className="work-capacity__value work-capacity__value--accent">
              {data.committedHours}h
            </span>
          </div>
        </div>
        <div
          className="work-capacity__track"
          role="progressbar"
          aria-valuenow={data.committedHours}
          aria-valuemin={0}
          aria-valuemax={data.availableHours}
          aria-label={`${data.committedHours} of ${data.availableHours} hours committed`}
        >
          <span className="work-capacity__fill" style={{ width: `${fillPercent}%` }} />
        </div>
        <p className="work-capacity__status">
          {data.status} <span aria-hidden="true">✅</span>
        </p>
        <p className="work-capacity__warning">{data.warning}</p>
      </div>
    </DashboardCard>
  );
};
