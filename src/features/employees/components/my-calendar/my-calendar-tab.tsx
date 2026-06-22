import React, { useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, CalendarDays,
  Users, RefreshCw, Filter, Plus, Check, X
} from 'lucide-react';
import { employeeCalendarData } from '../../data/employee-calendar.data';
import type { CalendarEvent, CalendarViewMode } from '../../types/employee-calendar.types';

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

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 10 }, (_, i) => i + 8); // 8 AM – 5 PM

// ── Main component ─────────────────────────────────────────────────────────

export const MyCalendarTab: React.FC = () => {
  const { events, syncStatus } = employeeCalendarData;

  const today = useMemo(() => parseLocalDate(TODAY_KEY), []);

  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [anchor, setAnchor] = useState<Date>(() => parseLocalDate(TODAY_KEY));

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
    events.forEach(ev => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return map;
  }, [events]);

  const pendingInvites = useMemo(() => events.filter(e => e.needsResponse), [events]);

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
                    <div key={ev.id} className={`emc-month__evpill emc-evpill--${ev.type}`}>
                      {ev.title}
                    </div>
                  ))}
                  {dayEvts.length > 3 && (
                    <div className="emc-month__evpill emc-evpill--more">+{dayEvts.length - 3} more</div>
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
                  <div key={ev.id} className={`emc-week__evpill emc-evpill--${ev.type}`}>{ev.title}</div>
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
                return (
                  <div key={key} className={`emc-week__cell${isToday ? ' emc-week__cell--today' : ''}`}>
                    {hourEvts.map(ev => (
                      <div key={ev.id} className={`emc-week__ev emc-evpill--${ev.type}`}>
                        <span className="emc-week__ev-time">{formatTime(ev.start!)}</span>
                        <span className="emc-week__ev-title">{ev.title}</span>
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
              <div key={ev.id} className={`emc-day__alldaypill emc-evpill--${ev.type}`}>{ev.title}</div>
            ))}
          </div>
        )}
        <div className="emc-day__body">
          {HOURS.map(h => {
            const hStr = String(h).padStart(2, '0');
            const hourEvts = timed.filter(ev => ev.start?.startsWith(hStr));
            return (
              <div key={h} className="emc-day__row">
                <div className="emc-day__time">{formatHour(h)}</div>
                <div className="emc-day__slot">
                  {hourEvts.map(ev => (
                    <div key={ev.id} className={`emc-day__ev emc-evpill--${ev.type}`}>
                      <div className="emc-day__ev-title">{ev.title}</div>
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
            <button type="button" className="emc-iconbtn emc-iconbtn--accept" aria-label="Accept"><Check size={10} /></button>
            <button type="button" className="emc-iconbtn emc-iconbtn--decline" aria-label="Decline"><X size={10} /></button>
          </div>
        )}
      </div>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="emc-root">

      {/* Header */}
      <div className="emc-header">
        <div className="emc-header__title">
          <h2 className="emc-page-title">My Calendar</h2>
          <span className="emc-header__sub">Schedule · June 2026</span>
        </div>
        <button type="button" className="era-btn era-btn--ghost emc-header__btn">
          <Plus size={13} />
          New Event
        </button>
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
          {(['day', 'week', 'month'] as CalendarViewMode[]).map(v => (
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

        <button type="button" className="emc-navbtn" aria-label="Filter events">
          <Filter size={13} />
        </button>
      </div>

      {/* Body */}
      <div className="emc-body">

        {/* Calendar surface */}
        <div className="era-panel emc-surface">
          {viewMode === 'month' && renderMonth()}
          {viewMode === 'week'  && renderWeek()}
          {viewMode === 'day'   && renderDay()}
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

          {/* Sync status */}
          <div className="era-panel emc-rail__section">
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
                </div>
              ))}
            </div>
            <div className="emc-sync__meta">Synced {syncStatus.lastSynced}</div>
          </div>

        </div>
      </div>
    </div>
  );
};
