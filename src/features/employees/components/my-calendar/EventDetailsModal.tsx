import React, { useState } from 'react';
import { X, MapPin, Users as UsersIcon, Trash2, Pencil } from 'lucide-react';
import type { CalendarEvent, CalendarEventType } from '../../types/employee-calendar.types';

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
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ event, onClose, onDelete, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(event);

  const startEdit = () => { setForm(event); setEditing(true); };
  const handleSave = () => { onSave(form); setEditing(false); };

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

            <div className="emc-modal__actions">
              <button type="button" className="era-btn era-btn--ghost emc-modal__action" onClick={startEdit}>
                <Pencil size={13} />
                Edit
              </button>
              <button type="button" className="era-btn emc-modal__action emc-modal__action--danger" onClick={() => onDelete(event.id)}>
                <Trash2 size={13} />
                Delete
              </button>
            </div>
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

            <div className="emc-modal__actions">
              <button type="button" className="era-btn era-btn--ghost emc-modal__action" onClick={() => setEditing(false)}>
                Cancel
              </button>
              <button type="button" className="era-btn emc-modal__action" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
