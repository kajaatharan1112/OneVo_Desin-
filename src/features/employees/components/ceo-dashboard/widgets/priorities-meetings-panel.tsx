import React, { useEffect, useRef, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { ceoDashboardData } from '../data/ceo-dashboard.data';
import type {
  CeoDayBlock,
  CeoDayBlockKind,
  CeoMeetingItem,
  MeetingType
} from '../data/ceo-dashboard.data';

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

function getKindMeta(block: CeoDayBlock, meeting?: CeoMeetingItem): string {
  const parts: string[] = [];

  switch (block.kind) {
    case 'meeting':
      parts.push(block.meetingType ? getMeetingTypeLabel(block.meetingType) : 'Meeting');
      if (meeting?.platform) {
        parts.push(meeting.platform);
      }
      if (meeting && meeting.attendees > 0) {
        parts.push(`${meeting.attendees} attendees`);
      }
      break;
    case 'focus':
      parts.push('Focus block');
      break;
    case 'admin':
      parts.push('Admin time');
      break;
    case 'free':
      parts.push('Open slot');
      break;
    default:
      parts.push(block.kind);
  }

  return parts.join(' · ');
}

function findMeetingForBlock(
  block: CeoDayBlock,
  meetings: CeoMeetingItem[]
): CeoMeetingItem | undefined {
  if (block.kind !== 'meeting') {
    return undefined;
  }

  return meetings.find(
    (meeting) => meeting.startTime === block.startTime && meeting.title === block.title
  );
}

function getAccentClass(block: CeoDayBlock): string {
  if (block.kind === 'focus') {
    return 'mprio-day-schedule__accent--focus';
  }
  if (block.kind === 'admin') {
    return 'mprio-day-schedule__accent--admin';
  }
  if (block.kind === 'free') {
    return 'mprio-day-schedule__accent--free';
  }

  switch (block.meetingType) {
    case 'leadership':
    case 'board':
      return 'mprio-day-schedule__accent--board';
    case 'client':
      return 'mprio-day-schedule__accent--client';
    case 'escalation':
      return 'mprio-day-schedule__accent--escalation';
    case 'one-on-one':
      return 'mprio-day-schedule__accent--one-on-one';
    default:
      return 'mprio-day-schedule__accent--internal';
  }
}

function getItemClass(block: CeoDayBlock): string {
  return `mprio-day-schedule__item mprio-day-schedule__item--${block.kind}`;
}

function getMeetingBadge(meeting: CeoMeetingItem): string | null {
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

function getScheduleBadge(
  block: CeoDayBlock,
  meeting?: CeoMeetingItem
): { label: string; className: string } | null {
  if (block.kind === 'meeting' && meeting) {
    const label = getMeetingBadge(meeting);
    if (!label) {
      return null;
    }

    if (meeting.priority === 'critical') {
      return { label, className: 'mprio-day-schedule__badge--critical' };
    }
    if (meeting.listBadge === '1:1' || meeting.type === 'one-on-one') {
      return { label, className: 'mprio-day-schedule__badge--one-on-one' };
    }
    if (meeting.listBadge === 'Internal' || block.meetingType === 'internal') {
      return { label, className: 'mprio-day-schedule__badge--internal' };
    }
    if (block.meetingType === 'leadership' || block.meetingType === 'board') {
      return { label, className: 'mprio-day-schedule__badge--board' };
    }
    return { label, className: 'mprio-day-schedule__badge--high' };
  }

  switch (block.kind as CeoDayBlockKind) {
    case 'focus':
      return { label: 'Focus', className: 'mprio-day-schedule__badge--focus' };
    case 'admin':
      return { label: 'Admin', className: 'mprio-day-schedule__badge--admin' };
    case 'free':
      return { label: 'Free', className: 'mprio-day-schedule__badge--free' };
    default:
      return null;
  }
}

function useListScrollFade<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [showFade, setShowFade] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return undefined;
    }

    const update = () => {
      const hasOverflow = el.scrollHeight > el.clientHeight + 2;
      const notAtBottom = el.scrollTop + el.clientHeight < el.scrollHeight - 2;
      setShowFade(hasOverflow && notAtBottom);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    el.addEventListener('scroll', update, { passive: true });

    return () => {
      observer.disconnect();
      el.removeEventListener('scroll', update);
    };
  }, []);

  return { ref, showFade };
}

interface PrioritiesMeetingsPanelProps {
  cellClass?: string;
}

export const PrioritiesMeetingsPanel: React.FC<PrioritiesMeetingsPanelProps> = ({
  cellClass = 'mprio-cell--meetings'
}) => {
  const { dayBlocks, meetings, totalMeetings, meetingHours, focusHours } = ceoDashboardData.schedule;
  const { ref, showFade } = useListScrollFade<HTMLUListElement>();

  return (
    <article className={`eto-widget mprio-day-schedule ${cellClass}`}>
      <header className="eto-widget__head">
        <CalendarDays size={16} aria-hidden="true" />
        <h3 className="eto-widget__title">Today&apos;s Schedule</h3>
        <span className="eto-widget__tab">
          {totalMeetings} meetings · {meetingHours}h · {focusHours}h focus
        </span>
      </header>

      <div className={`mprio-section-panel__scroll${showFade ? ' mprio-section-panel__scroll--fade' : ''}`}>
        <ul ref={ref} className="mprio-day-schedule__list" aria-label="Today's schedule">
          {dayBlocks.map((block, index) => {
            const meeting = findMeetingForBlock(block, meetings);
            const badge = getScheduleBadge(block, meeting);
            const isLast = index === dayBlocks.length - 1;

            return (
              <li key={block.id} className={getItemClass(block)}>
                <div className="mprio-day-schedule__time">
                  <span className="mprio-day-schedule__time-start">{block.startTime}</span>
                  <span className="mprio-day-schedule__time-end">{block.endTime}</span>
                </div>

                <div
                  className={`mprio-day-schedule__rail${isLast ? ' mprio-day-schedule__rail--last' : ''}`}
                  aria-hidden="true"
                >
                  <span className={`mprio-day-schedule__dot ${getAccentClass(block)}`} />
                  {!isLast && <span className="mprio-day-schedule__line" />}
                </div>

                <div className="mprio-day-schedule__card">
                  <span
                    className={`mprio-day-schedule__accent ${getAccentClass(block)}`}
                    aria-hidden="true"
                  />
                  <div className="mprio-day-schedule__body">
                    <div className="mprio-day-schedule__head">
                      <span className="mprio-day-schedule__title">{block.title}</span>
                      {badge && (
                        <span className={`mprio-day-schedule__badge ${badge.className}`}>
                          {badge.label}
                        </span>
                      )}
                    </div>
                    <p className="mprio-day-schedule__meta">{getKindMeta(block, meeting)}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </article>
  );
};
