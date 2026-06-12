import React from 'react';
import { PrioritiesActionQueuePanel } from './widgets/priorities-action-queue-panel';
import { PrioritiesMeetingsPanel } from './widgets/priorities-meetings-panel';

export const CeoPrioritiesDashboard: React.FC = () => {
  return (
    <div className="ceo-priorities-overview" aria-label="My priorities & schedule">
      <PrioritiesActionQueuePanel />
      <PrioritiesMeetingsPanel />
    </div>
  );
};
