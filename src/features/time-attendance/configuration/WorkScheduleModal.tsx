import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useSchedulesConfigStore } from '../../../store/schedulesConfigStore';
import {
  COUNTRY_OPTIONS,
  EMPTY_FORM_VALUES,
  WEEKDAY_LABELS,
  type WeekdayIndex,
  type WorkHourType,
  type WorkScheduleFormValues
} from './schedulesConfigTypes';
import { ScheduleAssignmentFields } from './ScheduleAssignmentFields';

interface WorkScheduleModalProps {
  onClose: () => void;
}

export const WorkScheduleModal: React.FC<WorkScheduleModalProps> = ({ onClose }) => {
  const { form, schedules, saveSchedule } = useSchedulesConfigStore();
  const existing = form.scheduleId ? schedules.find(s => s.id === form.scheduleId) : null;
  const isEdit = form.mode === 'edit';
  const hasExistingDefault = schedules.some(s => s.isDefault && s.id !== form.scheduleId);

  const [values, setValues] = useState<WorkScheduleFormValues>(EMPTY_FORM_VALUES());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && existing) {
      setValues({
        title: existing.title,
        countryCode: existing.countryCode,
        workdays: [...existing.workdays],
        workHourType: existing.workHourType,
        startTime: existing.startTime ?? '09:00',
        endTime: existing.endTime ?? '17:00',
        flexibleHours: String(existing.flexibleHours ?? 7),
        flexibleMinutes: String(existing.flexibleMinutes ?? 30),
        assignmentTarget: existing.assignmentTarget,
        departmentIds: [...existing.departmentIds],
        employeeIds: [...existing.employeeIds],
        isDefault: existing.isDefault
      });
    } else {
      setValues(EMPTY_FORM_VALUES());
    }
    setError(null);
  }, [isEdit, existing, form]);

  const set = <K extends keyof WorkScheduleFormValues>(key: K, val: WorkScheduleFormValues[K]) => {
    setValues(prev => ({ ...prev, [key]: val }));
  };

  const toggleWorkday = (day: WeekdayIndex) => {
    setValues(prev => {
      const selected = prev.workdays.includes(day);
      const workdays = selected
        ? prev.workdays.filter(d => d !== day)
        : [...prev.workdays, day].sort((a, b) => a - b);
      return { ...prev, workdays: workdays as WeekdayIndex[] };
    });
  };

  const handleSave = () => {
    const result = saveSchedule(values);
    if (!result.ok) {
      setError(result.error ?? 'Unable to save work schedule.');
      return;
    }
    onClose();
  };

  return (
    <div className="schedules-cfg-modal-overlay" onClick={onClose}>
      <div
        className="schedules-cfg-modal"
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Edit work schedule' : 'Create work schedule'}
        onClick={e => e.stopPropagation()}
      >
        <header className="schedules-cfg-modal__header">
          <h2>{isEdit ? 'Edit Work Schedule' : 'Create Work Schedule'}</h2>
          <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="schedules-cfg-modal__body">
          {error && <p className="schedules-cfg-form-error">{error}</p>}

          <div className="org-form-field">
            <label>Title</label>
            <input
              value={values.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Work schedule title"
            />
          </div>

          <div className="org-form-field">
            <label>Public holiday calendar</label>
            <p className="schedules-cfg-field-hint">
              Holiday data is sourced from the selected country calendar.
            </p>
            <select value={values.countryCode} onChange={e => set('countryCode', e.target.value)}>
              <option value="">Select a country</option>
              {COUNTRY_OPTIONS.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="org-form-field">
            <label>Workdays</label>
            <p className="schedules-cfg-field-hint">
              Select the days employees are expected to work under this schedule.
            </p>
            <div className="schedules-cfg-day-picker" role="group" aria-label="Workdays">
              {WEEKDAY_LABELS.map((label, index) => {
                const day = index as WeekdayIndex;
                const selected = values.workdays.includes(day);
                return (
                  <button
                    key={label}
                    type="button"
                    className={`schedules-cfg-day-btn${selected ? ' schedules-cfg-day-btn--selected' : ''}`}
                    aria-pressed={selected}
                    onClick={() => toggleWorkday(day)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <ScheduleAssignmentFields
            assignmentTarget={values.assignmentTarget}
            departmentIds={values.departmentIds}
            employeeIds={values.employeeIds}
            onTargetChange={target => set('assignmentTarget', target)}
            onDepartmentIdsChange={ids => set('departmentIds', ids)}
            onEmployeeIdsChange={ids => set('employeeIds', ids)}
          />

          <div className="schedules-cfg-form-section">
            <label className="schedules-cfg-form-section__label">Setup work hour</label>
            <div className="schedules-cfg-radio-group">
              <label className="schedules-cfg-radio">
                <input
                  type="radio"
                  name="workHourType"
                  checked={values.workHourType === 'fixed'}
                  onChange={() => set('workHourType', 'fixed' as WorkHourType)}
                />
                Fixed work hour
              </label>
              <label className="schedules-cfg-radio">
                <input
                  type="radio"
                  name="workHourType"
                  checked={values.workHourType === 'flexible'}
                  onChange={() => set('workHourType', 'flexible' as WorkHourType)}
                />
                Flexible work hour
              </label>
            </div>

            {values.workHourType === 'fixed' ? (
              <div className="schedules-cfg-work-time">
                <span className="schedules-cfg-work-time__label">Work time (24 hour format)</span>
                <div className="schedules-cfg-field-row">
                  <div className="org-form-field">
                    <label>Start time</label>
                    <input
                      type="time"
                      value={values.startTime}
                      onChange={e => set('startTime', e.target.value)}
                    />
                  </div>
                  <div className="org-form-field">
                    <label>End time</label>
                    <input
                      type="time"
                      value={values.endTime}
                      onChange={e => set('endTime', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="schedules-cfg-work-time">
                <span className="schedules-cfg-work-time__label">Daily duration (hours:minutes)</span>
                <div className="schedules-cfg-field-row">
                  <div className="org-form-field">
                    <label>Hours</label>
                    <input
                      type="number"
                      min={0}
                      value={values.flexibleHours}
                      onChange={e => set('flexibleHours', e.target.value)}
                    />
                  </div>
                  <div className="org-form-field">
                    <label>Minutes</label>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={values.flexibleMinutes}
                      onChange={e => set('flexibleMinutes', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="schedules-cfg-default-block">
            <label className="leave-cfg-toggle">
              <input
                type="checkbox"
                checked={values.isDefault}
                onChange={e => set('isDefault', e.target.checked)}
              />
              Default for new employee
            </label>
            {values.isDefault && hasExistingDefault && (
              <p className="schedules-cfg-warning">
                Setting this schedule as the default will override the existing default schedule.
              </p>
            )}
          </div>
        </div>

        <footer className="schedules-cfg-modal__footer">
          <button type="button" className="org-btn org-btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="org-btn org-btn--primary" onClick={handleSave}>
            {isEdit ? 'Save Changes' : 'Create Schedule'}
          </button>
        </footer>
      </div>
    </div>
  );
};
