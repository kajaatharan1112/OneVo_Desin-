import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { CalendarEvent } from '../../types/employee-calendar.types';
import {
  EMPTY_NEW_EVENT_FORM,
  MOCK_ATTENDEES,
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
    if (step === 2 && form.type === 'meeting' && form.attendees.length === 0) {
      return 'Select at least one attendee.';
    }
    if (step === 3 && form.recurring && (form.occurrences < 1 || form.occurrences > 12)) {
      return 'Occurrences must be between 1 and 12.';
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

  const toggleAttendee = (name: string) => {
    setForm(f => ({
      ...f,
      attendees: f.attendees.includes(name)
        ? f.attendees.filter(a => a !== name)
        : [...f.attendees, name],
    }));
  };

  const renderMoreInfoStep = () => (
    <div className="emc-wizard__body">
      <label className="emc-wizard__field">
        <span>Location</span>
        <input value={form.location} onChange={e => update({ location: e.target.value })} placeholder="Optional" />
      </label>
      <label className="emc-wizard__field">
        <span>Notes</span>
        <textarea value={form.notes} onChange={e => update({ notes: e.target.value })} placeholder="Optional" rows={3} />
      </label>
      {form.type === 'meeting' && (
        <div className="emc-wizard__field">
          <span>Attendees</span>
          <div className="emc-wizard__attendees">
            {MOCK_ATTENDEES.map(name => (
              <label key={name} className="emc-wizard__radio">
                <input type="checkbox" checked={form.attendees.includes(name)} onChange={() => toggleAttendee(name)} />
                <span>{name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderRemindersStep = () => (
    <div className="emc-wizard__body">
      <label className="emc-wizard__field">
        <span>Reminder</span>
        <select
          value={form.reminderMinutesBefore}
          onChange={e => update({ reminderMinutesBefore: Number(e.target.value) })}
        >
          <option value={0}>None</option>
          <option value={10}>10 minutes before</option>
          <option value={60}>1 hour before</option>
          <option value={1440}>1 day before</option>
        </select>
      </label>
      <label className="emc-wizard__field emc-wizard__field--checkbox">
        <input type="checkbox" checked={form.recurring} onChange={e => update({ recurring: e.target.checked })} />
        <span>Recurring</span>
      </label>
      {form.recurring && (
        <div className="emc-wizard__field-row">
          <label className="emc-wizard__field">
            <span>Frequency</span>
            <select value={form.frequency} onChange={e => update({ frequency: e.target.value as NewEventFormState['frequency'] })}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
          <label className="emc-wizard__field">
            <span>Occurrences</span>
            <input
              type="number"
              min={1}
              max={12}
              value={form.occurrences}
              onChange={e => update({ occurrences: Math.min(12, Math.max(1, Number(e.target.value))) })}
            />
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
        {step === 2 && renderMoreInfoStep()}
        {step === 3 && renderRemindersStep()}

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
