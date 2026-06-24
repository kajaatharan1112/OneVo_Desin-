import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { CalendarEvent } from '../../types/employee-calendar.types';
import {
  buildEventsFromForm,
  EMPTY_NEW_EVENT_FORM,
  findConflicts,
  MOCK_ATTENDEES,
  type NewEventFormState,
  type NewEventType,
} from './new-event-wizard.utils';

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
  const [form, setForm] = useState<NewEventFormState>(EMPTY_NEW_EVENT_FORM);
  const [errors, setErrors] = useState<string[]>([]);
  const [conflicts, setConflicts] = useState<CalendarEvent[] | null>(null);

  const update = (patch: Partial<NewEventFormState>) => setForm(f => ({ ...f, ...patch }));

  const toggleAttendee = (name: string) => {
    setForm(f => ({
      ...f,
      attendees: f.attendees.includes(name)
        ? f.attendees.filter(a => a !== name)
        : [...f.attendees, name],
    }));
  };

  const validateForm = (): string[] => {
    const found: string[] = [];
    if (!form.title.trim()) found.push('Title is required.');
    if (!form.date) found.push('Date is required.');
    if (!form.allDay && form.end <= form.start) found.push('End time must be after start time.');
    if (form.type === 'meeting' && form.attendees.length === 0) found.push('Select at least one attendee.');
    if (form.recurring && (form.occurrences < 1 || form.occurrences > 12)) {
      found.push('Occurrences must be between 1 and 12.');
    }
    return found;
  };

  const finalizeCreate = () => {
    onCreate(buildEventsFromForm(form));
    onClose();
  };

  const handleCreateClick = () => {
    const found = validateForm();
    if (found.length > 0) {
      setErrors(found);
      return;
    }
    setErrors([]);
    const clashes = findConflicts(form, existingMyEvents);
    if (clashes.length > 0) {
      setConflicts(clashes);
      return;
    }
    finalizeCreate();
  };

  const handleReschedule = () => setConflicts(null);
  const handleConfirmAnyway = () => {
    setConflicts(null);
    finalizeCreate();
  };

  const renderTitleTypeSection = () => (
    <div className="emc-wizard__section">
      <h4 className="emc-wizard__section-title">Title &amp; type</h4>
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

  const renderScheduleSection = () => (
    <div className="emc-wizard__section">
      <h4 className="emc-wizard__section-title">Schedule</h4>
      <label className="emc-wizard__field emc-wizard__field--checkbox">
        <input type="checkbox" checked={form.allDay} onChange={e => update({ allDay: e.target.checked })} />
        <span>All-day</span>
      </label>
      <label className="emc-wizard__field">
        <span>Date</span>
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

  const renderDetailsSection = () => (
    <div className="emc-wizard__section">
      <h4 className="emc-wizard__section-title">Details</h4>
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

  const renderRemindersSection = () => (
    <div className="emc-wizard__section">
      <h4 className="emc-wizard__section-title">Reminders &amp; repeat</h4>
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

  const renderConflictSection = () => (
    <div className="emc-wizard__section">
      <p className="emc-wizard__conflict-intro">This clashes with:</p>
      <ul className="emc-wizard__conflict-list">
        {(conflicts ?? []).map(ev => (
          <li key={ev.id} className="emc-wizard__conflict-item">
            <span className={`emc-filterpanel__swatch emc-evpill--${ev.type}`} />
            {ev.title}
            {ev.allDay ? ' · All day' : ev.start ? ` · ${ev.start}${ev.end ? `–${ev.end}` : ''}` : ''}
          </li>
        ))}
      </ul>
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

        <div className="emc-wizard__body">
          {conflicts ? renderConflictSection() : (
            <>
              {renderTitleTypeSection()}
              {renderScheduleSection()}
              {renderDetailsSection()}
              {renderRemindersSection()}
            </>
          )}
        </div>

        {errors.length > 0 && (
          <ul className="emc-wizard__error-list">
            {errors.map(err => <li key={err}>{err}</li>)}
          </ul>
        )}

        <div className="emc-modal__actions">
          {conflicts ? (
            <>
              <button type="button" className="era-btn era-btn--ghost emc-modal__action" onClick={handleReschedule}>
                Reschedule
              </button>
              <button type="button" className="era-btn emc-modal__action" onClick={handleConfirmAnyway}>
                Confirm anyway
              </button>
            </>
          ) : (
            <button type="button" className="era-btn emc-modal__action" onClick={handleCreateClick}>
              Create Event
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
