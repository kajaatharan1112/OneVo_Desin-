import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

interface ConfigShellHeaderSearch {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}

interface ConfigShellHeaderProps {
  title: string;
  icon: React.ReactNode;
  actions?: React.ReactNode;
  search?: ConfigShellHeaderSearch;
}

export const ConfigShellHeader: React.FC<ConfigShellHeaderProps> = ({
  title,
  icon,
  actions,
  search
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const showSearchInput = Boolean(search && (searchOpen || search.value));

  return (
    <div className="cfg-shell-header">
      <div className="cfg-shell-header__context">
        <span className="cfg-shell-header__icon" aria-hidden="true">
          {icon}
        </span>
        <h1 className="cfg-shell-header__title">{title}</h1>
      </div>

      {(search || actions) && (
        <div className="cfg-shell-header__actions">
          {search && (
            <div className={`cfg-shell-search${showSearchInput ? ' cfg-shell-search--open' : ''}`}>
              {showSearchInput ? (
                <>
                  <Search size={14} />
                  <input
                    autoFocus
                    placeholder={search.placeholder}
                    value={search.value}
                    onChange={e => search.onChange(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Escape') {
                        search.onChange('');
                        setSearchOpen(false);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="cfg-shell-search__clear"
                    onClick={() => {
                      search.onChange('');
                      setSearchOpen(false);
                    }}
                    aria-label={`Close ${search.label}`}
                  >
                    <X size={13} />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="cfg-shell-search__trigger"
                  onClick={() => setSearchOpen(true)}
                  aria-label={search.label}
                >
                  <Search size={15} />
                </button>
              )}
            </div>
          )}
          {actions}
        </div>
      )}
    </div>
  );
};
