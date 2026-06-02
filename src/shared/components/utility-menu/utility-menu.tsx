import React from 'react';
import { Settings, HelpCircle, LogOut } from 'lucide-react';

export const UtilityMenu: React.FC = () => {
  const actions = [
    { label: 'Settings', icon: <Settings size={18} />, action: () => alert('Opening Settings panel...') },
    { label: 'Help and support', icon: <HelpCircle size={18} />, action: () => alert('Opening Help & Support...') },
    { label: 'Log out', icon: <LogOut size={18} />, action: () => alert('Logging out...'), danger: true }
  ];

  return (
    <div className="utility-menu">
      {actions.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.action}
          className={`utility-menu__item${item.danger ? ' utility-menu__item--danger' : ''}`}
          aria-label={item.label}
          title={item.label}
        >
          <span className="utility-menu__icon" aria-hidden="true">
            {item.icon}
          </span>
          <span className="utility-menu__item-label">{item.label}</span>
        </button>
      ))}
    </div>
  );
};
