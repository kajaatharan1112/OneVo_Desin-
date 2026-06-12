import React, { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';

export const NavbarSearch: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const closeSearch = () => setExpanded(false);

  useEffect(() => {
    if (!expanded) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeSearch();
    };

    const handlePointerDown = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        closeSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [expanded]);

  const openSearch = () => {
    setExpanded(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div className="app-navbar__search-anchor">
      <div
        ref={wrapRef}
        className={`app-navbar__search-wrap${expanded ? ' app-navbar__search-wrap--expanded' : ''}`}
        role="search"
      >
      <div className="app-navbar__search-field">
        <Search
          size={expanded ? 16 : 14}
          className="app-navbar__search-icon"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="search"
          className="app-navbar__search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={openSearch}
          placeholder="Search"
          aria-label="Search workspace"
          aria-expanded={expanded}
          aria-controls="app-navbar-search-panel"
          autoComplete="off"
        />
      </div>

      {expanded && (
        <div id="app-navbar-search-panel" className="app-navbar__search-panel">
          {!query.trim() && (
            <div className="app-navbar__search-empty">
              <Search
                size={36}
                strokeWidth={1.75}
                className="app-navbar__search-empty-icon"
                aria-hidden="true"
              />
              <p className="app-navbar__search-empty-title">Search your workspace</p>
              <p className="app-navbar__search-empty-text">
                Start typing to search across employees, departments, projects, automations, and settings.
              </p>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
};
