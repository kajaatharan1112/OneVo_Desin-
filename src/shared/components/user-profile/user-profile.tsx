import React from 'react';

interface UserProfileProps {
  currentView: 'employee' | 'tenant';
}

export const UserProfile: React.FC<UserProfileProps> = ({ currentView }) => {
  const user = currentView === 'tenant'
    ? { name: 'Sarah Jenkins', role: 'Department head', avatar: 'SJ', avatarUrl: 'https://i.pravatar.cc/150?u=sarah' }
    : { name: 'Alexander Pierce', role: 'Back end developer', avatar: 'AP', avatarUrl: 'https://i.pravatar.cc/150?u=alex' };

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
