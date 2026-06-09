import React from 'react';
import { useEmployeeContext } from '../../../features/employees/context/employee-context';
import { EmployeeSwitcher } from '../employee-switcher/employee-switcher';

interface UserProfileProps {
  currentView: 'employee' | 'tenant';
  collapsed?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({ currentView, collapsed = false }) => {
  const { selectedEmployee } = useEmployeeContext();

  const user = currentView === 'tenant'
    ? { name: 'Sarah Jenkins', role: 'Department head', avatar: 'SJ', avatarUrl: 'https://i.pravatar.cc/150?u=sarah' }
    : selectedEmployee;

  return (
    <div className="user-profile">
      <div className="user-profile__main">
        <div className="avatar-wrapper" title={user.name} aria-label={user.name}>
          <img src={user.avatarUrl} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          <div className="avatar-status" aria-hidden="true" />
        </div>

        <div className="user-profile__details">
          <h3 className="user-name">{user.name}</h3>
          <span className="user-role">{user.role}</span>
        </div>
      </div>

      {currentView === 'employee' && (
        <EmployeeSwitcher collapsed={collapsed} />
      )}
    </div>
  );
};
