import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Calendar, LogOut, Settings, Shield, User, Play, Square, Coffee, Utensils } from 'lucide-react';
import { MySecurityDrawer } from '../../shared/components/my-security/my-security-drawer';

import { NavbarSearch } from './navbar-search';


import { appNavDateLabel } from '../../shared/constants/app-nav';

import { AppBrand, type TenantCompany } from '../../shared/components/app-brand/app-brand';

import { UserProfile } from '../../shared/components/user-profile/user-profile';

import { EmployeeSwitcher } from '../../shared/components/employee-switcher/employee-switcher';

import { NotificationToggle } from '../../shared/components/notification-toggle/notification-toggle';

import { ThemeSwitcher } from '../../shared/components/theme-switcher/theme-switcher';

import { useEmployeeContext } from '../../features/employees/context/employee-context';
import { useClockInPolicyStore } from '../../features/time-attendance/clock-in-policy/clockInPolicyStore';
import { useOrganizationStore } from '../../store/organizationStore';
import { useSchedulesConfigStore } from '../../store/schedulesConfigStore';
import { resolveClockInRequirement } from '../../features/people/employees/employeeClockInUtils';
import { PROFILE_TO_ORG_EMPLOYEE } from '../../features/access/employeeProfileMap';



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

  onOpenBrandActions?: () => void;

}



export const Navbar: React.FC<NavbarProps> = ({

  currentView,

  onToggle: _onToggle,

  notificationsOpen,

  notificationUnreadCount,

  onToggleNotifications,

  selectedCompany,

  onSelectCompany,

  onAddCompany,

  onOpenSettings,

  onOpenBrandActions,

}) => {

  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mySecurityOpen, setMySecurityOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  const isTenant = currentView === 'tenant';

  // Clock-in policy and user resolution
  const { selectedEmployeeId } = useEmployeeContext();
  const { defaultRequirement, exemptions } = useClockInPolicyStore();
  const { positions, assignments, employees: orgEmployees } = useOrganizationStore();

  const orgEmployeeId = PROFILE_TO_ORG_EMPLOYEE[selectedEmployeeId];
  const orgEmployee = orgEmployees.find(e => e.id === orgEmployeeId);

  // Exemption is resolved:
  // - For CEO ('marcus' -> 'emp-1'): check resolved policy
  // - For any other user: always required
  const isCeo = selectedEmployeeId === 'marcus';
  const requiresClockIn = isCeo
    ? (orgEmployee ? resolveClockInRequirement(orgEmployee, positions, assignments, exemptions, defaultRequirement).required : true)
    : true;

  // Persist clock-in status per profile in local storage
  const storageKeyStatus = `clock_in_status_${selectedEmployeeId}`;
  const storageKeyTime = `clock_in_time_${selectedEmployeeId}`;

  const [isClockedIn, setIsClockedIn] = useState(() => {
    return localStorage.getItem(storageKeyStatus) === 'true';
  });

  const [clockInTime, setClockInTime] = useState<number | null>(() => {
    const val = localStorage.getItem(storageKeyTime);
    return val ? parseInt(val, 10) : null;
  });

  const [elapsedString, setElapsedString] = useState('00:00:00');

  useEffect(() => {
    const statusVal = localStorage.getItem(`clock_in_status_${selectedEmployeeId}`) === 'true';
    const timeVal = localStorage.getItem(`clock_in_time_${selectedEmployeeId}`);
    setIsClockedIn(statusVal);
    setClockInTime(timeVal ? parseInt(timeVal, 10) : null);
  }, [selectedEmployeeId]);

  useEffect(() => {
    localStorage.setItem(storageKeyStatus, isClockedIn ? 'true' : 'false');
    if (clockInTime) {
      localStorage.setItem(storageKeyTime, clockInTime.toString());
    } else {
      localStorage.removeItem(storageKeyTime);
    }
  }, [isClockedIn, clockInTime, selectedEmployeeId, storageKeyStatus, storageKeyTime]);


  useEffect(() => {
    if (!isClockedIn || !clockInTime) {
      setElapsedString('00:00:00');
      return;
    }

    const updateTimer = () => {
      const diffMs = Date.now() - clockInTime;
      const totalSecs = Math.floor(diffMs / 1000);
      const hrs = Math.floor(totalSecs / 3600);
      const mins = Math.floor((totalSecs % 3600) / 60);
      const secs = totalSecs % 60;

      const formatNum = (n: number) => String(n).padStart(2, '0');
      setElapsedString(`${formatNum(hrs)}:${formatNum(mins)}:${formatNum(secs)}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isClockedIn, clockInTime]);

  const handleClockToggle = () => {
    const nextStatus = !isClockedIn;
    const nextTime = nextStatus ? Date.now() : null;

    if (isClockedIn && clockInTime) {
      const elapsedSecs = Math.max(0, Math.floor((Date.now() - clockInTime) / 1000));
      localStorage.setItem(`last_clock_in_time_${selectedEmployeeId}`, clockInTime.toString());
      localStorage.setItem(`last_elapsed_secs_${selectedEmployeeId}`, elapsedSecs.toString());
      localStorage.setItem(`last_clock_out_time_${selectedEmployeeId}`, Date.now().toString());
    }

    setIsClockedIn(nextStatus);
    setClockInTime(nextTime);

    localStorage.setItem(storageKeyStatus, nextStatus ? 'true' : 'false');
    if (nextTime) {
      localStorage.setItem(storageKeyTime, nextTime.toString());
    } else {
      localStorage.removeItem(storageKeyTime);
    }

    window.dispatchEvent(new CustomEvent('clock_in_change', {
      detail: { employeeId: selectedEmployeeId, isClockedIn: nextStatus, clockInTime: nextTime }
    }));
  };

  // Resolve schedule for active employee
  const { schedules } = useSchedulesConfigStore();
  const matchedSchedule = React.useMemo(() => {
    if (!orgEmployeeId) return schedules.find(s => s.isDefault) || schedules[0];
    
    // 1. Specific Employee assignment
    const empSched = schedules.find(s => s.assignmentTarget === 'employee' && s.employeeIds.includes(orgEmployeeId));
    if (empSched) return empSched;
    
    // 2. Department assignment
    const activeAssign = assignments.find(a => a.employeeId === orgEmployeeId && a.status === 'active' && !a.effectiveTo);
    if (activeAssign) {
      const position = positions.find(p => p.id === activeAssign.positionId);
      if (position) {
        const deptSched = schedules.find(s => s.assignmentTarget === 'department' && s.departmentIds.includes(position.departmentId));
        if (deptSched) return deptSched;
      }
    }
    
    // 3. Company-wide assignment or Default schedule
    const companySched = schedules.find(s => s.assignmentTarget === 'company');
    if (companySched) return companySched;
    
    return schedules.find(s => s.isDefault) || schedules[0];
  }, [schedules, orgEmployeeId, assignments, positions]);

  // Current time state (hours:minutes format, e.g. "13:30")
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setCurrentTimeStr(`${hrs}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Find if there is an active break period right now
  const activeBreakPeriod = React.useMemo(() => {
    if (!currentTimeStr || !matchedSchedule || !matchedSchedule.breakPeriods) return null;
    return matchedSchedule.breakPeriods.find(bp => {
      return currentTimeStr >= bp.startTime && currentTimeStr <= bp.endTime;
    }) || null;
  }, [currentTimeStr, matchedSchedule]);

  // Break state hooks
  const breakStatusKey = activeBreakPeriod ? `break_status_${selectedEmployeeId}_${activeBreakPeriod.id}` : '';
  const breakStartTimeKey = activeBreakPeriod ? `break_start_time_${selectedEmployeeId}_${activeBreakPeriod.id}` : '';

  const [breakStatus, setBreakStatus] = useState<string | null>(null);
  const [breakStartTime, setBreakStartTime] = useState<number | null>(null);
  const [breakElapsedString, setBreakElapsedString] = useState('00:00');

  // Load status from local storage when active break period or employee changes
  useEffect(() => {
    if (breakStatusKey) {
      setBreakStatus(localStorage.getItem(breakStatusKey));
    } else {
      setBreakStatus(null);
    }
    if (breakStartTimeKey) {
      const val = localStorage.getItem(breakStartTimeKey);
      setBreakStartTime(val ? parseInt(val, 10) : null);
    } else {
      setBreakStartTime(null);
    }
  }, [breakStatusKey, breakStartTimeKey, selectedEmployeeId]);

  // Break timer effect
  useEffect(() => {
    if (breakStatus !== 'running' || !breakStartTime) {
      setBreakElapsedString('00:00');
      return;
    }
    const updateBreakTimer = () => {
      const diffMs = Date.now() - breakStartTime;
      const totalSecs = Math.floor(diffMs / 1000);
      const mins = Math.floor(totalSecs / 60);
      const secs = totalSecs % 60;
      const formatNum = (n: number) => String(n).padStart(2, '0');
      setBreakElapsedString(`${formatNum(mins)}:${formatNum(secs)}`);
    };
    updateBreakTimer();
    const interval = setInterval(updateBreakTimer, 1000);
    return () => clearInterval(interval);
  }, [breakStatus, breakStartTime]);

  const handleStartBreak = () => {
    if (breakStatusKey && breakStartTimeKey) {
      localStorage.setItem(breakStatusKey, 'running');
      localStorage.setItem(breakStartTimeKey, Date.now().toString());
      setBreakStatus('running');
      setBreakStartTime(Date.now());
    }
  };

  const handleEndBreak = () => {
    if (breakStatusKey && breakStartTimeKey) {
      localStorage.setItem(breakStatusKey, 'completed');
      localStorage.removeItem(breakStartTimeKey);
      setBreakStatus('completed');
      setBreakStartTime(null);
    }
  };




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
          onBrandNameClick={onOpenBrandActions}
          collapsed={false}
        />

      </div>



      <div className="app-navbar__center">

        <NavbarSearch />

      </div>



      <div className="app-navbar__actions">

        {isClockedIn && activeBreakPeriod && breakStatus !== 'completed' && (
          <button
            type="button"
            className={`app-navbar__clock-btn ${breakStatus === 'running' ? 'app-navbar__break-btn--end' : 'app-navbar__break-btn--start'}`}
            onClick={breakStatus === 'running' ? handleEndBreak : handleStartBreak}
            aria-label={breakStatus === 'running' ? `End break, current break time ${breakElapsedString}` : 'Start break'}
            style={{ marginRight: 8 }}
          >
            {(activeBreakPeriod.name || '').toLowerCase().includes('lunch') ||
            (activeBreakPeriod.name || '').toLowerCase().includes('food') ||
            (activeBreakPeriod.name || '').toLowerCase().includes('dinner') ||
            (activeBreakPeriod.name || '').toLowerCase().includes('meal') ? (
              <Utensils size={12} style={{ marginRight: 2 }} />
            ) : (
              <Coffee size={12} style={{ marginRight: 2 }} />
            )}
            {breakStatus === 'running' ? (
              <span>End Break ({breakElapsedString})</span>
            ) : (
              <span>Start Break</span>
            )}
          </button>
        )}

        {!requiresClockIn ? (
          <div className="app-navbar__date-tab" role="status" aria-label={`Today: ${appNavDateLabel}`}>

            <Calendar size={14} aria-hidden="true" />

            <span>{appNavDateLabel}</span>

          </div>
        ) : (
          <button
            type="button"
            className={`app-navbar__clock-btn ${isClockedIn ? 'app-navbar__clock-btn--out' : 'app-navbar__clock-btn--in'}`}
            onClick={handleClockToggle}
            aria-label={isClockedIn ? `Clock out, current elapsed time ${elapsedString}` : 'Clock in'}
          >
            <span className={`app-navbar__clock-dot ${isClockedIn ? 'app-navbar__clock-dot--pulse' : ''}`} />
            {isClockedIn ? (
              <>
                <Square size={11} fill="currentColor" style={{ marginRight: 2 }} />
                <span>Clock Out ({elapsedString})</span>
              </>
            ) : (
              <>
                <Play size={11} fill="currentColor" style={{ marginRight: 2 }} />
                <span>Clock In</span>
              </>
            )}
          </button>
        )}





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

            <UserProfile />

          </div>



          {profileOpen && (

            <div className="navbar-profile__dropdown" role="menu">

              <div className="navbar-profile__switcher">

                  <EmployeeSwitcher onAfterSelect={() => setProfileOpen(false)} />

                </div>

              <button

                className="navbar-profile__action"

                role="menuitem"

                onClick={() => {
                  setProfileOpen(false);
                  navigate('/profile');
                }}

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

                onClick={() => { setProfileOpen(false); alert('Signing out...'); }}

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
