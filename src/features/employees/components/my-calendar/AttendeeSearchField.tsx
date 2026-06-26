import React, { useMemo, useState } from 'react';
import { Mail, X } from 'lucide-react';
import { attendeeKey, CALENDAR_DIRECTORY, type AttendeeRef } from './new-event-wizard.utils';
import { formatOffsetLabel } from './timezone.utils';
import { useEmployeeContext } from '../../context/employee-context';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export interface AttendeeSearchFieldProps {
  selected: AttendeeRef[];
  onChange: (next: AttendeeRef[]) => void;
}

export const AttendeeSearchField: React.FC<AttendeeSearchFieldProps> = ({ selected, onChange }) => {
  const { selectedEmployee } = useEmployeeContext();
  const viewerTimeZone = selectedEmployee.timezone;
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const selectedKeys = useMemo(() => new Set(selected.map(attendeeKey)), [selected]);

  const directoryMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return CALENDAR_DIRECTORY.filter(
      person => !selectedKeys.has(person.name) && person.name.toLowerCase().includes(q)
    );
  }, [query, selectedKeys]);

  const trimmedQuery = query.trim();
  const isExactDirectoryMatch = CALENDAR_DIRECTORY.some(
    person => person.name.toLowerCase() === trimmedQuery.toLowerCase()
  );
  const showInviteRow =
    EMAIL_PATTERN.test(trimmedQuery) &&
    !isExactDirectoryMatch &&
    !selectedKeys.has(trimmedQuery);

  const addAttendee = (attendee: AttendeeRef) => {
    onChange([...selected, attendee]);
    setQuery('');
    setOpen(false);
  };

  const removeAttendee = (key: string) => {
    onChange(selected.filter(a => attendeeKey(a) !== key));
  };

  return (
    <div className="emc-attendee-search">
      <input
        type="text"
        value={query}
        placeholder="Search people or type an email to invite"
        onChange={e => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={e => {
          if (e.key !== 'Enter') return;
          e.preventDefault();
          if (directoryMatches[0]) {
            addAttendee({
              kind: 'user',
              id: directoryMatches[0].id,
              name: directoryMatches[0].name,
              role: directoryMatches[0].role,
            });
          } else if (showInviteRow) {
            addAttendee({ kind: 'external', email: trimmedQuery });
          }
        }}
      />
      {open && (directoryMatches.length > 0 || showInviteRow) && (
        <ul className="emc-attendee-search__dropdown">
          {directoryMatches.map(person => (
            <li key={person.id}>
              <button
                type="button"
                className="emc-attendee-search__option"
                onMouseDown={e => e.preventDefault()}
                onClick={() => addAttendee({ kind: 'user', id: person.id, name: person.name, role: person.role })}
              >
                <span className="emc-attendee-search__avatar">{person.avatar}</span>
                <span className="emc-attendee-search__option-text">
                  <span>{person.name}</span>
                  <span className="emc-attendee-search__option-role">{person.role}</span>
                  <span className="emc-attendee-search__option-tz">{person.country} · {formatOffsetLabel(person.timezone)}</span>
                </span>
              </button>
            </li>
          ))}
          {showInviteRow && (
            <li>
              <button
                type="button"
                className="emc-attendee-search__option emc-attendee-search__option--invite"
                onMouseDown={e => e.preventDefault()}
                onClick={() => addAttendee({ kind: 'external', email: trimmedQuery })}
              >
                <Mail size={14} />
                <span>Invite {trimmedQuery}</span>
              </button>
            </li>
          )}
        </ul>
      )}
      {selected.length > 0 && (
        <div className="emc-wizard__attendees emc-attendee-search__chips">
          {selected.map(a => {
            const directoryPerson = a.kind === 'user' ? CALENDAR_DIRECTORY.find(p => p.id === a.id) : undefined;
            const showTz = !!directoryPerson && directoryPerson.timezone !== viewerTimeZone;
            return (
              <span key={attendeeKey(a)} className="emc-attendee-chip">
                {a.kind === 'user' ? (
                  <span className="emc-attendee-search__avatar emc-attendee-search__avatar--sm">
                    {directoryPerson?.avatar ?? a.name.slice(0, 2).toUpperCase()}
                  </span>
                ) : (
                  <Mail size={12} />
                )}
                <span>{a.kind === 'user' ? a.name : a.email}</span>
                {showTz && (
                  <span className="emc-attendee-chip__tz">{formatOffsetLabel(directoryPerson!.timezone)}</span>
                )}
                <button
                  type="button"
                  aria-label={`Remove ${attendeeKey(a)}`}
                  onClick={() => removeAttendee(attendeeKey(a))}
                >
                  <X size={12} />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};
