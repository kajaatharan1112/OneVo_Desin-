import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { CalendarEvent } from '../../types/employee-calendar.types';
import {
  EMPTY_NEW_EVENT_FORM,
  type NewEventFormState,
  type NewEventType,
} from './new-event-wizard.utils';

const STEPS = ['Details', 'Schedule', 'More info', 'Reminders & repeat', 'Review'] as const;

const TYPE_OPTIONS: { value: NewEventType; label: string }[] = [
  { value: 'leave', label: 'Leave' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'holiday', label: 'Company event' },
];

interface NewEventWizardProps {
  onClose: () => void;
  onCreate: (events: CalendarEvent[]) => void;
  existingMyEvents: CalendarEvent[];
}

export const NewEventWizard: React.FC<NewEventWizardProps> = ({ onClose, onCreate, existingMyEvents }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<NewEventFormState>(EMPTY_NEW_EVENT_FORM);
  const [stepError, setStepError] = useState<string | null>(null);

  const update = (patch: Partial<NewEventFormState>) => setForm(f => ({ ...f, ...patch }));

  const validateStep = (): string | null => {
    if (step === 0 && !form.title.trim()) return 'Title is required.';
    if (step === 1) {
      if (!form.date) return 'Date is required.';
      if (!form.allDay && form.end <= form.start) return 'End time must be after start time.';
    }
    return null;
  };

  const goNext = () => {
    const error = validateStep();
    if (error) { setStepError(error); return; }
    setStepError(null);
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setStepError(null);
    setStep(s => Math.max(s - 1, 0));
  };

  const renderDetailsStep = () => (
    <div className="emc-wizard__body">
      <label className="emc-wizard__field">
        <span>Title</span>
        <input value={form.title} onChange={e => update({ title: e.target.value })} placeholder="Event title" />
      </label>
      <div className="emc-wizard__field">
        <span>Event type</span>
        <div className="emc-wizard__radio-group">
          {TYPE_OPTIONS.map(opt => (
            <label key={opt.value} className="emc-wizard__radio">
              <input
                type="radio"
                name="event-type"
                checked={form.type === opt.value}
                onChange={() => update({ type: opt.value })}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderScheduleStep = () => (
    <div className="emc-wizard__body">
      <label className="emc-wizard__field emc-wizard__field--checkbox">
        <input type="checkbox" checked={form.allDay} onChange={e => update({ allDay: e.target.checked })} />
        <span>All-day</span>
      </label>
      <label className="emc-wizard__field">
        <span>{form.allDay ? 'Date' : 'Date'}</span>
        <input type="date" value={form.date} onChange={e => update({ date: e.target.value })} />
      </label>
      {form.allDay ? (
        <label className="emc-wizard__field">
          <span>End date (optional, for multi-day)</span>
          <input type="date" value={form.endDate} onChange={e => update({ endDate: e.target.value })} />
        </label>
      ) : (
        <div className="emc-wizard__field-row">
          <label className="emc-wizard__field">
            <span>Start time</span>
            <input type="time" value={form.start} onChange={e => update({ start: e.target.value })} />
          </label>
          <label className="emc-wizard__field">
            <span>End time</span>
            <input type="time" value={form.end} onChange={e => update({ end: e.target.value })} />
          </label>
        </div>
      )}
    </div>
  );

  return (
    <div className="emc-modal-overlay" onClick={onClose}>
      <div className="emc-modal emc-wizard" role="dialog" aria-modal="true" aria-label="New event" onClick={e => e.stopPropagation()}>
        <header className="emc-modal__header">
          <h3 className="emc-modal__title">New Event</h3>
          <button type="button" className="emc-modal__close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </header>

        <div className="emc-wizard__steps">
          {STEPS.map((label, i) => (
            <span key={label} className={`emc-wizard__step${i === step ? ' emc-wizard__step--active' : ''}${i < step ? ' emc-wizard__step--done' : ''}`}>
              {label}
            </span>
          ))}
        </div>

        {step === 0 && renderDetailsStep()}
        {step === 1 && renderScheduleStep()}

        {stepError && <p className="emc-wizard__error">{stepError}</p>}

        <div className="emc-modal__actions">
          {step > 0 && (
            <button type="button" className="era-btn era-btn--ghost emc-modal__action" onClick={goBack}>
              Back
            </button>
          )}
          <button type="button" className="era-btn emc-modal__action" onClick={goNext}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
