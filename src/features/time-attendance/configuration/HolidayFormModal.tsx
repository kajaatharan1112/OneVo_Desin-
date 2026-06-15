import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useSchedulesConfigStore } from '../../../store/schedulesConfigStore';
import { HolidayDatePicker, holidayDateLabel } from './HolidayDatePicker';
import {
  EMPTY_HOLIDAY_FORM,
  type HolidayFormValues,
  type HolidayType
} from './schedulesConfigTypes';
import { isHolidayFormValid } from './schedulesConfigUtils';

interface HolidayFormModalProps {
  countryName: string;
}

export const HolidayFormModal: React.FC<HolidayFormModalProps> = ({ countryName }) => {
  const { holidayFormModal, holidays, closeHolidayForm, saveHoliday } = useSchedulesConfigStore();
  const existing = holidayFormModal.holidayId
    ? holidays.find(h => h.id === holidayFormModal.holidayId)
    : null;
  const isEdit = holidayFormModal.mode === 'edit';

  const [values, setValues] = useState<HolidayFormValues>(EMPTY_HOLIDAY_FORM());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && existing) {
      setValues({
        title: existing.title,
        type: existing.type,
        startDate: existing.startDate,
        endDate: existing.endDate
      });
    } else {
      setValues(EMPTY_HOLIDAY_FORM());
    }
    setError(null);
  }, [isEdit, existing, holidayFormModal]);

  const set = <K extends keyof HolidayFormValues>(key: K, val: HolidayFormValues[K]) => {
    setValues(prev => {
      const next = { ...prev, [key]: val };
      if (key === 'type' && val === 'single') {
        next.endDate = next.startDate;
      }
      return next;
    });
  };

  const handleTypeChange = (type: HolidayType) => {
    setValues(prev => ({
      ...prev,
      type,
      endDate: type === 'single' ? prev.startDate : prev.endDate
    }));
  };

  const handleDateChange = (startDate: string, endDate: string) => {
    setValues(prev => ({
      ...prev,
      startDate,
      endDate: prev.type === 'single' ? startDate : endDate
    }));
  };

  const canSubmit = isHolidayFormValid(values);

  const handleSave = () => {
    const result = saveHoliday(values);
    if (!result.ok) {
      setError(result.error ?? 'Unable to save holiday.');
    }
  };

  const dateLabel = holidayDateLabel(values.type, values.startDate, values.endDate);

  return (
    <div className="schedules-cfg-modal-overlay schedules-cfg-modal-overlay--holiday-form" onClick={closeHolidayForm}>
      <div
        className="schedules-cfg-modal schedules-cfg-holiday-form-modal"
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? `Edit holiday for ${countryName}` : `Add holiday for ${countryName}`}
        onClick={e => e.stopPropagation()}
      >
        <header className="schedules-cfg-modal__header">
          <h2>{isEdit ? `Edit holiday for ${countryName}` : `Add holiday for ${countryName}`}</h2>
          <button type="button" className="org-slideover__close" onClick={closeHolidayForm} aria-label="Close">
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
              placeholder="holiday title"
            />
          </div>

          <div className="org-form-field">
            <label>Holiday Type</label>
            <div className="schedules-cfg-radio-group">
              <label className="schedules-cfg-radio">
                <input
                  type="radio"
                  name="holidayType"
                  checked={values.type === 'single'}
                  onChange={() => handleTypeChange('single')}
                />
                Single day
              </label>
              <label className="schedules-cfg-radio">
                <input
                  type="radio"
                  name="holidayType"
                  checked={values.type === 'multiple'}
                  onChange={() => handleTypeChange('multiple')}
                />
                Multiple days
              </label>
            </div>
          </div>

          <div className="org-form-field">
            <label>{dateLabel}</label>
            <HolidayDatePicker
              mode={values.type}
              startDate={values.startDate}
              endDate={values.endDate}
              onChange={handleDateChange}
              placeholder="Pick date"
            />
          </div>
        </div>

        <footer className="schedules-cfg-modal__footer">
          <button type="button" className="org-btn org-btn--secondary" onClick={closeHolidayForm}>
            Cancel
          </button>
          <button
            type="button"
            className="org-btn org-btn--primary"
            onClick={handleSave}
            disabled={!canSubmit}
          >
            {isEdit ? 'Save Changes' : 'Add'}
          </button>
        </footer>
      </div>
    </div>
  );
};
