import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  formatHolidayDateRange,
  formatHolidayDisplayDate,
  holidayRangeDayCount,
  parseIsoDate
} from './schedulesConfigUtils';
import type { HolidayType } from './schedulesConfigTypes';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const POPOVER_WIDTH = 280;
const POPOVER_HEIGHT = 320;

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function isBetween(iso: string, start: string, end: string): boolean {
  return iso >= start && iso <= end;
}

interface HolidayDatePickerProps {
  mode: HolidayType;
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
  placeholder?: string;
}

export const HolidayDatePicker: React.FC<HolidayDatePickerProps> = ({
  mode,
  startDate,
  endDate,
  onChange,
  placeholder = 'Pick date'
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const anchorDate = startDate || endDate || toIso(new Date());
  const [viewYear, setViewYear] = useState(() => parseIsoDate(anchorDate).getFullYear());
  const [viewMonth, setViewMonth] = useState(() => parseIsoDate(anchorDate).getMonth());
  const [pendingStart, setPendingStart] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openAbove = spaceAbove >= POPOVER_HEIGHT + 8 || spaceAbove > spaceBelow;

      let top = openAbove ? rect.top - POPOVER_HEIGHT - 6 : rect.bottom + 6;
      let left = rect.left;

      left = Math.min(left, window.innerWidth - POPOVER_WIDTH - 12);
      left = Math.max(12, left);

      if (top < 12) top = rect.bottom + 6;
      if (top + POPOVER_HEIGHT > window.innerHeight - 12) {
        top = Math.max(12, rect.top - POPOVER_HEIGHT - 6);
      }

      setPopoverStyle({
        position: 'fixed',
        top,
        left,
        width: POPOVER_WIDTH,
        zIndex: 300
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, viewMonth, viewYear]);

  useEffect(() => {
    if (startDate) {
      const d = parseIsoDate(startDate);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [startDate]);

  const monthLabel = useMemo(
    () =>
      new Date(viewYear, viewMonth, 1).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric'
      }),
    [viewYear, viewMonth]
  );

  const grid = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const total = daysInMonth(viewYear, viewMonth);
    const cells: { iso: string; day: number }[] = [];
    for (let i = 0; i < firstDay; i++) cells.push({ iso: '', day: 0 });
    for (let d = 1; d <= total; d++) {
      cells.push({ iso: toIso(new Date(viewYear, viewMonth, d)), day: d });
    }
    return cells;
  }, [viewYear, viewMonth]);

  const rangeStart = pendingStart ?? startDate;
  const rangeEnd = pendingStart ? pendingStart : endDate || startDate;
  const lo = rangeStart && rangeEnd ? (rangeStart <= rangeEnd ? rangeStart : rangeEnd) : '';
  const hi = rangeStart && rangeEnd ? (rangeStart <= rangeEnd ? rangeEnd : rangeStart) : '';

  const displayValue =
    mode === 'single'
      ? startDate
        ? formatHolidayDisplayDate(startDate)
        : ''
      : startDate && endDate
        ? formatHolidayDateRange('multiple', startDate, endDate)
        : '';

  const selectDay = (iso: string) => {
    if (mode === 'single') {
      onChange(iso, iso);
      setPendingStart(null);
      setOpen(false);
      return;
    }

    if (!pendingStart) {
      setPendingStart(iso);
      onChange(iso, iso);
      return;
    }

    const start = pendingStart <= iso ? pendingStart : iso;
    const end = pendingStart <= iso ? iso : pendingStart;
    onChange(start, end);
    setPendingStart(null);
    setOpen(false);
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  return (
    <div className="schedules-cfg-date-picker" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`schedules-cfg-date-picker__trigger${open ? ' schedules-cfg-date-picker__trigger--open' : ''}${!displayValue ? ' schedules-cfg-date-picker__trigger--placeholder' : ''}`}
        onClick={() => {
          setOpen(o => !o);
          setPendingStart(null);
        }}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Calendar size={14} />
        <span>{displayValue || placeholder}</span>
      </button>

      {open &&
        createPortal(
          <div
            ref={popoverRef}
            className="schedules-cfg-date-picker__popover schedules-cfg-date-picker__popover--fixed"
            style={popoverStyle}
            role="dialog"
            aria-label="Select date"
          >
            <div className="schedules-cfg-date-picker__nav">
              <button type="button" className="schedules-cfg-date-picker__nav-btn" onClick={prevMonth} aria-label="Previous month">
                <ChevronLeft size={16} />
              </button>
              <span className="schedules-cfg-date-picker__month">{monthLabel}</span>
              <button type="button" className="schedules-cfg-date-picker__nav-btn" onClick={nextMonth} aria-label="Next month">
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="schedules-cfg-date-picker__weekdays">
              {WEEKDAYS.map(d => (
                <span key={d} className="schedules-cfg-date-picker__weekday">{d}</span>
              ))}
            </div>
            <div className="schedules-cfg-date-picker__grid">
              {grid.map((cell, i) => {
                if (!cell.iso) {
                  return (
                    <span
                      key={`empty-${i}`}
                      className="schedules-cfg-date-picker__cell schedules-cfg-date-picker__cell--empty"
                    />
                  );
                }

                const inRange = lo && hi ? isBetween(cell.iso, lo, hi) : cell.iso === startDate;
                const isStart = cell.iso === lo;
                const isEnd = cell.iso === hi;

                return (
                  <button
                    key={cell.iso}
                    type="button"
                    className={[
                      'schedules-cfg-date-picker__cell',
                      inRange && 'schedules-cfg-date-picker__cell--in-range',
                      isStart && 'schedules-cfg-date-picker__cell--start',
                      isEnd && 'schedules-cfg-date-picker__cell--end',
                      (isStart || isEnd) && 'schedules-cfg-date-picker__cell--endpoint'
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => selectDay(cell.iso)}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export function holidayDateLabel(
  type: HolidayType,
  startDate: string,
  endDate: string
): string {
  if (type === 'multiple' && startDate && endDate && startDate !== endDate) {
    const days = holidayRangeDayCount(startDate, endDate);
    return `Date (${days} days)`;
  }
  return 'Date';
}
