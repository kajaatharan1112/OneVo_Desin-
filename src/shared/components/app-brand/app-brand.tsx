import React, { useEffect, useRef, useState } from 'react';
import { Building, ChevronDown, Check, Plus } from 'lucide-react';
import './app-brand.css';

export const DEFAULT_TENANT_COMPANY = 'OneVo HRMS' as const;
export const TENANT_COMPANIES = [
  DEFAULT_TENANT_COMPANY,
  'Selfwora',
  'Athvo',
  'Bubble',
  'All'
] as const;
export type TenantCompany = (typeof TENANT_COMPANIES)[number];

const APP_NAME = DEFAULT_TENANT_COMPANY;

interface AppBrandProps {
  onClick?: () => void;
  onBrandNameClick?: () => void;
  selectedCompany?: TenantCompany;
  onSelectCompany?: (company: TenantCompany) => void;
  onAddCompany?: () => void;
  collapsed?: boolean;
}

export const AppBrand: React.FC<AppBrandProps> = ({
  onClick,
  onBrandNameClick,
  selectedCompany,
  onSelectCompany,
  onAddCompany,
  collapsed = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasSwitcher = Boolean(onSelectCompany && selectedCompany) && !collapsed;

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (collapsed) setIsOpen(false);
  }, [collapsed]);

  const handleSelect = (company: TenantCompany) => {
    onSelectCompany?.(company);
    setIsOpen(false);
  };

  const handleAddCompany = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    onAddCompany?.();
  };

  const handleToggle = () => {
    setIsOpen((open) => !open);
  };

  const handleBrandNameClick = () => {
    onBrandNameClick?.();
    onClick?.();
  };

  const containerClass = [
    'app-brand-container',
    hasSwitcher && 'app-brand-container--switcher',
    isOpen && 'app-brand-container--open'
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClass} ref={containerRef}>
      <div className="app-brand">
        <div className="app-logo" title={APP_NAME} aria-label={APP_NAME}>
          V
        </div>

        {!collapsed && (
          <>
            {hasSwitcher ? (
              <div className="app-brand-trigger app-brand-trigger--split">
                <button
                  type="button"
                  className="app-brand-name-btn"
                  onClick={handleBrandNameClick}
                  aria-label={`${APP_NAME}. Open quick actions`}
                >
                  <span className="app-brand-name">{APP_NAME}</span>
                </button>
                <button
                  type="button"
                  className="app-brand-chevron-btn"
                  onClick={handleToggle}
                  aria-expanded={isOpen}
                  aria-haspopup="listbox"
                  aria-label={
                    selectedCompany
                      ? `Current company: ${selectedCompany}. Open company menu`
                      : 'Open company menu'
                  }
                >
                  <ChevronDown
                    size={14}
                    className={`app-brand-chevron${isOpen ? ' app-brand-chevron--open' : ''}`}
                    aria-hidden
                  />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="app-brand-trigger app-brand-trigger--static"
                onClick={handleBrandNameClick}
                aria-label={`${APP_NAME}. Open quick actions`}
              >
                <span className="app-brand-name app-title">{APP_NAME}</span>
              </button>
            )}
          </>
        )}
      </div>

      {hasSwitcher && (
        <div
          className={`app-brand-menu-wrap${isOpen ? ' app-brand-menu-wrap--open' : ''}`}
          aria-hidden={!isOpen}
        >
          <ul className="app-brand-menu" role="listbox" aria-label="Select company">
            {TENANT_COMPANIES.map((company) => (
              <li key={company}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selectedCompany === company}
                  tabIndex={isOpen ? 0 : -1}
                  className={`app-brand-menu__item${
                    selectedCompany === company ? ' app-brand-menu__item--active' : ''
                  }`}
                  onClick={() => handleSelect(company)}
                >
                  <Building size={14} aria-hidden />
                  <span style={{ flex: 1 }}>{company}</span>
                  {selectedCompany === company && (
                    <Check size={13} className="app-brand-menu__item-check" aria-hidden />
                  )}
                </button>
              </li>
            ))}
            <li className="app-brand-menu__divider" aria-hidden />
            <li>
              <button
                type="button"
                tabIndex={isOpen ? 0 : -1}
                className="app-brand-menu__item app-brand-menu__item--add"
                onClick={handleAddCompany}
              >
                <Plus size={14} aria-hidden />
                Add company
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
