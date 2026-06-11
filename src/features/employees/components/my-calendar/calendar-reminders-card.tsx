import React from 'react';
import { Bell } from 'lucide-react';
import type { CalendarReminder } from '../../types/employee-calendar.types';

interface CalendarRemindersCardProps {
  reminders: CalendarReminder[];
  className?: string;
}

export const CalendarRemindersCard: React.FC<CalendarRemindersCardProps> = ({
  reminders,
  className = ''
}) => {
  return (
    <article
      className={`emc-widget emc-reminders ${className}`.trim()}
      aria-label="Reminders"
    >
      <header className="emc-widget__head">
        <Bell size={15} aria-hidden="true" />
        <h3 className="emc-widget__title">Reminders</h3>
      </header>
      <ul className="emc-reminders__list">
        {reminders.map((reminder) => (
          <li key={reminder.id} className="emc-reminders__item">
            <div className="emc-reminders__copy">
              <span className="emc-reminders__title">{reminder.title}</span>
              <span className="emc-reminders__due">Due {reminder.due}</span>
            </div>
            <button type="button" className="emc-btn emc-btn--ghost emc-btn--compact">
              {reminder.action}
            </button>
          </li>
        ))}
      </ul>
    </article>
  );
};
