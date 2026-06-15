import React from 'react';
import { Plus, Edit, RefreshCw, Eye, ChevronRight } from 'lucide-react';
import { useSchedulesConfigStore } from '../../../store/schedulesConfigStore';
import { formatHolidayCount, formatLastSynced } from './schedulesConfigUtils';
import { HolidayListModal } from './HolidayListModal';
import { HolidayCalendarFormModal } from './HolidayCalendarFormModal';
import { SchedulesConfigToast } from './SchedulesConfigToast';

export const HolidayCalendarPage: React.FC = () => {
  const {
    holidayCalendars,
    holidayListModal,
    calendarForm,
    openCreateCalendar,
    openEditCalendar,
    openHolidayListByCalendar,
    openAddHoliday,
    syncCalendarHolidays
  } = useSchedulesConfigStore();

  const handleAddHoliday = (calendarId: string) => {
    openHolidayListByCalendar(calendarId);
    openAddHoliday();
  };

  return (
    <div className="cfg-page">
      <div className="cfg-page__header">
        <div>
          <h1 className="cfg-page__title">Holiday Calendar</h1>
          <p className="cfg-page__subtitle">
            Manage public and company holidays used by work schedules.
          </p>
        </div>
        <button type="button" className="org-btn org-btn--primary" onClick={openCreateCalendar}>
          <Plus size={14} /> Add Holiday Calendar
        </button>
      </div>

      <div className="cfg-page__body">
        <div className="cfg-table-wrap">
          <table className="cfg-table">
            <thead>
              <tr>
                <th>Calendar</th>
                <th>Country</th>
                <th>Holidays</th>
                <th>Source</th>
                <th>Last Synced</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {holidayCalendars.map(calendar => (
                <tr key={calendar.id}>
                  <td><div className="cfg-table__name">{calendar.name}</div></td>
                  <td>{calendar.countryName}</td>
                  <td>
                    <button
                      type="button"
                      className="schedules-cfg-link-cell"
                      onClick={() => openHolidayListByCalendar(calendar.id)}
                    >
                      <span>{formatHolidayCount(calendar.holidayCount)}</span>
                      <ChevronRight size={14} />
                    </button>
                  </td>
                  <td>{calendar.sourceLabel}</td>
                  <td>{formatLastSynced(calendar.lastSynced)}</td>
                  <td>
                    <span className={`cfg-badge cfg-badge--${calendar.status}`}>{calendar.status}</span>
                  </td>
                  <td>
                    <div className="cfg-row-actions cfg-row-actions--labeled schedules-cfg-calendar-actions">
                      <button
                        type="button"
                        className="cfg-action-btn"
                        onClick={() => openHolidayListByCalendar(calendar.id)}
                      >
                        <Eye size={13} /> View holidays
                      </button>
                      <button
                        type="button"
                        className="cfg-action-btn"
                        onClick={() => syncCalendarHolidays(calendar.id)}
                      >
                        <RefreshCw size={13} /> Sync holidays
                      </button>
                      <button
                        type="button"
                        className="cfg-action-btn"
                        onClick={() => handleAddHoliday(calendar.id)}
                      >
                        <Plus size={13} /> Add holiday
                      </button>
                      <button
                        type="button"
                        className="cfg-action-btn"
                        onClick={() => openEditCalendar(calendar.id)}
                      >
                        <Edit size={13} /> Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {holidayListModal.open && <HolidayListModal />}
      {calendarForm.open && <HolidayCalendarFormModal />}
      <SchedulesConfigToast />
    </div>
  );
};
