import React from 'react';
import { CalendarDays, Cake, FileText, Bell, Video } from 'lucide-react';
import { todayActions } from '../../../data/employee-task-overview.data';
import type { TodayActionItem } from '../../../data/employee-task-overview.data';

const kindIcons: Record<TodayActionItem['kind'], React.ReactNode> = {
  birthday: <Cake size={14} />,
  meeting: <Video size={14} />,
  reminder: <Bell size={14} />,
  report: <FileText size={14} />
};

export const TodayPanel: React.FC = () => {
  return (
    <article className="eto-widget eto-today eto-cell--today">
      <header className="eto-widget__head eto-today__head">
        <CalendarDays size={16} aria-hidden="true" />
        <div>
          <h3 className="eto-widget__title">Today</h3>
        </div>
      </header>
      <ul className="eto-today__list">
        {todayActions.map((action) => (
          <li key={action.id} className="eto-today__item">
            <span className="eto-today__icon" aria-hidden="true">
              {kindIcons[action.kind]}
            </span>
            <div className="eto-today__copy">
              <span className="eto-today__label">{action.label}</span>
              {action.time && <span className="eto-today__time">{action.time}</span>}
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
};
