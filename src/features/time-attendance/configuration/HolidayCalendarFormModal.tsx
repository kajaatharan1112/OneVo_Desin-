import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useSchedulesConfigStore } from '../../../store/schedulesConfigStore';
import {
  COUNTRY_OPTIONS,
  EMPTY_HOLIDAY_CALENDAR_FORM,
  HOLIDAY_SOURCE_OPTIONS,
  type ConfigStatus,
  type HolidayCalendarFormValues,
  type HolidayCalendarSource
} from './schedulesConfigTypes';
import { validateHolidayCalendarForm } from './schedulesConfigUtils';

export const HolidayCalendarFormModal: React.FC = () => {
  const { calendarForm, holidayCalendars, closeCalendarForm, saveCalendar } =
    useSchedulesConfigStore();
  const existing = calendarForm.calendarId
    ? holidayCalendars.find(c => c.id === calendarForm.calendarId)
    : null;
  const isEdit = calendarForm.mode === 'edit';

  const [values, setValues] = useState<HolidayCalendarFormValues>(EMPTY_HOLIDAY_CALENDAR_FORM());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && existing) {
      setValues({
        name: existing.name,
        countryCode: existing.countryCode,
        source: existing.source,
        status: existing.status
      });
    } else {
      setValues(EMPTY_HOLIDAY_CALENDAR_FORM());
    }
    setError(null);
  }, [isEdit, existing, calendarForm]);

  const handleSave = () => {
    const validationError = validateHolidayCalendarForm(values);
    if (validationError) {
      setError(validationError);
      return;
    }
    const result = saveCalendar(values);
    if (!result.ok) {
      setError(result.error ?? 'Unable to save holiday calendar.');
    }
  };

  if (!calendarForm.open) return null;

  return (
    <div className="schedules-cfg-modal-overlay" onClick={closeCalendarForm}>
      <div
        className="schedules-cfg-modal"
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Edit holiday calendar' : 'Add holiday calendar'}
        onClick={e => e.stopPropagation()}
      >
        <header className="schedules-cfg-modal__header">
          <h2>{isEdit ? 'Edit Holiday Calendar' : 'Add Holiday Calendar'}</h2>
          <button type="button" className="org-slideover__close" onClick={closeCalendarForm} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="schedules-cfg-modal__body">
          {error && <p className="schedules-cfg-form-error">{error}</p>}

          <div className="org-form-field">
            <label>Calendar Name</label>
            <input
              value={values.name}
              onChange={e => setValues(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. United States"
            />
          </div>

          <div className="org-form-field">
            <label>Country</label>
            <select
              value={values.countryCode}
              onChange={e => setValues(prev => ({ ...prev, countryCode: e.target.value }))}
            >
              <option value="">Select a country</option>
              {COUNTRY_OPTIONS.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="org-form-field">
            <label>Source</label>
            <select
              value={values.source}
              onChange={e =>
                setValues(prev => ({ ...prev, source: e.target.value as HolidayCalendarSource }))
              }
            >
              {HOLIDAY_SOURCE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="org-form-field">
            <label>Status</label>
            <select
              value={values.status}
              onChange={e => setValues(prev => ({ ...prev, status: e.target.value as ConfigStatus }))}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <footer className="schedules-cfg-modal__footer">
          <button type="button" className="org-btn org-btn--secondary" onClick={closeCalendarForm}>
            Cancel
          </button>
          <button type="button" className="org-btn org-btn--primary" onClick={handleSave}>
            {isEdit ? 'Save Changes' : 'Create Calendar'}
          </button>
        </footer>
      </div>
    </div>
  );
};
