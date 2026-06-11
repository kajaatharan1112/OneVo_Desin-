import React from 'react';
import { useEmployeeContext } from '../../../features/employees/context/employee-context';

interface UserProfileProps {
  currentView: 'employee' | 'tenant';
}

export const UserProfile: React.FC<UserProfileProps> = ({ currentView }) => {
  const { selectedEmployee } = useEmployeeContext();

  const user = currentView === 'tenant'
    ? { name: 'Manesh', role: 'CEO', avatar: 'M', avatarUrl: 'https://i.pravatar.cc/150?u=manesh' }
    : selectedEmployee;

  return (
    <div className="user-profile">
      <div className="avatar-wrapper" title={user.name} aria-label={user.name}>
        <img src={user.avatarUrl} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
        <div className="avatar-status" aria-hidden="true" />
      </div>

      <div className="user-profile__details">
        <h3 className="user-name">{user.name}</h3>
        <span className="user-role">{user.role}</span>
      </div>
    </div>
  );
};
