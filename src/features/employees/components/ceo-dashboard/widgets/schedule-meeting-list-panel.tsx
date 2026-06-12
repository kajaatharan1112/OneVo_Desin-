import React from 'react';
import { MapPin, Monitor, Users, Video } from 'lucide-react';
import { ceoDashboardData } from '../data/ceo-dashboard.data';
import type { CeoMeetingItem, MeetingPlatform, MeetingType } from '../data/ceo-dashboard.data';

interface ScheduleMeetingListPanelProps {
  variant?: 'default' | 'compact';
}

function getMeetingTypeLabel(type: MeetingType): string {
  switch (type) {
    case 'board':
      return 'Board';
    case 'internal':
      return 'Internal';
    case 'leadership':
      return 'Board';
    case 'client':
      return 'Client';
    case 'escalation':
      return 'Escalation';
    case 'one-on-one':
      return '1:1';
    default:
      return type;
  }
}

function getMeetingTypeClass(type: MeetingType): string {
  switch (type) {
    case 'board':
      return 'ceo-sched-badge--board';
    case 'internal':
      return 'ceo-sched-badge--internal';
    case 'leadership':
      return 'ceo-sched-badge--leadership';
    case 'client':
      return 'ceo-sched-badge--client';
    case 'escalation':
      return 'ceo-sched-badge--escalation';
    case 'one-on-one':
      return 'ceo-sched-badge--one-on-one';
    default:
      return '';
  }
}

function getPriorityClass(priority: 'normal' | 'high' | 'critical'): string {
  switch (priority) {
    case 'critical':
      return 'ceo-sched-item__priority--critical';
    case 'high':
      return 'ceo-sched-item__priority--high';
    default:
      return 'ceo-sched-item__priority--internal';
  }
}

function getCompactBadgeLabel(meeting: CeoMeetingItem): string | null {
  if (meeting.listBadge) {
    return meeting.listBadge;
  }
  if (meeting.priority === 'critical') {
    return 'Critical';
  }
  if (meeting.priority === 'high') {
    return 'High';
  }
  return null;
}

function PlatformIcon({ platform }: { platform: MeetingPlatform }) {
  const props = { size: 12, 'aria-hidden': true as const };
  switch (platform) {
    case 'zoom':
      return <Video {...props} />;
    case 'teams':
      return <Monitor {...props} />;
    case 'in-person':
      return <MapPin {...props} />;
    default:
      return null;
  }
}

export const ScheduleMeetingListPanel: React.FC<ScheduleMeetingListPanelProps> = ({
  variant = 'default'
}) => {
  const { meetings, totalMeetings, meetingHours } = ceoDashboardData.schedule;
  const isCompact = variant === 'compact';
  const visibleMeetings = isCompact ? meetings.slice(0, 4) : meetings;

  return (
    <article
      className={`cwo-widget cwo-widget--list ceo-sched-cell--list${isCompact ? ' ceo-sched-cell--list-compact' : ''}`}
    >
      <header className="cwo-widget__head">
        <h4 className="cwo-widget__title">Meetings Today</h4>
        {!isCompact && (
          <span className="cwo-widget__tab">
            {totalMeetings} meetings · {meetingHours} hrs
          </span>
        )}
      </header>

      <ul
        className={`ceo-sched-list${isCompact ? ' ceo-sched-list--compact' : ''}`}
        aria-label="Today's meetings"
      >
        {visibleMeetings.map((meeting) => {
          const badgeLabel = isCompact ? getCompactBadgeLabel(meeting) : null;

          if (isCompact) {
            return (
              <li key={meeting.id} className="ceo-sched-item ceo-sched-item--compact">
                <div className="ceo-sched-item__body">
                  <div className="ceo-sched-item__top">
                    <span className="ceo-sched-item__title">{meeting.title}</span>
                    {badgeLabel && (
                      <span
                        className={`ceo-sched-item__priority ${getPriorityClass(meeting.priority)}`}
                      >
                        {badgeLabel}
                      </span>
                    )}
                  </div>
                  <p className="ceo-sched-item__compact-meta">
                    {meeting.startTime}–{meeting.endTime} · {getMeetingTypeLabel(meeting.type)} ·{' '}
                    {meeting.attendees} attendees
                  </p>
                </div>
              </li>
            );
          }

          return (
            <li key={meeting.id} className="ceo-sched-item">
              <div
                className={`ceo-sched-item__accent ${getMeetingTypeClass(meeting.type)}`}
                aria-hidden="true"
              />
              <div className="ceo-sched-item__body">
                <div className="ceo-sched-item__top">
                  <span className="ceo-sched-item__title">{meeting.title}</span>
                  {meeting.priority !== 'normal' && (
                    <span
                      className={`ceo-sched-item__priority ${getPriorityClass(meeting.priority)}`}
                    >
                      {meeting.priority}
                    </span>
                  )}
                </div>
                <div className="ceo-sched-item__meta">
                  <span className="ceo-sched-item__time">
                    {meeting.startTime} – {meeting.endTime}
                  </span>
                  <span className="ceo-sched-item__dot" aria-hidden="true">
                    ·
                  </span>
                  <span className="ceo-sched-item__duration">{meeting.durationLabel}</span>
                </div>
                <div className="ceo-sched-item__footer">
                  <span className={`ceo-sched-badge ${getMeetingTypeClass(meeting.type)}`}>
                    {getMeetingTypeLabel(meeting.type)}
                  </span>
                  <span className="ceo-sched-item__platform">
                    <PlatformIcon platform={meeting.platform} />
                    {meeting.platform}
                  </span>
                  <span className="ceo-sched-item__attendees">
                    <Users size={12} aria-hidden="true" />
                    {meeting.attendees}
                  </span>
                </div>
                <p className="ceo-sched-item__desc">{meeting.description}</p>
              </div>
            </li>
          );
        })}
      </ul>

      {isCompact && (
        <button type="button" className="mprio-footer-link ceo-sched-footer-link">
          View full schedule →
        </button>
      )}
    </article>
  );
};
