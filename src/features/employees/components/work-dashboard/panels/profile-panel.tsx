import React from 'react';
import { Monitor } from 'lucide-react';
import { useEmployeeContext } from '../../../context/employee-context';
import type { WorkDashboardProfileSnapshot } from '../../../data/work-dashboard.data';
import { WorkDashboardPanel } from '../work-dashboard-panel';

interface ProfilePanelProps {
  snapshot: WorkDashboardProfileSnapshot;
}

export const ProfilePanel: React.FC<ProfilePanelProps> = ({ snapshot }) => {
  const { selectedEmployee } = useEmployeeContext();
  const isOnline = snapshot.agentConnected && snapshot.agentOnline;
  const agentLabel = snapshot.agentConnected
    ? snapshot.agentOnline ? 'Online' : 'Away'
    : 'Offline';

  return (
    <WorkDashboardPanel title="Profile" className="work-dashboard__profile">
      <div className="wd-profile-bar">

        {/* Name + role — no avatar */}
        <div className="wd-profile-name-wrap">
          <span className="wd-profile-name">{selectedEmployee.name}</span>
          <span className="wd-profile-role">{snapshot.role}</span>
        </div>

        <div className="wd-profile-sep" aria-hidden="true" />

        {/* Inline stats */}
        <span className="wd-profile-inline-stat">
          <span className="wd-profile-inline-stat__label">Clock in</span>
          <span className="wd-profile-inline-stat__value">{snapshot.clockInTime}</span>
        </span>

        <span className="wd-profile-divot" aria-hidden="true">·</span>

        <span className="wd-profile-inline-stat">
          <span className="wd-profile-inline-stat__label">Session</span>
          <span className="wd-profile-inline-stat__value">{snapshot.sessionDuration}</span>
        </span>

        <div className="wd-profile-sep" aria-hidden="true" />

        <span className="wd-profile-dept">{snapshot.department}</span>

        {/* Agent status — pushed right */}
        <div className="wd-profile-agent">
          <span className={`wd-profile-agent__dot${isOnline ? ' wd-profile-agent__dot--online' : ''}`} aria-hidden="true" />
          <Monitor size={10} aria-hidden="true" />
          <span className="wd-profile-agent__text">Desktop agent</span>
          <span className={`wd-profile-agent__status${isOnline ? ' wd-profile-agent__status--online' : ''}`}>
            · {agentLabel}
          </span>
        </div>

      </div>
    </WorkDashboardPanel>
  );
};
