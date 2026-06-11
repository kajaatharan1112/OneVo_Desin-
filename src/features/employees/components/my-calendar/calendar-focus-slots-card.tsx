import React from 'react';
import { Sparkles } from 'lucide-react';
import type { CalendarFocusSlot, CalendarSyncStatus } from '../../types/employee-calendar.types';
import { CalendarSyncCompact } from './calendar-sync-compact';

interface CalendarFocusSlotsCardProps {
  slots: CalendarFocusSlot[];
  bestFocusSlot: string;
  sync: CalendarSyncStatus;
  className?: string;
}

export const CalendarFocusSlotsCard: React.FC<CalendarFocusSlotsCardProps> = ({
  slots,
  bestFocusSlot,
  sync,
  className = ''
}) => {
  return (
    <article
      className={`emc-widget emc-focus-slots-card ${className}`.trim()}
      aria-label="Free focus slots"
    >
      <header className="emc-widget__head">
        <Sparkles size={15} aria-hidden="true" />
        <h3 className="emc-widget__title">Focus Slots</h3>
      </header>
      <p className="emc-focus-slots-card__best">Best focus: {bestFocusSlot}</p>
      <ul className="emc-focus-slots-card__list">
        {slots.map((slot) => (
          <li key={slot.id} className="emc-focus-slots-card__item">
            <span className="emc-focus-slots-card__time">{slot.time}</span>
            <span className="emc-focus-slots-card__note">{slot.note}</span>
          </li>
        ))}
      </ul>
      <CalendarSyncCompact sync={sync} />
    </article>
  );
};
