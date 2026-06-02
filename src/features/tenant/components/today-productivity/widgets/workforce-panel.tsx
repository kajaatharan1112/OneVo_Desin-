import React from 'react';
import { Building2, Home } from 'lucide-react';
import type { WorkforceMetrics } from '../../../data/tenant-today-productivity.data';
import { WorkforceCombinedChart } from './workforce-combined-chart';

interface WorkforcePanelProps {
  variant: 'onsite' | 'remote';
  metrics: WorkforceMetrics;
}

export const WorkforcePanel: React.FC<WorkforcePanelProps> = ({ variant, metrics }) => {
  const title = variant === 'onsite' ? 'On-site employees' : 'Remote employees';
  const Icon = variant === 'onsite' ? Building2 : Home;
  const cellClass = variant === 'onsite' ? 'tto-cell--onsite' : 'tto-cell--remote';

  return (
    <article className={`tto-widget tto-workforce ${cellClass}`}>
      <WorkforceCombinedChart metrics={metrics} title={title} Icon={Icon} />
    </article>
  );
};
