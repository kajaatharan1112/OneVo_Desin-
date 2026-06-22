import React, { useMemo, useState } from 'react';
import { Plus, Edit, Trash2, ChevronRight, CalendarDays } from 'lucide-react';
import { ConfigShellHeader } from '../../../shared/components/config-shell-header/ConfigShellHeader';
import { useSchedulesConfigStore } from '../../../store/schedulesConfigStore';
import {
  formatAssignedCount,
  formatBreakTime,
  formatCreatedDate,
  formatHolidayCount,
  formatWorkdays,
  formatWorkTime
} from './schedulesConfigUtils';
import { WorkScheduleModal } from './WorkScheduleModal';
import { HolidayListModal } from './HolidayListModal';
import { ScheduleAssignmentModal } from './ScheduleAssignmentModal';
import { SchedulesConfigToast } from './SchedulesConfigToast';

export const SchedulesPage: React.FC = () => {
  const {
    schedules,
    form,
    holidayListModal,
    assignmentModal,
    openCreateSchedule,
    openEditSchedule,
    closeForm,
    deleteSchedule,
    openHolidayList,
    openAssignmentModal
  } = useSchedulesConfigStore();
  const [search, setSearch] = useState('');

  const filteredSchedules = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return schedules;
    return schedules.filter(schedule =>
      [
        schedule.title,
        schedule.countryName,
        formatWorkdays(schedule.workdays),
        formatWorkTime(schedule),
        formatBreakTime(schedule)
      ].some(value => value.toLowerCase().includes(q))
    );
  }, [schedules, search]);

  return (
    <div className="cfg-page">
      <ConfigShellHeader
        title="Schedules"
        icon={<CalendarDays size={15} />}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: 'Search schedules...',
          label: 'Search schedules'
        }}
        actions={
          <button type="button" className="org-btn org-btn--primary" onClick={openCreateSchedule}>
            <Plus size={14} /> Create Work Schedule
          </button>
        }
      />

      <div className="cfg-page__body">
        <div className="cfg-table-wrap">
          <table className="cfg-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Workdays</th>
                <th>Work time</th>
                <th>Break</th>
                <th>Assigned</th>
                <th>Holidays</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.map(schedule => (
                <tr key={schedule.id}>
                  <td>
                    <div className="schedules-cfg-name-cell">
                      <div className="schedules-cfg-name-row">
                        <span className="cfg-table__name">{schedule.title}</span>
                        {schedule.isDefault && (
                          <span className="cfg-badge cfg-badge--active">Default</span>
                        )}
                      </div>
                      <div className="cfg-table__meta">{schedule.countryName}</div>
                    </div>
                  </td>
                  <td>{formatWorkdays(schedule.workdays)}</td>
                  <td>{formatWorkTime(schedule)}</td>
                  <td>{formatBreakTime(schedule)}</td>
                  <td>
                    <button
                      type="button"
                      className="schedules-cfg-link-cell"
                      onClick={() => openAssignmentModal(schedule.id)}
                    >
                      <span>{formatAssignedCount(schedule.assignedCount)}</span>
                      <ChevronRight size={14} />
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="schedules-cfg-link-cell"
                      onClick={() => openHolidayList(schedule.id)}
                    >
                      <span>{formatHolidayCount(schedule.holidayCount)}</span>
                      <ChevronRight size={14} />
                    </button>
                  </td>
                  <td>{formatCreatedDate(schedule.createdAt)}</td>
                  <td>
                    <div className="cfg-row-actions">
                      <button
                        type="button"
                        className="cfg-action-btn cfg-action-btn--icon"
                        onClick={() => openEditSchedule(schedule.id)}
                        aria-label={`Edit ${schedule.title}`}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        type="button"
                        className="cfg-action-btn cfg-action-btn--icon cfg-action-btn--danger"
                        onClick={() => {
                          if (window.confirm(`Delete "${schedule.title}"?`)) deleteSchedule(schedule.id);
                        }}
                        aria-label={`Delete ${schedule.title}`}
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

      {form.open && <WorkScheduleModal onClose={closeForm} />}
      {assignmentModal.open && <ScheduleAssignmentModal />}
      {holidayListModal.open && <HolidayListModal />}
      <SchedulesConfigToast />
    </div>
  );
};
