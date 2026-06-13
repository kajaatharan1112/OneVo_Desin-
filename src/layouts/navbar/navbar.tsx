import React, { useState, useRef, useEffect } from 'react';

import { Calendar, LogOut, Settings, Shield, User } from 'lucide-react';
import { MySecurityDrawer } from '../../shared/components/my-security/my-security-drawer';

import { NavbarSearch } from './navbar-search';

import { WorkspaceSelector } from './workspace-selector';

import { appNavDateLabel } from '../../features/employees/data/employee-task-overview.data';

import { AppBrand, type TenantCompany } from '../../shared/components/app-brand/app-brand';

import { UserProfile } from '../../shared/components/user-profile/user-profile';

import { EmployeeSwitcher } from '../../shared/components/employee-switcher/employee-switcher';

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

  onOpenSettings?: () => void;

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

  onOpenSettings,

}) => {

  const [profileOpen, setProfileOpen] = useState(false);
  const [mySecurityOpen, setMySecurityOpen] = useState(false);

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



      <div className="app-navbar__start">

        <AppBrand
          selectedCompany={isTenant ? selectedCompany : undefined}
          onSelectCompany={isTenant ? onSelectCompany : undefined}
          onAddCompany={isTenant ? onAddCompany : undefined}
          collapsed={false}
        />



        <WorkspaceSelector currentView={currentView} onSelect={onToggle} />

      </div>



      <div className="app-navbar__center">

        <NavbarSearch />

      </div>



      <div className="app-navbar__actions">

        <div className="app-navbar__date-tab" role="status" aria-label={`Today: ${appNavDateLabel}`}>

          <Calendar size={14} aria-hidden="true" />

          <span>{appNavDateLabel}</span>

        </div>



        <div className="app-navbar__command" aria-label="Topbar actions">

          <ThemeSwitcher />

          <NotificationToggle

            isOpen={notificationsOpen}

            unreadCount={notificationUnreadCount}

            onToggle={onToggleNotifications}

          />

        </div>



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

              {!isTenant && (

                <div className="navbar-profile__switcher">

                  <EmployeeSwitcher />

                </div>

              )}

              <button

                className="navbar-profile__action"

                role="menuitem"

                onClick={() => setProfileOpen(false)}

              >

                <User size={14} aria-hidden="true" />

                Profile

              </button>

              <button

                className="navbar-profile__action"

                role="menuitem"

                onClick={() => {

                  setProfileOpen(false);

                  setMySecurityOpen(true);

                }}

              >

                <Shield size={14} aria-hidden="true" />

                My Security

              </button>

              <button

                className="navbar-profile__action"

                role="menuitem"

                onClick={() => {

                  setProfileOpen(false);

                  onOpenSettings?.();

                }}

              >

                <Settings size={14} aria-hidden="true" />

                Settings

              </button>

              <div className="navbar-profile__dropdown-divider" aria-hidden="true" />

              <button

                className="navbar-profile__action navbar-profile__action--danger"

                role="menuitem"

                onClick={() => { setProfileOpen(false); alert('Signing out…'); }}

              >

                <LogOut size={14} aria-hidden="true" />

                Sign out

              </button>

            </div>

          )}

        </div>

      </div>

      {mySecurityOpen && (
        <MySecurityDrawer onClose={() => setMySecurityOpen(false)} />
      )}

    </header>

  );

};

