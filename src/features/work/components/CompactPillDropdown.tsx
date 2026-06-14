import React, { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface PillDropdownOption {
  id: string;
  label: string;
  subtext?: string;
}

interface Props {
  icon: React.ReactNode;
  value: string;
  options: PillDropdownOption[];
  onChange: (id: string) => void;
  ariaLabel: string;
  /** Fixed prefix label on the pill (e.g. "Lead"). When set, shown before the selected option label. */
  prefixLabel?: string;
}

export const CompactPillDropdown: React.FC<Props> = ({
  icon,
  value,
  options,
  onChange,
  ariaLabel,
  prefixLabel,
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find(o => o.id === value) ?? options[0];

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

  return (
    <div className="work-pill-dropdown" ref={rootRef}>
      <button
        type="button"
        className="work-pill-dropdown__trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen(v => !v)}
      >
        <span className="work-pill-dropdown__icon" aria-hidden="true">{icon}</span>
        <span className="work-pill-dropdown__label">{prefixLabel ?? selected?.label}</span>
        <ChevronDown size={14} className="work-pill-dropdown__chevron" aria-hidden="true" />
      </button>
      {open && (
        <ul id={listId} className="work-pill-dropdown__menu" role="listbox" aria-label={ariaLabel}>
          {options.map(opt => (
            <li key={opt.id} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={opt.id === value}
                className={`work-pill-dropdown__option${opt.id === value ? ' work-pill-dropdown__option--active' : ''}`}
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
              >
                <span className="work-pill-dropdown__option-label">{opt.label}</span>
                {opt.subtext && (
                  <span className="work-pill-dropdown__option-sub">{opt.subtext}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
