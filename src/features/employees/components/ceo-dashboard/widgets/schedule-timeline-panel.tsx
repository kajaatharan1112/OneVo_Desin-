import React from 'react';
import { CalendarClock } from 'lucide-react';
import { ceoDashboardData } from '../data/ceo-dashboard.data';
import type { CeoMeetingItem, MeetingType } from '../data/ceo-dashboard.data';

const TIMELINE_START_HOUR = 8;
const TIMELINE_END_HOUR = 19;
const TIMELINE_TOTAL_HOURS = TIMELINE_END_HOUR - TIMELINE_START_HOUR;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m ?? 0);
}

function getTopPercent(startTime: string): number {
  const startMinutes = timeToMinutes(startTime);
  const timelineStartMinutes = TIMELINE_START_HOUR * 60;
  return ((startMinutes - timelineStartMinutes) / (TIMELINE_TOTAL_HOURS * 60)) * 100;
}

function getHeightPercent(startTime: string, endTime: string): number {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  return ((endMinutes - startMinutes) / (TIMELINE_TOTAL_HOURS * 60)) * 100;
}

function getMeetingTypeClass(type: MeetingType): string {
  switch (type) {
    case 'board':
      return 'ceo-timeline__block--board';
    case 'internal':
      return 'ceo-timeline__block--internal';
    case 'leadership':
      return 'ceo-timeline__block--leadership';
    case 'client':
      return 'ceo-timeline__block--client';
    case 'escalation':
      return 'ceo-timeline__block--escalation';
    case 'one-on-one':
      return 'ceo-timeline__block--one-on-one';
    default:
      return '';
  }
}

const hourLabels = Array.from(
  { length: TIMELINE_TOTAL_HOURS + 1 },
  (_, i) => TIMELINE_START_HOUR + i
);

function formatHourLabel(hour: number): string {
  if (hour === 12) return '12 PM';
  if (hour > 12) return `${hour - 12} PM`;
  return `${hour} AM`;
}

function getNowPercent(): number {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const timelineStartMinutes = TIMELINE_START_HOUR * 60;
  const percent = ((nowMinutes - timelineStartMinutes) / (TIMELINE_TOTAL_HOURS * 60)) * 100;
  return Math.max(0, Math.min(100, percent));
}

interface MeetingBlockProps {
  meeting: CeoMeetingItem;
}

const MeetingBlock: React.FC<MeetingBlockProps> = ({ meeting }) => {
  const top = getTopPercent(meeting.startTime);
  const height = getHeightPercent(meeting.startTime, meeting.endTime);

  return (
    <div
      className={`ceo-timeline__block ${getMeetingTypeClass(meeting.type)}`}
      style={{ top: `${top}%`, height: `${Math.max(height, 4)}%` }}
      title={`${meeting.title} · ${meeting.startTime}–${meeting.endTime}`}
      aria-label={`${meeting.title} from ${meeting.startTime} to ${meeting.endTime}`}
    >
      <span className="ceo-timeline__block-title">{meeting.title}</span>
      <span className="ceo-timeline__block-time">
        {meeting.startTime}–{meeting.endTime}
      </span>
    </div>
  );
};

export const ScheduleTimelinePanel: React.FC = () => {
  const { meetings } = ceoDashboardData.schedule;
  const nowPercent = getNowPercent();

  return (
    <article className="cwo-widget ceo-sched-cell--timeline">
      <header className="cwo-widget__head">
        <CalendarClock size={16} aria-hidden="true" />
        <h4 className="cwo-widget__title">Day Timeline</h4>
        <span className="cwo-widget__tab">8 AM — 7 PM</span>
      </header>

      <div className="ceo-timeline" aria-label="Meeting timeline">
        <div className="ceo-timeline__hours" aria-hidden="true">
          {hourLabels.map((hour) => (
            <span key={hour} className="ceo-timeline__hour-label">
              {formatHourLabel(hour)}
            </span>
          ))}
        </div>

        <div className="ceo-timeline__track">
          {hourLabels.map((hour) => (
            <div key={hour} className="ceo-timeline__grid-line" aria-hidden="true" />
          ))}

          <div
            className="ceo-timeline__now"
            style={{ top: `${nowPercent}%` }}
            aria-label="Current time"
          />

          {meetings.map((meeting) => (
            <MeetingBlock key={meeting.id} meeting={meeting} />
          ))}
        </div>
      </div>
    </article>
  );
};
