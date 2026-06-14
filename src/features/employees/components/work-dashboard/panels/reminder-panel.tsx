import React from 'react';
import { CalendarClock, Cake, FileText, GraduationCap, Sparkles } from 'lucide-react';
import type { WorkDashboardReminder } from '../../../data/work-dashboard.data';
import { WorkDashboardPanel } from '../work-dashboard-panel';

interface ReminderPanelProps {
  items: WorkDashboardReminder[];
}

function reminderIcon(type: WorkDashboardReminder['type']) {
  switch (type) {
    case 'birthday': return Cake;
    case 'report':   return FileText;
    case 'knowledge': return GraduationCap;
    case 'update':   return Sparkles;
    default:         return CalendarClock;
  }
}

export const ReminderPanel: React.FC<ReminderPanelProps> = ({ items }) => (
  <WorkDashboardPanel title="Today" className="work-dashboard__reminder">
    <ul className="wd-row-list work-dashboard-scroll" aria-label="Today's reminders">
      {items.map((item) => {
        const Icon = reminderIcon(item.type);
        return (
          <li key={item.id} className="wd-reminder-row">
            <span className="wd-reminder-row__icon" aria-hidden="true">
              <Icon size={13} />
            </span>
            <span className="wd-row__body">
              <span className="wd-row__title">{item.title}</span>
              <span className="wd-row__meta">{item.timeLabel}</span>
            </span>
          </li>
        );
      })}
    </ul>
  </WorkDashboardPanel>
);
