import React from 'react';
import { Search } from 'lucide-react';
import type { CalendarEventType } from '../../types/employee-calendar.types';
import { EVENT_TYPE_LABEL } from './EventDetailsModal';

const TYPE_ORDER: CalendarEventType[] = ['shift', 'meeting', 'leave', 'holiday', 'reminder', 'training', 'out-of-office', 'company-event'];

interface CalendarFilterPanelProps {
  enabledTypes: Set<CalendarEventType>;
  onToggleType: (type: CalendarEventType) => void;
  onClearTypes: () => void;
  onSelectAllTypes: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const CalendarFilterPanel: React.FC<CalendarFilterPanelProps> = ({
  enabledTypes, onToggleType, onClearTypes, onSelectAllTypes, searchQuery, onSearchChange
}) => {
  const allCleared = enabledTypes.size === 0;
  return (
    <div className="emc-filterpanel" role="dialog" aria-label="Filter events">
      <div className="emc-filterpanel__search">
        <Search size={13} className="emc-filterpanel__search-icon" />
        <input
          type="text"
          placeholder="Search events…"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>

      <div className="emc-filterpanel__head">
        <span className="emc-filterpanel__head-label">Event type</span>
        <button
          type="button"
          className="emc-filterpanel__clear"
          onClick={allCleared ? onSelectAllTypes : onClearTypes}
        >
          {allCleared ? 'Select all' : 'Clear all'}
        </button>
      </div>

      <div className="emc-filterpanel__types">
        {TYPE_ORDER.map(type => (
          <label key={type} className="emc-filterpanel__type">
            <input
              type="checkbox"
              checked={enabledTypes.has(type)}
              onChange={() => onToggleType(type)}
            />
            <span className={`emc-filterpanel__swatch emc-evpill--${type}`} />
            <span className="emc-filterpanel__type-label">{EVENT_TYPE_LABEL[type]}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
