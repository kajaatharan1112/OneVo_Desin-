import React, { useState } from 'react';
import { X, MapPin, Users as UsersIcon, Trash2, Pencil, Copy } from 'lucide-react';
import type { CalendarEvent, CalendarEventType } from '../../types/employee-calendar.types';
import { getAttendeeTimeRows } from './timezone.utils';
import { useEmployeeContext } from '../../context/employee-context';
import { findEventConflicts } from './new-event-wizard.utils';
import { useCalendarStore } from '../../../../store/calendarStore';

export const EVENT_TYPE_LABEL: Record<CalendarEventType, string> = {
  shift: 'Shift',
  meeting: 'Meeting',
  leave: 'Leave',
  holiday: 'Holiday',
  reminder: 'Deadline/Form',
  training: 'Training',
  'out-of-office': 'Out of Office',
  'company-event': 'Company Event',
};

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const ampm = h < 12 ? 'AM' : 'PM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

interface EventDetailsModalProps {
  event: CalendarEvent;
  onClose: () => void;
  onDelete: (id: string) => void;
  onSave: (updated: CalendarEvent) => void;
  onDuplicate: (event: CalendarEvent) => void;
  existingMyEvents?: CalendarEvent[];
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ event, onClose, onDelete, onSave, onDuplicate, existingMyEvents = [] }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(event);
  const [conflicts, setConflicts] = useState<CalendarEvent[] | null>(null);
  const [seriesAction, setSeriesAction] = useState<'edit' | 'delete' | null>(null);
  const [editingSeriesWide, setEditingSeriesWide] = useState(false);
  const updateSeries = useCalendarStore(s => s.updateSeries);
  const deleteSeries = useCalendarStore(s => s.deleteSeries);

  const { selectedEmployee } = useEmployeeContext();
  const attendeeTimeRows = event.attendees && event.start && event.end && !event.allDay
    ? getAttendeeTimeRows(event.attendees, event.date, event.start, event.end, selectedEmployee.timezone)
    : [];

  const startEdit = () => { setForm(event); setEditing(true); };
  const finalizeSave = () => {
    if (editingSeriesWide && event.seriesId) {
      updateSeries(event.seriesId, { title: form.title, location: form.location, note: form.note });
    } else {
      onSave(form);
    }
    setEditing(false);
    setConflicts(null);
    setEditingSeriesWide(false);
  };
  const handleSave = () => {
    const clashes = findEventConflicts(form, existingMyEvents);
    if (clashes.length > 0) {
      setConflicts(clashes);
      return;
    }
    finalizeSave();
  };

  return (
    <div className="emc-modal-overlay" onClick={onClose}>
      <div className="emc-modal emc-modal--details" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <header className="emc-modal__header">
          <h3 className="emc-modal__title">{editing ? 'Edit Event' : event.title}</h3>
          <button type="button" className="emc-modal__close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </header>

        {!editing ? (
          <div className="emc-modal__body">
            <span className={`emc-modal__type emc-evpill--${event.type}`}>{EVENT_TYPE_LABEL[event.type]}</span>
            {event.syncProvider && (
              <span className="emc-modal__synced-label">
                Synced from {event.syncProvider === 'google' ? 'Google' : 'Outlook'}
              </span>
            )}

            <div className="emc-modal__row">
              <span className="emc-modal__row-label">Date &amp; time</span>
              <span className="emc-modal__row-value">
                {event.date}
                {event.allDay ? ' · All day' : event.start ? ` · ${formatTime(event.start)}${event.end ? ` – ${formatTime(event.end)}` : ''}` : ''}
              </span>
            </div>

            {event.location && (
              <div className="emc-modal__row">
                <MapPin size={13} className="emc-modal__row-icon" />
                <span className="emc-modal__row-value">{event.location}</span>
              </div>
            )}

            {event.attendees && event.attendees.length > 0 && (
              <div className="emc-modal__row">
                <UsersIcon size={13} className="emc-modal__row-icon" />
                <span className="emc-modal__row-value">{event.attendees.join(', ')}</span>
              </div>
            )}

            {attendeeTimeRows.length > 0 && (
              <ul className="emc-modal__attendee-times">
                {attendeeTimeRows.map(row => (
                  <li key={row.name}>
                    {row.name}: {formatTime(row.start)} – {formatTime(row.end)} ({row.country})
                  </li>
                ))}
              </ul>
            )}

            {event.leaveType && (
              <div className="emc-modal__row">
                <span className="emc-modal__row-label">Leave Type</span>
                <span className="emc-modal__row-value">{event.leaveType}</span>
              </div>
            )}

            {event.attendeeRsvp && (
              <div className="emc-modal__rsvp-list">
                {Object.entries(event.attendeeRsvp).map(([name, rsvp]) => (
                  <span key={name} className={`emc-rsvp-badge emc-rsvp-badge--${rsvp}`}>
                    {name} · {rsvp}
                  </span>
                ))}
              </div>
            )}

            {event.status === 'pending' && event.source === 'company' && (
              <div className="emc-modal__approval">
                <p className="emc-modal__approval-label">Manager review (demo)</p>
                <div className="emc-modal__approval-actions">
                  <button
                    type="button"
                    className="era-btn emc-modal__action"
                    onClick={() => onSave({ ...event, status: 'confirmed' })}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="era-btn emc-modal__action emc-modal__action--danger"
                    onClick={() => onSave({ ...event, status: 'rejected' })}
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}

            {event.status === 'rejected' && (
              <p className="emc-modal__rejected-note">Rejected by manager.</p>
            )}

            {event.status === 'tentative' && (
              <p className="emc-modal__tentative-note">Tentative response.</p>
            )}

            {seriesAction ? (
              <div className="emc-modal__actions">
                <span className="emc-modal__series-prompt">
                  {seriesAction === 'edit' ? 'Edit' : 'Delete'} this event, or all events in the series?
                </span>
                <button type="button" className="era-btn era-btn--ghost emc-modal__action" onClick={() => setSeriesAction(null)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="era-btn era-btn--ghost emc-modal__action"
                  onClick={() => {
                    setSeriesAction(null);
                    setEditingSeriesWide(false);
                    if (seriesAction === 'edit') startEdit(); else onDelete(event.id);
                  }}
                >
                  This event
                </button>
                <button
                  type="button"
                  className="era-btn emc-modal__action emc-modal__action--danger"
                  onClick={() => {
                    setSeriesAction(null);
                    if (seriesAction === 'edit') {
                      setEditingSeriesWide(true);
                      setForm(event);
                      setEditing(true);
                    } else if (event.seriesId) {
                      deleteSeries(event.seriesId);
                      onClose();
                    }
                  }}
                >
                  All events in series
                </button>
              </div>
            ) : (
              <div className="emc-modal__actions">
                {event.syncOrigin !== 'pulled' && (
                  <button
                    type="button"
                    className="era-btn era-btn--ghost emc-modal__action"
                    onClick={() => (event.seriesId ? setSeriesAction('edit') : startEdit())}
                  >
                    <Pencil size={13} />
                    Edit
                  </button>
                )}
                {event.syncOrigin !== 'pulled' && event.type === 'meeting' && (
                  <button type="button" className="era-btn era-btn--ghost emc-modal__action" onClick={() => onDuplicate(event)}>
                    <Copy size={13} />
                    Duplicate
                  </button>
                )}
                {event.syncOrigin !== 'pulled' && (
                  <button
                    type="button"
                    className="era-btn emc-modal__action emc-modal__action--danger"
                    onClick={() => (event.seriesId ? setSeriesAction('delete') : onDelete(event.id))}
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="emc-modal__body">
            <label className="emc-modal__field">
              <span>Title</span>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </label>
            <label className="emc-modal__field">
              <span>Date</span>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </label>
            {!form.allDay && (
              <div className="emc-modal__field-row">
                <label className="emc-modal__field">
                  <span>Start</span>
                  <input type="time" value={form.start ?? ''} onChange={e => setForm({ ...form, start: e.target.value })} />
                </label>
                <label className="emc-modal__field">
                  <span>End</span>
                  <input type="time" value={form.end ?? ''} onChange={e => setForm({ ...form, end: e.target.value })} />
                </label>
              </div>
            )}
            <label className="emc-modal__field">
              <span>Location</span>
              <input value={form.location ?? ''} onChange={e => setForm({ ...form, location: e.target.value })} />
            </label>

            {conflicts && conflicts.length > 0 && (
              <div className="emc-wizard__section">
                <p className="emc-wizard__conflict-intro">This clashes with:</p>
                <ul className="emc-wizard__conflict-list">
                  {conflicts.map(ev => (
                    <li key={ev.id} className="emc-wizard__conflict-item">
                      <span className={`emc-filterpanel__swatch emc-evpill--${ev.type}`} />
                      {ev.title}
                      {ev.allDay ? ' · All day' : ev.start ? ` · ${formatTime(ev.start)}${ev.end ? `–${formatTime(ev.end)}` : ''}` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="emc-modal__actions">
              {conflicts && conflicts.length > 0 ? (
                <>
                  <button type="button" className="era-btn era-btn--ghost emc-modal__action" onClick={() => setConflicts(null)}>
                    Reschedule
                  </button>
                  <button type="button" className="era-btn emc-modal__action" onClick={finalizeSave}>
                    Save anyway
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="era-btn era-btn--ghost emc-modal__action" onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                  <button type="button" className="era-btn emc-modal__action" onClick={handleSave}>
                    Save
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
