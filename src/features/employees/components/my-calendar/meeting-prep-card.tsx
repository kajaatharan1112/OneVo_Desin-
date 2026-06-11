import React from 'react';
import { ListChecks } from 'lucide-react';
import type { CalendarMeetingPrep } from '../../types/employee-calendar.types';

interface MeetingPrepCardProps {
  prep: CalendarMeetingPrep;
  className?: string;
}

export const MeetingPrepCard: React.FC<MeetingPrepCardProps> = ({ prep, className = '' }) => {
  return (
    <article
      className={`emc-widget emc-meeting-prep ${className}`.trim()}
      aria-label="Meeting preparation"
    >
      <header className="emc-widget__head">
        <ListChecks size={15} aria-hidden="true" />
        <h3 className="emc-widget__title">Meeting Prep</h3>
      </header>
      <div className="emc-meeting-prep__summary">
        <span className="emc-meeting-prep__meeting">{prep.title}</span>
        <time className="emc-meeting-prep__time" dateTime={prep.time}>
          {prep.time}
        </time>
      </div>
      <ul className="emc-meeting-prep__list">
        {prep.items.map((item) => (
          <li key={item} className="emc-meeting-prep__item">
            <span className="emc-meeting-prep__check" aria-hidden="true" />
            <span className="emc-meeting-prep__text">{item}</span>
          </li>
        ))}
      </ul>
      <button type="button" className="emc-btn emc-btn--primary emc-btn--compact emc-meeting-prep__cta">
        Open prep checklist
      </button>
    </article>
  );
};
