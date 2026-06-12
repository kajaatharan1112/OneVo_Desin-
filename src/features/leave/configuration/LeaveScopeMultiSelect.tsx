import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';

interface ScopeOption {
  id: string;
  name: string;
}

interface LeaveScopeMultiSelectProps {
  label: string;
  options: ScopeOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
}

export const LeaveScopeMultiSelect: React.FC<LeaveScopeMultiSelectProps> = ({
  label,
  options,
  selectedIds,
  onChange,
  placeholder = 'Search…'
}) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const selected = useMemo(
    () => selectedIds.map(id => options.find(o => o.id === id)).filter(Boolean) as ScopeOption[],
    [selectedIds, options]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options.filter(o => {
      if (selectedIds.includes(o.id)) return false;
      if (!q) return true;
      return o.name.toLowerCase().includes(q);
    });
  }, [options, query, selectedIds]);

  const add = (id: string) => {
    onChange([...selectedIds, id]);
    setQuery('');
  };

  const remove = (id: string) => {
    onChange(selectedIds.filter(s => s !== id));
  };

  return (
    <div className="org-form-field leave-scope-multi">
      <label>{label}</label>

      {selected.length > 0 && (
        <div className="leave-scope-multi__chips">
          {selected.map(item => (
            <span key={item.id} className="leave-scope-multi__chip">
              {item.name}
              <button
                type="button"
                className="leave-scope-multi__chip-remove"
                onClick={() => remove(item.id)}
                aria-label={`Remove ${item.name}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="leave-scope-multi__search-wrap">
        <Search size={14} />
        <input
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
        />
      </div>

      {open && filtered.length > 0 && (
        <ul className="leave-scope-multi__dropdown" role="listbox">
          {filtered.map(option => (
            <li key={option.id}>
              <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => add(option.id)}>
                {option.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && query && filtered.length === 0 && (
        <p className="leave-scope-multi__empty">No matches found.</p>
      )}
    </div>
  );
};
