import React from 'react';
import { Monitor } from 'lucide-react';
import { useEmployeeContext } from '../../../context/employee-context';
import type {
  WorkDashboardProfileSnapshot,
  WorkDashboardProfileWeekDay,
  WorkDashboardWorkMode
} from '../../../data/work-dashboard.data';
import { WorkDashboardPanel } from '../work-dashboard-panel';

interface ProfilePanelProps {
  snapshot: WorkDashboardProfileSnapshot;
}

const MODE_LABEL: Record<WorkDashboardWorkMode, string> = {
  onsite: 'On site',
  wfh: 'Work from home'
};

const formatDayAria = (day: WorkDashboardProfileWeekDay) => {
  const parts = [day.dayLabel, MODE_LABEL[day.mode]];
  if (day.clockInTime) parts.push(`clock in ${day.clockInTime}`);
  if (day.isToday) parts.push('today');
  return parts.join(', ');
};

export const ProfilePanel: React.FC<ProfilePanelProps> = ({ snapshot }) => {
  const { selectedEmployee } = useEmployeeContext();
  const isOnline = snapshot.agentConnected && snapshot.agentOnline;
  const agentLabel = snapshot.agentConnected
    ? snapshot.agentOnline ? 'Online' : 'Away'
    : 'Offline';

  return (
    <WorkDashboardPanel title="Profile" className="work-dashboard__profile">
      <div className="wd-profile">
        <div className="wd-profile-row wd-profile-row--main">
          <div className="wd-profile-identity-inline">
            <span className="wd-profile-name">{selectedEmployee.name}</span>
            <span className="wd-profile-role-dot" aria-hidden="true">·</span>
            <span className="wd-profile-role">{snapshot.role}</span>
          </div>

          <span className="wd-profile-session-subtle">
            Today&apos;s session <strong>{snapshot.sessionDuration}</strong>
          </span>

          <div className="wd-profile-agent">
            <span className={`wd-profile-agent__dot${isOnline ? ' wd-profile-agent__dot--online' : ''}`} aria-hidden="true" />
            <Monitor size={9} aria-hidden="true" />
            <span className="wd-profile-agent__text">Desktop agent</span>
            <span className={`wd-profile-agent__status${isOnline ? ' wd-profile-agent__status--online' : ''}`}>
              · {agentLabel}
            </span>
          </div>
        </div>

        <ul className="wd-profile-week" aria-label="Weekly work location schedule">
          {snapshot.weekSchedule.map((day) => (
            <li
              key={day.id}
              className={[
                'wd-profile-day',
                `wd-profile-day--${day.mode}`,
                day.isToday ? 'wd-profile-day--today' : '',
                day.clockInTime ? 'wd-profile-day--clocked' : ''
              ].filter(Boolean).join(' ')}
              aria-label={formatDayAria(day)}
            >
              <span className="wd-profile-day__row wd-profile-day__row--top">
                <span className="wd-profile-day__label">{day.dayLabel}</span>
                {day.isToday ? (
                  <span className="wd-profile-day__today-badge">Today</span>
                ) : null}
                <span className="wd-profile-day__sep" aria-hidden="true">·</span>
                <span className="wd-profile-day__mode">{MODE_LABEL[day.mode]}</span>
              </span>
              <span className="wd-profile-day__row wd-profile-day__row--clock">
                {day.clockInTime ? (
                  <>
                    <span className="wd-profile-day__clock-label">Clock in</span>
                    <span className="wd-profile-day__clock-value">{day.clockInTime}</span>
                  </>
                ) : (
                  <span className="wd-profile-day__clock-empty">—</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </WorkDashboardPanel>
  );
};
