import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface DateRange {
  start: string;
  end: string;
}

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatChipDate(iso: string): string {
  return parseIso(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function isBetween(iso: string, start: string, end: string): boolean {
  return iso >= start && iso <= end;
}

export function formatWorklogsDateChip(start: string, end: string): string {
  return `${formatChipDate(start)} -> ${formatChipDate(end)}`;
}

export const DateRangePicker: React.FC<Props> = ({ value, onChange, className }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => parseIso(value.end).getFullYear());
  const [viewMonth, setViewMonth] = useState(() => parseIso(value.end).getMonth());
  const [pendingStart, setPendingStart] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
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

  const monthLabel = useMemo(
    () => new Date(viewYear, viewMonth, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
    [viewYear, viewMonth],
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

  const rangeStart = pendingStart ?? value.start;
  const rangeEnd = pendingStart ?? value.end;
  const lo = rangeStart <= rangeEnd ? rangeStart : rangeEnd;
  const hi = rangeStart <= rangeEnd ? rangeEnd : rangeStart;

  const selectDay = (iso: string) => {
    if (!pendingStart) {
      setPendingStart(iso);
      return;
    }
    const start = pendingStart <= iso ? pendingStart : iso;
    const end = pendingStart <= iso ? iso : pendingStart;
    onChange({ start, end });
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
    <div className={`work-date-range${className ? ` ${className}` : ''}`} ref={rootRef}>
      <button
        type="button"
        className={`work-date-range__trigger${open ? ' work-date-range__trigger--open' : ''}`}
        onClick={() => {
          setOpen(o => !o);
          setPendingStart(null);
          setViewYear(parseIso(value.end).getFullYear());
          setViewMonth(parseIso(value.end).getMonth());
        }}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        {formatWorklogsDateChip(value.start, value.end)}
      </button>
      {open && (
        <div className="work-date-range__popover" role="dialog" aria-label="Select date range">
          <div className="work-date-range__nav">
            <button type="button" className="work-date-range__nav-btn" onClick={prevMonth} aria-label="Previous month">
              <ChevronLeft size={16} />
            </button>
            <span className="work-date-range__month">{monthLabel}</span>
            <button type="button" className="work-date-range__nav-btn" onClick={nextMonth} aria-label="Next month">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="work-date-range__weekdays">
            {WEEKDAYS.map(d => (
              <span key={d} className="work-date-range__weekday">{d}</span>
            ))}
          </div>
          <div className="work-date-range__grid">
            {grid.map((cell, i) => {
              if (!cell.iso) return <span key={`empty-${i}`} className="work-date-range__cell work-date-range__cell--empty" />;
              const inRange = isBetween(cell.iso, lo, hi);
              const isStart = cell.iso === lo;
              const isEnd = cell.iso === hi;
              return (
                <button
                  key={cell.iso}
                  type="button"
                  className={[
                    'work-date-range__cell',
                    inRange && 'work-date-range__cell--in-range',
                    isStart && 'work-date-range__cell--start',
                    isEnd && 'work-date-range__cell--end',
                    (isStart || isEnd) && 'work-date-range__cell--endpoint',
                  ].filter(Boolean).join(' ')}
                  onClick={() => selectDay(cell.iso)}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
