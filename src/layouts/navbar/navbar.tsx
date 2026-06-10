import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Search, Users, Building2, LogOut, HelpCircle, KeyRound } from 'lucide-react';
import { appNavDateLabel } from '../../features/employees/data/employee-task-overview.data';
import { AppBrand, type TenantCompany } from '../../shared/components/app-brand/app-brand';
import { UserProfile } from '../../shared/components/user-profile/user-profile';
import { NotificationToggle } from '../../shared/components/notification-toggle/notification-toggle';
import { ThemeSwitcher } from '../../shared/components/theme-switcher/theme-switcher';

interface NavbarProps {
  currentView: 'employee' | 'tenant';
  onToggle: () => void;
  notificationsOpen: boolean;
  notificationUnreadCount: number;
  onToggleNotifications: () => void;
  selectedCompany?: TenantCompany;
  onSelectCompany?: (company: TenantCompany) => void;
  onAddCompany?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onToggle,
  notificationsOpen,
  notificationUnreadCount,
  onToggleNotifications,
  selectedCompany,
  onSelectCompany,
  onAddCompany,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const isTenant = currentView === 'tenant';

  useEffect(() => {
    if (!profileOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [profileOpen]);

  return (
    <header className="app-navbar">

      {/* Left: brand/entity + view switcher */}
      <div className="app-navbar__start">
        <AppBrand
          selectedCompany={isTenant ? selectedCompany : undefined}
          onSelectCompany={isTenant ? onSelectCompany : undefined}
          onAddCompany={isTenant ? onAddCompany : undefined}
          collapsed={false}
        />

        <div className="app-navbar__view-pill">
          <button
            className={`app-navbar__view-btn${currentView === 'employee' ? ' app-navbar__view-btn--active' : ''}`}
            onClick={() => currentView !== 'employee' && onToggle()}
            title="Employee workspace"
          >
            <Users size={11} />
            Employee
          </button>
          <button
            className={`app-navbar__view-btn${currentView === 'tenant' ? ' app-navbar__view-btn--active' : ''}`}
            onClick={() => currentView !== 'tenant' && onToggle()}
            title="Admin workspace"
          >
            <Building2 size={11} />
            Admin
          </button>
        </div>
      </div>

      {/* Right: actions */}
      <div className="app-navbar__actions">
        <div className="app-navbar__date-tab" role="status" aria-label={`Today: ${appNavDateLabel}`}>
          <Calendar size={14} aria-hidden="true" />
          <span>{appNavDateLabel}</span>
        </div>

        <div className="app-navbar__search" role="search">
          <Search size={13} aria-hidden="true" />
          <span className="app-navbar__search-ph">Search…</span>
          <kbd className="app-navbar__kbd">⌘K</kbd>
        </div>

        <ThemeSwitcher />

        <NotificationToggle
          isOpen={notificationsOpen}
          unreadCount={notificationUnreadCount}
          onToggle={onToggleNotifications}
        />

        <div className="app-navbar__divider" aria-hidden="true" />

        {/* Profile dropdown */}
        <div className="navbar-profile" ref={profileRef}>
          <div
            className={`navbar-profile__trigger${profileOpen ? ' navbar-profile__trigger--open' : ''}`}
            onClick={() => setProfileOpen(o => !o)}
            role="button"
            tabIndex={0}
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            onKeyDown={e => e.key === 'Enter' && setProfileOpen(o => !o)}
          >
            <UserProfile currentView={currentView} />
          </div>

          {profileOpen && (
            <div className="navbar-profile__dropdown" role="menu">
              <button
                className="navbar-profile__action"
                role="menuitem"
                onClick={() => { setProfileOpen(false); alert('Apply for Activation — submit your workspace activation request.'); }}
              >
                <KeyRound size={14} aria-hidden="true" />
                Apply for Activation
              </button>
              <button
                className="navbar-profile__action"
                role="menuitem"
                onClick={() => { setProfileOpen(false); alert('Help & Support'); }}
              >
                <HelpCircle size={14} aria-hidden="true" />
                Help & Support
              </button>
              <div className="navbar-profile__dropdown-divider" aria-hidden="true" />
              <button
                className="navbar-profile__action navbar-profile__action--danger"
                role="menuitem"
                onClick={() => { setProfileOpen(false); alert('Logging out…'); }}
              >
                <LogOut size={14} aria-hidden="true" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
