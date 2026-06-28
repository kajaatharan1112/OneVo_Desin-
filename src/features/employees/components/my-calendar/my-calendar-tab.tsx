import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, CalendarDays, ChevronDown,
  Users, RefreshCw, Filter, Plus, Check, X, HelpCircle,
  Sun, Plane, Clock, Bell, CalendarX2, Settings,
  GraduationCap, LogOut, Building2, Copy
} from 'lucide-react';
import type { CalendarEvent, CalendarEventType, CalendarViewMode, CalendarScopeFilter } from '../../types/employee-calendar.types';
import type { SyncProvider } from '../../types/employee-calendar.types';
import { pullEvents, detectConflict, type SyncConflict } from './calendar-sync.utils';
import { useCalendarStore } from '../../../../store/calendarStore';
import { EventDetailsModal } from './EventDetailsModal';
import { CalendarFilterPanel } from './CalendarFilterPanel';
import { NewEventWizard } from './NewEventWizard';
import { addMinutesToTime, eventToFormOverrides, findEventConflicts, type NewEventFormState } from './new-event-wizard.utils';

const ALL_EVENT_TYPES: CalendarEventType[] = ['shift', 'meeting', 'leave', 'holiday', 'reminder', 'training', 'out-of-office', 'company-event'];

type SettingsTabId = 'sync';

const SETTINGS_TABS: { id: SettingsTabId; label: string }[] = [
  { id: 'sync', label: 'Calendar Sync' },
];

const SCOPE_OPTIONS: { value: CalendarScopeFilter; label: string }[] = [
  { value: 'my',           label: 'My Schedule' },
  { value: 'team',         label: 'Team' },
  { value: 'department',   label: 'Department' },
  { value: 'organization', label: 'Organization' },
  { value: 'combined',     label: 'Combined' },
];

const AGENDA_TYPE_ICON: Record<CalendarEventType, React.ComponentType<{ size?: number }>> = {
  meeting: Users,
  holiday: Sun,
  leave: Plane,
  shift: Clock,
  reminder: Bell,
  training: GraduationCap,
  'out-of-office': LogOut,
  'company-event': Building2,
};

// ── Helpers ────────────────────────────────────────────────────────────────

const TODAY_KEY = '2026-06-17';

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function formatHour(h: number): string {
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const ampm = h < 12 ? 'AM' : 'PM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

const SyncBadge: React.FC<{ provider: SyncProvider }> = ({ provider }) => (
  <span className={`emc-syncbadge emc-syncbadge--${provider}`} title={provider === 'google' ? 'Synced from Google' : 'Synced from Outlook'}>
    {provider === 'google' ? 'G' : 'O'}
  </span>
);

interface DragPointInfo {
  dayKey: string;
  minutes: number;
}

function getDragPointInfo(clientX: number, clientY: number): DragPointInfo | null {
  const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
  const cell = el?.closest<HTMLElement>('[data-drag-day][data-drag-hour]');
  if (!cell) return null;
  const dayKey = cell.dataset.dragDay!;
  const hour = Number(cell.dataset.dragHour);
  const rect = cell.getBoundingClientRect();
  const fraction = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
  const withinHour = Math.min(45, Math.round((fraction * 60) / 15) * 15);
  return { dayKey, minutes: hour * 60 + withinHour };
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 10 }, (_, i) => i + 8); // 8 AM – 5 PM

// ── Main component ─────────────────────────────────────────────────────────

export const MyCalendarTab: React.FC = () => {
  const localEvents = useCalendarStore(s => s.events);
  const syncStatus = useCalendarStore(s => s.syncStatus);
  const lastConnectedProvider = useCalendarStore(s => s.lastConnectedProvider);
  const addEvents = useCalendarStore(s => s.addEvents);
  const updateEvent = useCalendarStore(s => s.updateEvent);
  const deleteEventInStore = useCalendarStore(s => s.deleteEvent);
  const [connectingProvider, setConnectingProvider] = useState<SyncProvider | null>(null);

  const today = useMemo(() => parseLocalDate(TODAY_KEY), []);

  const [viewMode, setViewMode] = useState<CalendarViewMode>('week');
  const [anchor, setAnchor] = useState<Date>(() => parseLocalDate(TODAY_KEY));

  // Scope (whose calendar) — independent of viewMode (Day/Week/Month/Agenda)
  const [scope, setScope] = useState<CalendarScopeFilter>('my');
  const [scopeMenuOpen, setScopeMenuOpen] = useState(false);
  const scopeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scopeMenuOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (scopeMenuRef.current && !scopeMenuRef.current.contains(e.target as Node)) {
        setScopeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [scopeMenuOpen]);

  const scopeLabel = SCOPE_OPTIONS.find(o => o.value === scope)?.label ?? 'My Schedule';

  const scopedEvents = useMemo(() => {
    if (scope === 'combined') return localEvents;
    return localEvents.filter(ev => ev.scope === scope);
  }, [localEvents, scope]);

  // Type filter + title search — independent of scope and viewMode, compose together
  const [enabledTypes, setEnabledTypes] = useState<Set<CalendarEventType>>(new Set(ALL_EVENT_TYPES));
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const filterPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterPanelOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(e.target as Node)) {
        setFilterPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [filterPanelOpen]);

  const toggleType = (type: CalendarEventType) => {
    setEnabledTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type); else next.add(type);
      return next;
    });
  };

  const clearTypeFilters = () => setEnabledTypes(new Set());
  const selectAllTypeFilters = () => setEnabledTypes(new Set(ALL_EVENT_TYPES));

  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return scopedEvents.filter(ev =>
      enabledTypes.has(ev.type) && (!q || ev.title.toLowerCase().includes(q))
    );
  }, [scopedEvents, enabledTypes, searchQuery]);

  // Calendar settings popup
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTabId>('sync');

  // New event wizard
  const [newEventOpen, setNewEventOpen] = useState(false);
  const [dragPrefill, setDragPrefill] = useState<Partial<NewEventFormState> | null>(null);

  const connectedProviders = (['google', 'outlook'] as const).filter(p => syncStatus[p] === 'connected');

  const handleCreateEvents = (events: CalendarEvent[]) => {
    const provider: SyncProvider | null =
      connectedProviders.length === 1 ? connectedProviders[0]
      : connectedProviders.length > 1 ? lastConnectedProvider
      : null;

    const tagged = provider
      ? events.map(ev => ({ ...ev, syncProvider: provider, syncOrigin: 'pushed' as const }))
      : events;

    addEvents(tagged);
    setScope('my');
    setEnabledTypes(prev => {
      const next = new Set(prev);
      tagged.forEach(ev => next.add(ev.type));
      return next;
    });
  };

  const handleConnect = (provider: SyncProvider) => {
    setConnectingProvider(provider);
    setTimeout(() => {
      const store = useCalendarStore.getState();
      store.setSyncStatus({ ...store.syncStatus, [provider]: 'connected', lastSynced: 'just now' });
      store.setLastConnectedProvider(provider);
      store.addEvents(pullEvents(provider));
      setConnectingProvider(null);
    }, 800);
  };

  const [activeConflict, setActiveConflict] = useState<{ provider: SyncProvider; conflict: SyncConflict } | null>(null);

  const finishSync = (_provider: SyncProvider) => {
    const store = useCalendarStore.getState();
    store.setSyncStatus({ ...store.syncStatus, lastSynced: 'just now' });
    setConnectingProvider(null);
  };

  const handleSyncNow = (provider: SyncProvider) => {
    setConnectingProvider(provider);
    setTimeout(() => {
      const store = useCalendarStore.getState();
      const existingTitles = new Set(
        store.events.filter(ev => ev.syncProvider === provider && ev.syncOrigin === 'pulled').map(ev => ev.title)
      );
      const fresh = pullEvents(provider).filter(ev => !existingTitles.has(ev.title));
      store.addEvents(fresh);

      const next = [...store.events, ...fresh];
      const conflict = detectConflict(
        next.filter(ev => ev.syncProvider === provider && ev.syncOrigin === 'pushed'),
        provider
      );
      if (conflict) {
        setActiveConflict({ provider, conflict });
      } else {
        finishSync(provider);
      }
    }, 800);
  };

  const handleDisconnect = (provider: SyncProvider) => {
    const store = useCalendarStore.getState();
    store.setEvents(store.events
      .filter(ev => !(ev.syncProvider === provider && ev.syncOrigin === 'pulled'))
      .map(ev => (ev.syncProvider === provider && ev.syncOrigin === 'pushed')
        ? { ...ev, syncProvider: undefined, syncOrigin: undefined }
        : ev
      )
    );
    store.setSyncStatus({ ...store.syncStatus, [provider]: 'disconnected' });
    if (store.lastConnectedProvider === provider) store.setLastConnectedProvider(null);
  };

  const handleConflictKeepMine = () => {
    if (!activeConflict) return;
    finishSync(activeConflict.provider);
    setActiveConflict(null);
  };

  const handleConflictKeepTheirs = () => {
    if (!activeConflict) return;
    const { provider, conflict } = activeConflict;
    const store = useCalendarStore.getState();
    const target = store.events.find(ev => ev.id === conflict.eventId);
    if (target) {
      store.updateEvent(target.id, { ...target, start: conflict.theirsStart, end: conflict.theirsEnd });
    }
    finishSync(provider);
    setActiveConflict(null);
  };

  // Drag-to-create-event (Week/Day views)
  const [dragDayKey, setDragDayKey] = useState<string | null>(null);
  const [dragRange, setDragRange] = useState<{ startMinutes: number; endMinutes: number } | null>(null);
  const dragStateRef = useRef<{ dayKey: string; startMinutes: number; endMinutes: number } | null>(null);

  const handleCellMouseDown = (e: React.MouseEvent<HTMLElement>, dayKey: string, hour: number) => {
    if ((e.target as HTMLElement).closest('.emc-week__ev, .emc-day__ev')) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const fraction = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    const withinHour = Math.min(45, Math.round((fraction * 60) / 15) * 15);
    const startMinutes = hour * 60 + withinHour;
    const endMinutes = startMinutes + 30;
    dragStateRef.current = { dayKey, startMinutes, endMinutes };
    setDragDayKey(dayKey);
    setDragRange({ startMinutes, endMinutes });
  };

  const isHourInDragRange = (dayKey: string, hour: number): boolean => {
    if (dragDayKey !== dayKey || !dragRange) return false;
    const hourStart = hour * 60;
    const hourEnd = hourStart + 60;
    return hourStart < dragRange.endMinutes && hourEnd > dragRange.startMinutes;
  };

  useEffect(() => {
    if (!dragDayKey) return;
    const handleMouseMove = (e: MouseEvent) => {
      const info = getDragPointInfo(e.clientX, e.clientY);
      const current = dragStateRef.current;
      if (!info || !current || info.dayKey !== current.dayKey) return;
      const endMinutes = Math.max(current.startMinutes + 15, info.minutes);
      dragStateRef.current = { ...current, endMinutes };
      setDragRange({ startMinutes: current.startMinutes, endMinutes });
    };
    const handleMouseUp = () => {
      const current = dragStateRef.current;
      dragStateRef.current = null;
      setDragDayKey(null);
      setDragRange(null);
      if (current) {
        const startTime = addMinutesToTime('00:00', current.startMinutes);
        const endTime = addMinutesToTime('00:00', current.endMinutes);
        console.log('Selected:', current.dayKey, startTime, '–', endTime);
        setDragPrefill({ date: current.dayKey, start: startTime, end: endTime, allDay: false, type: 'meeting' });
        setNewEventOpen(true);
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragDayKey]);

  // Drag-and-drop reschedule of an existing timed event (Week/Day views)
  const [draggedEventId, setDraggedEventId] = useState<string | null>(null);
  const [dropTargetCell, setDropTargetCell] = useState<string | null>(null);
  const [dropNotice, setDropNotice] = useState<string | null>(null);
  const dropNoticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showDropNotice = (message: string) => {
    setDropNotice(message);
    if (dropNoticeTimer.current) clearTimeout(dropNoticeTimer.current);
    dropNoticeTimer.current = setTimeout(() => setDropNotice(null), 3500);
  };

  const handleEventDragStart = (e: React.DragEvent, ev: CalendarEvent) => {
    e.dataTransfer.setData('text/plain', ev.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedEventId(ev.id);
  };

  const handleEventDragEnd = () => {
    setDraggedEventId(null);
    setDropTargetCell(null);
  };

  const handleCellDragOver = (e: React.DragEvent, cellKey: string) => {
    if (!draggedEventId) return;
    e.preventDefault();
    setDropTargetCell(cellKey);
  };

  const handleCellDrop = (e: React.DragEvent, dayKey: string, hour: number) => {
    e.preventDefault();
    setDropTargetCell(null);
    const id = draggedEventId ?? e.dataTransfer.getData('text/plain');
    setDraggedEventId(null);
    if (!id) return;

    const original = localEvents.find(ev => ev.id === id);
    if (!original || original.allDay || !original.start) return;

    const [oh, om] = original.start.split(':').map(Number);
    const durationMinutes = original.end
      ? (() => {
          const [eh, em] = original.end!.split(':').map(Number);
          return eh * 60 + em - (oh * 60 + om);
        })()
      : 30;

    const newStart = `${String(hour).padStart(2, '0')}:00`;
    const newEnd = addMinutesToTime(newStart, durationMinutes);

    if (original.date === dayKey && original.start === newStart) return;

    const candidate: CalendarEvent = { ...original, date: dayKey, start: newStart, end: newEnd };
    const clashes = findEventConflicts(candidate, localEvents.filter(ev => ev.scope === 'my'));
    if (clashes.length > 0) {
      showDropNotice(`Can't move "${original.title}" — clashes with ${clashes.map(c => c.title).join(', ')}.`);
      return;
    }

    updateEvent(candidate.id, candidate);
    showDropNotice(`Moved "${original.title}" to ${dayKey} · ${formatTime(newStart)}`);
  };

  // Event details modal
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const openEvent = (e: React.MouseEvent, ev: CalendarEvent) => {
    e.stopPropagation();
    setSelectedEvent(ev);
  };
  const handleDeleteEvent = (id: string) => {
    deleteEventInStore(id);
    setSelectedEvent(null);
  };
  const handleSaveEvent = (updated: CalendarEvent) => {
    updateEvent(updated.id, updated);
    setSelectedEvent(updated);
  };
  const handleRsvp = (id: string, response: 'accepted' | 'declined' | 'tentative') => {
    const target = localEvents.find(e => e.id === id);
    if (!target) return;
    const status = response === 'accepted' ? 'confirmed' : response === 'declined' ? 'rejected' : 'tentative';
    updateEvent(id, { ...target, needsResponse: false, status });
  };
  const handleDuplicateEvent = (event: CalendarEvent) => {
    setSelectedEvent(null);
    setEventMenu(null);
    setDragPrefill(eventToFormOverrides(event));
    setNewEventOpen(true);
  };

  // "+N more" day popover (Month view)
  const [dayPopover, setDayPopover] = useState<{ key: string; top: number; left: number } | null>(null);
  const dayPopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dayPopover) return;
    const onClickOutside = (e: MouseEvent) => {
      if (dayPopoverRef.current && !dayPopoverRef.current.contains(e.target as Node)) {
        setDayPopover(null);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [dayPopover]);

  // Right-click "Duplicate" menu on meeting event pills
  const [eventMenu, setEventMenu] = useState<{ event: CalendarEvent; top: number; left: number } | null>(null);
  const eventMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!eventMenu) return;
    const onClickOutside = (e: MouseEvent) => {
      if (eventMenuRef.current && !eventMenuRef.current.contains(e.target as Node)) {
        setEventMenu(null);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [eventMenu]);

  const handleEventContextMenu = (e: React.MouseEvent, ev: CalendarEvent) => {
    if (ev.type !== 'meeting') return;
    e.preventDefault();
    e.stopPropagation();
    setEventMenu({ event: ev, top: e.clientY, left: e.clientX });
  };

  const navigate = (dir: -1 | 0 | 1) => {
    if (dir === 0) { setAnchor(parseLocalDate(TODAY_KEY)); return; }
    setAnchor(prev => {
      const d = new Date(prev);
      if (viewMode === 'day')        d.setDate(d.getDate() + dir);
      else if (viewMode === 'week')  d.setDate(d.getDate() + dir * 7);
      else                           d.setMonth(d.getMonth() + dir);
      return d;
    });
  };

  const periodLabel = useMemo(() => {
    if (viewMode === 'day') {
      return `${DAY_SHORT[anchor.getDay()]}, ${MONTH_NAMES[anchor.getMonth()]} ${anchor.getDate()}, ${anchor.getFullYear()}`;
    }
    if (viewMode === 'week') {
      const ws = new Date(anchor);
      ws.setDate(anchor.getDate() - anchor.getDay());
      const we = new Date(ws);
      we.setDate(ws.getDate() + 6);
      if (ws.getMonth() === we.getMonth()) {
        return `${MONTH_NAMES[ws.getMonth()]} ${ws.getDate()}–${we.getDate()}, ${ws.getFullYear()}`;
      }
      return `${MONTH_NAMES[ws.getMonth()].slice(0, 3)} ${ws.getDate()} – ${MONTH_NAMES[we.getMonth()].slice(0, 3)} ${we.getDate()}, ${ws.getFullYear()}`;
    }
    return `${MONTH_NAMES[anchor.getMonth()]} ${anchor.getFullYear()}`;
  }, [viewMode, anchor]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    filteredEvents.forEach(ev => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return map;
  }, [filteredEvents]);

  const pendingInvites = useMemo(() => scopedEvents.filter(e => e.needsResponse), [scopedEvents]);

  const anchorKey = toDateKey(anchor);
  const anchorEvents = eventsByDate[anchorKey] ?? [];

  // ── Month view ─────────────────────────────────────────────────────────────
  const renderMonth = () => {
    const y = anchor.getFullYear();
    const m = anchor.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const totalDays = new Date(y, m + 1, 0).getDate();
    const cells: (Date | null)[] = [
      ...Array<null>(firstDay).fill(null),
      ...Array.from({ length: totalDays }, (_, i) => new Date(y, m, i + 1))
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    return (
      <div className="emc-month">
        <div className="emc-month__weekrow">
          {DAY_SHORT.map(d => <div key={d} className="emc-month__daylabel">{d}</div>)}
        </div>
        <div className="emc-month__grid">
          {cells.map((date, i) => {
            if (!date) return <div key={`pad-${i}`} className="emc-month__cell emc-month__cell--pad" />;
            const key = toDateKey(date);
            const dayEvts = eventsByDate[key] ?? [];
            const isToday  = isSameDay(date, today);
            const isActive = isSameDay(date, anchor);
            return (
              <div
                key={key}
                className={[
                  'emc-month__cell',
                  isToday  ? 'emc-month__cell--today'  : '',
                  isActive ? 'emc-month__cell--active' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => setAnchor(date)}
              >
                <span className="emc-month__num">{date.getDate()}</span>
                <div className="emc-month__events">
                  {dayEvts.slice(0, 3).map(ev => (
                    <div
                      key={ev.id}
                      className={`emc-month__evpill emc-evpill--${ev.type}${ev.status === 'pending' ? ' emc-evpill--pending-status' : ev.status === 'rejected' ? ' emc-evpill--rejected-status' : ev.status === 'tentative' ? ' emc-evpill--tentative-status' : ''}`}
                      onClick={e => openEvent(e, ev)}
                      onContextMenu={e => handleEventContextMenu(e, ev)}
                    >
                      {ev.syncProvider && <SyncBadge provider={ev.syncProvider} />}
                      {ev.title}
                    </div>
                  ))}
                  {dayEvts.length > 3 && (
                    <div
                      className="emc-month__evpill emc-evpill--more"
                      onClick={e => {
                        e.stopPropagation();
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        setDayPopover({ key, top: rect.bottom + 4, left: rect.left });
                      }}
                    >
                      +{dayEvts.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── Week view ──────────────────────────────────────────────────────────────
  const renderWeek = () => {
    const ws = new Date(anchor);
    ws.setDate(anchor.getDate() - anchor.getDay());
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(ws);
      d.setDate(ws.getDate() + i);
      return d;
    });
    const allDayRows = days.map(d => (eventsByDate[toDateKey(d)] ?? []).filter(e => e.allDay));
    const hasAllDay = allDayRows.some(r => r.length > 0);

    return (
      <div className="emc-week">
        <div className="emc-week__colheads">
          <div className="emc-week__gutter" />
          {days.map(d => {
            const isToday  = isSameDay(d, today);
            const isActive = isSameDay(d, anchor);
            return (
              <div
                key={toDateKey(d)}
                className={['emc-week__colhead', isToday ? 'emc-week__colhead--today' : '', isActive ? 'emc-week__colhead--active' : ''].filter(Boolean).join(' ')}
                onClick={() => setAnchor(d)}
              >
                <span className="emc-week__colday">{DAY_SHORT[d.getDay()]}</span>
                <span className={`emc-week__colnum${isToday ? ' emc-week__colnum--today' : ''}`}>{d.getDate()}</span>
              </div>
            );
          })}
        </div>

        {hasAllDay && (
          <div className="emc-week__alldayrow">
            <div className="emc-week__gutter emc-week__gutter--label">All day</div>
            {days.map((d, i) => (
              <div key={toDateKey(d)} className="emc-week__alldaycell">
                {allDayRows[i].map(ev => (
                  <div key={ev.id} className={`emc-week__evpill emc-evpill--${ev.type}${ev.status === 'pending' ? ' emc-evpill--pending-status' : ev.status === 'rejected' ? ' emc-evpill--rejected-status' : ev.status === 'tentative' ? ' emc-evpill--tentative-status' : ''}`} onClick={e => openEvent(e, ev)} onContextMenu={e => handleEventContextMenu(e, ev)}>{ev.syncProvider && <SyncBadge provider={ev.syncProvider} />}{ev.title}</div>
                ))}
              </div>
            ))}
          </div>
        )}

        <div className="emc-week__body">
          {HOURS.map(h => (
            <div key={h} className="emc-week__row">
              <div className="emc-week__gutter">{formatHour(h)}</div>
              {days.map(d => {
                const key = toDateKey(d);
                const hStr = String(h).padStart(2, '0');
                const hourEvts = (eventsByDate[key] ?? []).filter(ev => !ev.allDay && ev.start?.startsWith(hStr));
                const isToday = isSameDay(d, today);
                const inDrag = isHourInDragRange(key, h);
                const cellKey = `${key}-${h}`;
                const isDropTarget = dropTargetCell === cellKey;
                return (
                  <div
                    key={key}
                    className={`emc-week__cell${isToday ? ' emc-week__cell--today' : ''}${inDrag ? ' emc-week__cell--dragselect' : ''}${isDropTarget ? ' emc-week__cell--droptarget' : ''}`}
                    data-drag-day={key}
                    data-drag-hour={h}
                    onMouseDown={e => handleCellMouseDown(e, key, h)}
                    onDragOver={e => handleCellDragOver(e, cellKey)}
                    onDrop={e => handleCellDrop(e, key, h)}
                  >
                    {hourEvts.map(ev => (
                      <div
                        key={ev.id}
                        className={`emc-week__ev emc-evpill--${ev.type}${ev.status === 'pending' ? ' emc-evpill--pending-status' : ev.status === 'rejected' ? ' emc-evpill--rejected-status' : ev.status === 'tentative' ? ' emc-evpill--tentative-status' : ''}${draggedEventId === ev.id ? ' emc-week__ev--dragging' : ''}`}
                        onClick={e => openEvent(e, ev)}
                        onContextMenu={e => handleEventContextMenu(e, ev)}
                        draggable
                        onDragStart={e => handleEventDragStart(e, ev)}
                        onDragEnd={handleEventDragEnd}
                      >
                        <span className="emc-week__ev-time">{formatTime(ev.start!)}</span>
                        <span className="emc-week__ev-title">{ev.syncProvider && <SyncBadge provider={ev.syncProvider} />}{ev.title}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Day view ───────────────────────────────────────────────────────────────
  const renderDay = () => {
    const key = toDateKey(anchor);
    const dayEvts = eventsByDate[key] ?? [];
    const allDay = dayEvts.filter(e => e.allDay);
    const timed  = dayEvts.filter(e => !e.allDay);

    return (
      <div className="emc-day">
        {allDay.length > 0 && (
          <div className="emc-day__allday">
            <span className="emc-day__allday-label">All day</span>
            {allDay.map(ev => (
              <div key={ev.id} className={`emc-day__alldaypill emc-evpill--${ev.type}${ev.status === 'pending' ? ' emc-evpill--pending-status' : ev.status === 'rejected' ? ' emc-evpill--rejected-status' : ev.status === 'tentative' ? ' emc-evpill--tentative-status' : ''}`} onClick={e => openEvent(e, ev)} onContextMenu={e => handleEventContextMenu(e, ev)}>{ev.syncProvider && <SyncBadge provider={ev.syncProvider} />}{ev.title}</div>
            ))}
          </div>
        )}
        <div className="emc-day__body">
          {HOURS.map(h => {
            const hStr = String(h).padStart(2, '0');
            const hourEvts = timed.filter(ev => ev.start?.startsWith(hStr));
            const inDrag = isHourInDragRange(key, h);
            const cellKey = `${key}-${h}`;
            const isDropTarget = dropTargetCell === cellKey;
            return (
              <div
                key={h}
                className={`emc-day__row${inDrag ? ' emc-day__row--dragselect' : ''}${isDropTarget ? ' emc-day__row--droptarget' : ''}`}
                data-drag-day={key}
                data-drag-hour={h}
                onMouseDown={e => handleCellMouseDown(e, key, h)}
                onDragOver={e => handleCellDragOver(e, cellKey)}
                onDrop={e => handleCellDrop(e, key, h)}
              >
                <div className="emc-day__time">{formatHour(h)}</div>
                <div className="emc-day__slot">
                  {hourEvts.map(ev => (
                    <div
                      key={ev.id}
                      className={`emc-day__ev emc-evpill--${ev.type}${ev.status === 'pending' ? ' emc-evpill--pending-status' : ev.status === 'rejected' ? ' emc-evpill--rejected-status' : ev.status === 'tentative' ? ' emc-evpill--tentative-status' : ''}${draggedEventId === ev.id ? ' emc-day__ev--dragging' : ''}`}
                      onClick={e => openEvent(e, ev)}
                      onContextMenu={e => handleEventContextMenu(e, ev)}
                      draggable
                      onDragStart={e => handleEventDragStart(e, ev)}
                      onDragEnd={handleEventDragEnd}
                    >
                      <div className="emc-day__ev-title">{ev.syncProvider && <SyncBadge provider={ev.syncProvider} />}{ev.title}</div>
                      <div className="emc-day__ev-time">
                        {formatTime(ev.start!)}{ev.end ? ` – ${formatTime(ev.end)}` : ''}
                        {ev.note ? ` · ${ev.note}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── Agenda view ────────────────────────────────────────────────────────────
  const renderAgenda = () => {
    const dateKeys = Object.keys(eventsByDate).sort();

    if (dateKeys.length === 0) {
      return (
        <div className="emc-agenda emc-agenda--empty">
          <CalendarX2 size={22} className="emc-agenda__empty-icon" />
          <p className="emc-agenda__empty-text">No events in this range</p>
        </div>
      );
    }

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return (
      <div className="emc-agenda">
        {dateKeys.map(key => {
          const d = parseLocalDate(key);
          const dayEvts = [...eventsByDate[key]].sort((a, b) => (a.start ?? '').localeCompare(b.start ?? ''));
          const isToday = isSameDay(d, today);
          const isTomorrow = isSameDay(d, tomorrow);
          return (
            <div key={key} className={`emc-agenda__group${isToday ? ' emc-agenda__group--today' : ''}`}>
              <div className="emc-agenda__date">
                {isToday && <span className="emc-agenda__date-badge">Today</span>}
                {isTomorrow && <span className="emc-agenda__date-badge emc-agenda__date-badge--muted">Tomorrow</span>}
                <span className="emc-agenda__date-text">
                  {DAY_SHORT[d.getDay()]}, {MONTH_NAMES[d.getMonth()]} {d.getDate()}
                </span>
              </div>
              <div className="emc-agenda__events">
                {dayEvts.map(ev => {
                  const Icon = AGENDA_TYPE_ICON[ev.type];
                  return (
                    <div key={ev.id} className="emc-agenda__ev" onClick={e => openEvent(e, ev)} onContextMenu={e => handleEventContextMenu(e, ev)}>
                      <div className={`emc-agenda__icon emc-evpill--${ev.type}${ev.status === 'pending' ? ' emc-evpill--pending-status' : ev.status === 'rejected' ? ' emc-evpill--rejected-status' : ev.status === 'tentative' ? ' emc-evpill--tentative-status' : ''}`}>
                        <Icon size={13} />
                      </div>
                      <span className="emc-agenda__ev-time">
                        {ev.allDay ? 'All day' : ev.start ? `${formatTime(ev.start)}${ev.end ? ` – ${formatTime(ev.end)}` : ''}` : ''}
                      </span>
                      <span className="emc-agenda__ev-title">{ev.syncProvider && <SyncBadge provider={ev.syncProvider} />}{ev.title}</span>
                      {ev.ownerName && <span className="emc-agenda__ev-owner">{ev.ownerName}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ── Right-rail event row ───────────────────────────────────────────────────
  const RailEvent: React.FC<{ ev: CalendarEvent; showDate?: boolean }> = ({ ev, showDate }) => {
    const d = parseLocalDate(ev.date);
    return (
      <div className="emc-rail__ev">
        <div className={`emc-rail__dot emc-rail__dot--${ev.type}`} />
        <div className="emc-rail__ev-info">
          <span className="emc-rail__ev-title">{ev.title}</span>
          <span className="emc-rail__ev-time">
            {showDate
              ? `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)}${ev.start ? `, ${formatTime(ev.start)}` : ''}`
              : ev.allDay
                ? 'All day'
                : ev.start
                  ? `${formatTime(ev.start)}${ev.end ? ` – ${formatTime(ev.end)}` : ''}`
                  : ''}
          </span>
        </div>
        {ev.needsResponse && (
          <div className="emc-rail__ev-actions">
            <button type="button" className="emc-iconbtn emc-iconbtn--accept" aria-label="Accept" onClick={() => handleRsvp(ev.id, 'accepted')}><Check size={10} /></button>
            <button type="button" className="emc-iconbtn emc-iconbtn--tentative" aria-label="Tentative" onClick={() => handleRsvp(ev.id, 'tentative')}><HelpCircle size={10} /></button>
            <button type="button" className="emc-iconbtn emc-iconbtn--decline" aria-label="Decline" onClick={() => handleRsvp(ev.id, 'declined')}><X size={10} /></button>
          </div>
        )}
      </div>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="emc-root">

      {dropNotice && <div className="emc-dropnotice">{dropNotice}</div>}

      {/* Header */}
      <div className="emc-header">
        <div className="emc-header__title">
          <div className="emc-scope" ref={scopeMenuRef}>
            <button
              type="button"
              className="emc-scope__trigger"
              onClick={() => setScopeMenuOpen(o => !o)}
              aria-haspopup="listbox"
              aria-expanded={scopeMenuOpen}
            >
              <h2 className="emc-page-title">{scopeLabel}</h2>
              <ChevronDown size={16} className="emc-scope__chevron" />
            </button>
            {scopeMenuOpen && (
              <div className="emc-scope__menu" role="listbox">
                {SCOPE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={scope === opt.value}
                    className={`emc-scope__menu-item${scope === opt.value ? ' emc-scope__menu-item--active' : ''}`}
                    onClick={() => { setScope(opt.value); setScopeMenuOpen(false); }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className="emc-header__sub">Schedule · June 2026</span>
        </div>
        <div className="emc-header__actions">
          <button type="button" className="era-btn era-btn--ghost emc-header__btn" onClick={() => { setDragPrefill(null); setNewEventOpen(true); }}>
            <Plus size={13} />
            New Event
          </button>
          <button
            type="button"
            className="era-btn era-btn--ghost emc-header__btn emc-header__btn--icon"
            aria-label="Calendar settings"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings size={13} />
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="emc-controls">
        <div className="emc-controls__nav">
          <button type="button" className="emc-navbtn" onClick={() => navigate(-1)} aria-label="Previous">
            <ChevronLeft size={14} />
          </button>
          <button type="button" className="emc-navbtn emc-navbtn--today" onClick={() => navigate(0)}>
            Today
          </button>
          <button type="button" className="emc-navbtn" onClick={() => navigate(1)} aria-label="Next">
            <ChevronRight size={14} />
          </button>
        </div>

        <span className="emc-period">{periodLabel}</span>

        <div className="emc-viewswitch">
          {(['day', 'week', 'month', 'agenda'] as CalendarViewMode[]).map(v => (
            <button
              key={v}
              type="button"
              className={`emc-viewbtn${viewMode === v ? ' emc-viewbtn--active' : ''}`}
              onClick={() => setViewMode(v)}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        <div className="emc-filter" ref={filterPanelRef}>
          <button
            type="button"
            className={`emc-navbtn${enabledTypes.size < ALL_EVENT_TYPES.length || searchQuery ? ' emc-navbtn--active' : ''}`}
            aria-label="Filter events"
            aria-expanded={filterPanelOpen}
            onClick={() => setFilterPanelOpen(o => !o)}
          >
            <Filter size={13} />
          </button>
          {filterPanelOpen && (
            <CalendarFilterPanel
              enabledTypes={enabledTypes}
              onToggleType={toggleType}
              onClearTypes={clearTypeFilters}
              onSelectAllTypes={selectAllTypeFilters}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}
        </div>
      </div>

      {/* Body */}
      <div className="emc-body">

        {/* Calendar surface */}
        <div className="era-panel emc-surface">
          {viewMode === 'month'  && renderMonth()}
          {viewMode === 'week'   && renderWeek()}
          {viewMode === 'day'    && renderDay()}
          {viewMode === 'agenda' && renderAgenda()}
        </div>

        {/* Right rail */}
        <div className="emc-rail">

          {/* Selected date */}
          <div className="era-panel emc-rail__section">
            <div className="emc-rail__head">
              <CalendarDays size={13} />
              <span className="emc-rail__title">
                {isSameDay(anchor, today)
                  ? 'Today'
                  : `${DAY_SHORT[anchor.getDay()]}, ${MONTH_NAMES[anchor.getMonth()]} ${anchor.getDate()}`}
              </span>
            </div>
            {anchorEvents.length === 0
              ? <p className="emc-rail__empty">No events</p>
              : (
                <div className="emc-rail__events">
                  {anchorEvents.map(ev => <RailEvent key={ev.id} ev={ev} />)}
                </div>
              )
            }
          </div>

          {/* Pending invitations */}
          {pendingInvites.length > 0 && (
            <div className="era-panel emc-rail__section">
              <div className="emc-rail__head">
                <Users size={13} />
                <span className="emc-rail__title">Invitations</span>
                <span className="emc-rail__badge">{pendingInvites.length}</span>
              </div>
              <div className="emc-rail__events">
                {pendingInvites.map(ev => <RailEvent key={ev.id} ev={ev} showDate />)}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* "+N more" day popover */}
      {dayPopover && (
        <div
          ref={dayPopoverRef}
          className="emc-daypopover"
          style={{ top: dayPopover.top, left: dayPopover.left }}
        >
          <div className="emc-daypopover__head">
            {(() => {
              const d = parseLocalDate(dayPopover.key);
              return `${DAY_SHORT[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
            })()}
          </div>
          <div className="emc-daypopover__events">
            {(eventsByDate[dayPopover.key] ?? []).map(ev => (
              <div
                key={ev.id}
                className="emc-daypopover__ev"
                onClick={e => { setDayPopover(null); openEvent(e, ev); }}
              >
                <span className={`emc-daypopover__dot emc-evpill--${ev.type}`} />
                <span className="emc-daypopover__ev-title">{ev.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Right-click "Duplicate" menu on a meeting event */}
      {eventMenu && (
        <div
          ref={eventMenuRef}
          className="emc-eventmenu"
          style={{ top: eventMenu.top, left: eventMenu.left }}
        >
          <button
            type="button"
            className="emc-eventmenu__item"
            onClick={() => handleDuplicateEvent(eventMenu.event)}
          >
            <Copy size={13} />
            Duplicate
          </button>
        </div>
      )}

      {/* Event details / edit modal */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onDelete={handleDeleteEvent}
          onSave={handleSaveEvent}
          onDuplicate={handleDuplicateEvent}
          existingMyEvents={localEvents.filter(ev => ev.scope === 'my')}
        />
      )}

      {/* Calendar settings (placeholder) */}
      {settingsOpen && (
        <div className="emc-modal-overlay" onClick={() => setSettingsOpen(false)}>
          <div
            className="emc-modal emc-modal--lg"
            role="dialog"
            aria-modal="true"
            aria-label="Calendar settings"
            onClick={e => e.stopPropagation()}
          >
            <header className="emc-modal__header">
              <h3 className="emc-modal__title">Calendar Settings</h3>
              <button type="button" className="emc-modal__close" onClick={() => setSettingsOpen(false)} aria-label="Close">
                <X size={16} />
              </button>
            </header>

            <div className="emc-settings__tabs">
              {SETTINGS_TABS.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  className={`emc-settings__tab${settingsTab === tab.id ? ' emc-settings__tab--active' : ''}`}
                  onClick={() => setSettingsTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="emc-modal__body emc-modal__body--lg">
              {settingsTab === 'sync' && (
                <div className="emc-settings__panel">
                  <div className="emc-rail__head">
                    <RefreshCw size={13} />
                    <span className="emc-rail__title">Calendar Sync</span>
                  </div>
                  <div className="emc-sync">
                    {([
                      { key: 'google',  label: 'Google',  status: syncStatus.google  },
                      { key: 'outlook', label: 'Outlook', status: syncStatus.outlook }
                    ] as const).map(s => (
                      <div key={s.key} className="emc-sync__row">
                        <div className={`emc-sync__dot emc-sync__dot--${s.status}`} />
                        <span className="emc-sync__label">{s.label}</span>
                        <span className={`emc-sync__badge emc-sync__badge--${s.status}`}>
                          {s.status === 'connected' ? 'Connected' : 'Not connected'}
                        </span>
                        {s.status === 'disconnected' ? (
                          <button
                            type="button"
                            className="era-btn era-btn--ghost emc-sync__btn"
                            disabled={connectingProvider === s.key}
                            onClick={() => handleConnect(s.key)}
                          >
                            <RefreshCw size={12} className={connectingProvider === s.key ? 'emc-sync__spin' : ''} />
                            {connectingProvider === s.key ? 'Connecting…' : 'Connect'}
                          </button>
                        ) : (
                          <div className="emc-sync__actions">
                            <button
                              type="button"
                              className="era-btn era-btn--ghost emc-sync__btn"
                              disabled={connectingProvider === s.key}
                              onClick={() => handleSyncNow(s.key)}
                            >
                              <RefreshCw size={12} className={connectingProvider === s.key ? 'emc-sync__spin' : ''} />
                              {connectingProvider === s.key ? 'Syncing…' : 'Sync Now'}
                            </button>
                            <button
                              type="button"
                              className="era-btn era-btn--ghost emc-sync__btn"
                              onClick={() => handleDisconnect(s.key)}
                            >
                              Disconnect
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="emc-sync__meta">Synced {syncStatus.lastSynced}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeConflict && (
        <div className="emc-modal-overlay" onClick={handleConflictKeepMine}>
          <div className="emc-modal emc-modal--conflict" role="dialog" aria-modal="true" aria-label="Sync conflict" onClick={e => e.stopPropagation()}>
            <header className="emc-modal__header">
              <h3 className="emc-modal__title">Sync conflict</h3>
            </header>
            <div className="emc-modal__body">
              <p>
                This event's time was also changed in {activeConflict.provider === 'google' ? 'Google' : 'Outlook'}.
              </p>
              <p className="emc-conflict__title">{activeConflict.conflict.eventTitle}</p>
              <div className="emc-conflict__row">
                <span className="emc-conflict__label">Mine:</span>
                <span>{formatTime(activeConflict.conflict.mineStart)} – {formatTime(activeConflict.conflict.mineEnd)}</span>
              </div>
              <div className="emc-conflict__row">
                <span className="emc-conflict__label">Theirs:</span>
                <span>{formatTime(activeConflict.conflict.theirsStart)} – {formatTime(activeConflict.conflict.theirsEnd)}</span>
              </div>
              <div className="emc-modal__actions">
                <button type="button" className="era-btn era-btn--ghost emc-modal__action" onClick={handleConflictKeepMine}>
                  Keep mine
                </button>
                <button type="button" className="era-btn emc-modal__action" onClick={handleConflictKeepTheirs}>
                  Keep theirs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {newEventOpen && (
        <NewEventWizard
          onClose={() => { setNewEventOpen(false); setDragPrefill(null); }}
          onCreate={handleCreateEvents}
          existingMyEvents={localEvents.filter(ev => ev.scope === 'my')}
          initialOverrides={dragPrefill ?? undefined}
        />
      )}
    </div>
  );
};
