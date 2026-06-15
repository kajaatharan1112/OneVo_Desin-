import React, { useMemo } from 'react';
import { Plus, X, Edit, Trash2 } from 'lucide-react';
import { useSchedulesConfigStore } from '../../../store/schedulesConfigStore';
import { formatHolidayDateRange, formatHolidayFoundCount } from './schedulesConfigUtils';
import { HolidayFormModal } from './HolidayFormModal';
import { DeleteHolidayModal } from './DeleteHolidayModal';

export const HolidayListModal: React.FC = () => {
  const {
    holidayCalendars,
    holidays,
    holidayListModal,
    holidayFormModal,
    holidayDeleteModal,
    selectedHolidayIds,
    closeHolidayList,
    openAddHoliday,
    openEditHoliday,
    openDeleteHoliday,
    toggleHolidaySelection,
    toggleAllHolidaySelection
  } = useSchedulesConfigStore();

  const calendar = holidayCalendars.find(c => c.id === holidayListModal.calendarId);
  const calendarHolidays = useMemo(
    () => (calendar ? holidays.filter(h => h.calendarId === calendar.id) : []),
    [holidays, calendar]
  );

  if (!holidayListModal.open || !calendar) return null;

  const allSelected =
    calendarHolidays.length > 0 &&
    calendarHolidays.every(h => selectedHolidayIds.includes(h.id));

  return (
    <>
      <div
        className="schedules-cfg-modal-overlay schedules-cfg-modal-overlay--holiday-list"
        onClick={closeHolidayList}
      >
        <div
          className="schedules-cfg-modal schedules-cfg-holiday-list-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`${calendar.countryName} public holidays`}
          onClick={e => e.stopPropagation()}
        >
          <header className="schedules-cfg-modal__header">
            <h2>{calendar.countryName} public holidays</h2>
            <button type="button" className="org-slideover__close" onClick={closeHolidayList} aria-label="Close">
              <X size={18} />
            </button>
          </header>

          <div className="schedules-cfg-holiday-list__toolbar">
            <span className="schedules-cfg-holiday-list__count">
              {formatHolidayFoundCount(calendarHolidays.length)}
            </span>
            <button type="button" className="org-btn org-btn--primary org-btn--sm" onClick={openAddHoliday}>
              <Plus size={13} /> Add holiday
            </button>
          </div>

          <div className="schedules-cfg-holiday-list__body">
            <div className="cfg-table-wrap schedules-cfg-holiday-table-wrap">
              <table className="cfg-table schedules-cfg-holiday-table">
                <thead>
                  <tr>
                    <th className="schedules-cfg-holiday-table__check">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={() => toggleAllHolidaySelection(calendarHolidays.map(h => h.id))}
                        aria-label="Select all holidays"
                      />
                    </th>
                    <th>Holiday info</th>
                    <th>Date</th>
                    <th>Uploaded by</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {calendarHolidays.map(holiday => (
                    <tr key={holiday.id}>
                      <td className="schedules-cfg-holiday-table__check">
                        <input
                          type="checkbox"
                          checked={selectedHolidayIds.includes(holiday.id)}
                          onChange={() => toggleHolidaySelection(holiday.id)}
                          aria-label={`Select ${holiday.title}`}
                        />
                      </td>
                      <td>
                        <div className="cfg-table__name">{holiday.title}</div>
                      </td>
                      <td>
                        {formatHolidayDateRange(holiday.type, holiday.startDate, holiday.endDate)}
                      </td>
                      <td>{holiday.uploadedBy}</td>
                      <td>
                        <div className="cfg-row-actions">
                          <button
                            type="button"
                            className="cfg-action-btn cfg-action-btn--icon"
                            onClick={() => openEditHoliday(holiday.id)}
                            aria-label={`Edit ${holiday.title}`}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            type="button"
                            className="cfg-action-btn cfg-action-btn--icon cfg-action-btn--danger"
                            onClick={() => openDeleteHoliday(holiday.id)}
                            aria-label={`Delete ${holiday.title}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {holidayFormModal.open && <HolidayFormModal countryName={calendar.countryName} />}
      {holidayDeleteModal.open && <DeleteHolidayModal />}
    </>
  );
};
