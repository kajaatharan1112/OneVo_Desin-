import React from 'react';
import type { CalendarSyncStatus, SyncConnectionStatus } from '../../types/employee-calendar.types';
import { GoogleCalendarIcon, OutlookCalendarIcon } from './calendar-provider-icons';

interface CalendarSyncCompactProps {
  sync: CalendarSyncStatus;
}

function SyncIconChip({
  label,
  status,
  icon,
  iconClassName
}: {
  label: string;
  status: SyncConnectionStatus;
  icon: React.ReactNode;
  iconClassName: string;
}) {
  const connected = status === 'Connected';

  return (
    <span
      className={`emc-sync-compact__chip${connected ? ' emc-sync-compact__chip--on' : ''}`}
      title={`${label} · ${status}`}
    >
      <span className={`emc-sync-compact__icon ${iconClassName}`.trim()}>{icon}</span>
      <span className={`emc-sync-compact__dot${connected ? ' emc-sync-compact__dot--on' : ''}`} />
    </span>
  );
}

export const CalendarSyncCompact: React.FC<CalendarSyncCompactProps> = ({ sync }) => {
  return (
    <footer className="emc-sync-compact" aria-label="Calendar sync status">
      <span className="emc-sync-compact__label">Sync</span>
      <div className="emc-sync-compact__chips">
        <SyncIconChip
          label="Google Calendar"
          status={sync.google}
          icon={<GoogleCalendarIcon size={14} />}
          iconClassName="emc-sync-compact__icon--google"
        />
        <SyncIconChip
          label="Outlook Calendar"
          status={sync.outlook}
          icon={<OutlookCalendarIcon size={14} />}
          iconClassName="emc-sync-compact__icon--outlook"
        />
      </div>
      <span className="emc-sync-compact__meta">{sync.lastSynced}</span>
    </footer>
  );
};
