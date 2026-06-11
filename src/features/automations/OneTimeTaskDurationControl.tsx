import React, { useEffect, useRef, useState } from 'react';
import {
  TASK_MAX_DURATION_MINUTES,
  TASK_MINUTE_OPTIONS,
  TASK_MIN_DURATION_ERROR,
  adjustDurationByQuarterHour,
  clampTaskHours,
  formatDurationHHMM,
  getTotalDurationMinutes,
  normalizeTaskMinutes
} from './oneTimeTaskUtils';

interface OneTimeTaskDurationControlProps {
  hours: number;
  minutes: number;
  onChange: (hours: number, minutes: number) => void;
  error?: string | null;
}

export const OneTimeTaskDurationControl: React.FC<OneTimeTaskDurationControlProps> = ({
  hours,
  minutes,
  onChange,
  error
}) => {
  const safeHours = clampTaskHours(hours);
  const safeMinutes = normalizeTaskMinutes(minutes);
  const total = getTotalDurationMinutes(safeHours, safeMinutes);

  const [editing, setEditing] = useState(false);
  const [draftHours, setDraftHours] = useState(safeHours);
  const [draftMinutes, setDraftMinutes] = useState(safeMinutes);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editing) return;
    setDraftHours(safeHours);
    setDraftMinutes(safeMinutes);
  }, [editing, safeHours, safeMinutes]);

  useEffect(() => {
    if (!editing) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(e.target as Node)) {
        applyDraft();
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [editing, draftHours, draftMinutes]);

  const showMinError = total < 15;
  const displayError = error ?? (showMinError ? TASK_MIN_DURATION_ERROR : null);

  const canDecrement = total > 0;
  const canIncrement = total < TASK_MAX_DURATION_MINUTES;

  const applyDraft = () => {
    onChange(clampTaskHours(draftHours), normalizeTaskMinutes(draftMinutes));
    setEditing(false);
  };

  const openEditor = () => {
    setDraftHours(safeHours);
    setDraftMinutes(safeMinutes);
    setEditing(true);
  };

  return (
    <div className="auto-alarm-picker">
      <div className="auto-alarm-picker__pill">
        <button
          type="button"
          className="auto-alarm-picker__time"
          onClick={openEditor}
          aria-label={`Duration ${formatDurationHHMM(safeHours, safeMinutes)}`}
        >
          {formatDurationHHMM(safeHours, safeMinutes)}
        </button>

        <div className="auto-alarm-picker__adjust">
          <button
            type="button"
            className="auto-alarm-picker__step"
            disabled={!canDecrement}
            onClick={() => {
              const next = adjustDurationByQuarterHour(safeHours, safeMinutes, -15);
              onChange(next.hours, next.minutes);
            }}
          >
            -15m
          </button>
          <button
            type="button"
            className="auto-alarm-picker__step"
            disabled={!canIncrement}
            onClick={() => {
              const next = adjustDurationByQuarterHour(safeHours, safeMinutes, 15);
              onChange(next.hours, next.minutes);
            }}
          >
            +15m
          </button>
        </div>
      </div>

      {editing && (
        <div className="auto-alarm-picker__editor" ref={editorRef}>
          <div className="auto-alarm-picker__editor-row">
            <label>Hours</label>
            <input
              type="number"
              min={0}
              max={720}
              step={1}
              value={draftHours}
              onChange={e => setDraftHours(clampTaskHours(Number(e.target.value)))}
            />
          </div>
          <div className="auto-alarm-picker__editor-row">
            <label>Minutes</label>
            <div className="auto-alarm-picker__segments" role="group" aria-label="Minutes">
              {TASK_MINUTE_OPTIONS.map(m => (
                <button
                  key={m}
                  type="button"
                  className={`auto-alarm-picker__segment${draftMinutes === m ? ' auto-alarm-picker__segment--active' : ''}`}
                  onClick={() => setDraftMinutes(m)}
                >
                  {String(m).padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>
          <button type="button" className="org-btn org-btn--secondary org-btn--sm auto-alarm-picker__done" onClick={applyDraft}>
            Done
          </button>
        </div>
      )}

      {displayError && (
        <p className="auto-alarm-picker__error">{displayError}</p>
      )}
    </div>
  );
};
