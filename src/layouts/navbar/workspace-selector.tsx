import React, { useEffect, useRef, useState } from 'react';
import { Briefcase, Check, ChevronDown, UserRound } from 'lucide-react';

const WORKSPACES = [
  { id: 'employee' as const, label: 'Employee Workspace', Icon: UserRound },
  { id: 'tenant' as const, label: 'Management Workspace', Icon: Briefcase },
];

interface WorkspaceSelectorProps {
  currentView: 'employee' | 'tenant';
  onSelect: () => void;
}

export const WorkspaceSelector: React.FC<WorkspaceSelectorProps> = ({
  currentView,
  onSelect,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = WORKSPACES.find((workspace) => workspace.id === currentView) ?? WORKSPACES[0];
  const ActiveIcon = active.Icon;

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const selectWorkspace = (id: 'employee' | 'tenant') => {
    if (id !== currentView) onSelect();
    setOpen(false);
  };

  return (
    <div className="app-navbar__workspace" ref={ref}>
      <button
        type="button"
        className={`app-navbar__workspace-trigger${open ? ' app-navbar__workspace-trigger--open' : ''}`}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Workspace: ${active.label}`}
      >
        <ActiveIcon size={14} className="app-navbar__workspace-trigger-icon" aria-hidden="true" />
        <span className="app-navbar__workspace-trigger-label">{active.label}</span>
        <ChevronDown
          size={14}
          className={`app-navbar__workspace-chevron${open ? ' app-navbar__workspace-chevron--open' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul className="app-navbar__workspace-menu" role="listbox" aria-label="Select workspace">
          {WORKSPACES.map((workspace) => {
            const Icon = workspace.Icon;
            const isActive = workspace.id === currentView;
            return (
              <li key={workspace.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={`app-navbar__workspace-option${isActive ? ' app-navbar__workspace-option--active' : ''}`}
                  onClick={() => selectWorkspace(workspace.id)}
                >
                  <Icon size={14} aria-hidden="true" />
                  <span>{workspace.label}</span>
                  {isActive && <Check size={13} className="app-navbar__workspace-check" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
