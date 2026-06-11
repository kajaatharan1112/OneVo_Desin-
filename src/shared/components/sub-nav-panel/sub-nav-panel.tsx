import React, { useState } from 'react';
import { ChevronRight, PanelLeftClose } from 'lucide-react';

export interface SubNavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SubNavSection {
  id: string;
  label?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  items: SubNavItem[];
}

interface SubNavPanelProps {
  sections: SubNavSection[];
  panelTitle: string;
  activeId: string;
  onSelect: (id: string) => void;
  onCollapse: () => void;
}

export const SubNavPanel: React.FC<SubNavPanelProps> = ({
  sections,
  panelTitle,
  activeId,
  onSelect,
  onCollapse,
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sections.forEach(s => { initial[s.id] = s.defaultOpen !== false; });
    return initial;
  });

  const toggle = (id: string) =>
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="sub-nav-panel">
      <div className="sub-nav-panel__toolbar">
        <p className="sub-nav-panel__header">{panelTitle}</p>
        <button
          type="button"
          className="sub-nav-panel__collapse"
          onClick={onCollapse}
          aria-label="Collapse section menu"
          title="Collapse section menu"
        >
          <PanelLeftClose size={16} strokeWidth={2} aria-hidden />
        </button>
      </div>

      {sections.map(section => {
        const isOpen = openSections[section.id] !== false;
        return (
          <div key={section.id} className="sub-nav-section">
            {section.label && (
              <button
                type="button"
                className={`sub-nav-section__header${section.collapsible ? ' sub-nav-section__header--collapsible' : ''}`}
                onClick={() => section.collapsible && toggle(section.id)}
                aria-expanded={section.collapsible ? isOpen : undefined}
              >
                <span>{section.label}</span>
                {section.collapsible && (
                  <ChevronRight
                    size={11}
                    className={`sub-nav-section__chevron${isOpen ? ' sub-nav-section__chevron--open' : ''}`}
                    aria-hidden
                  />
                )}
              </button>
            )}

            {isOpen && section.items.map(item => (
              <button
                key={item.id}
                type="button"
                className={`sub-nav-panel__item${activeId === item.id ? ' sub-nav-panel__item--active' : ''}`}
                onClick={() => onSelect(item.id)}
                aria-current={activeId === item.id ? 'page' : undefined}
              >
                {item.icon && (
                  <span className="sub-nav-panel__item-icon">{item.icon}</span>
                )}
                <span className="sub-nav-panel__item-label">{item.label}</span>
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
};
