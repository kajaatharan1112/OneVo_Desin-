import React from 'react';

interface MainMenuItemProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  collapsed?: boolean;
  onClick: () => void;
}

export const MainMenuItem: React.FC<MainMenuItemProps> = ({
  label,
  icon,
  isActive,
  collapsed = false,
  onClick
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`main-menu__item${isActive ? ' main-menu__item--active' : ''}`}
      aria-current={isActive ? 'page' : undefined}
      aria-label={label}
      title={label}
    >
      <span className="main-menu__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="main-menu__item-label">{label}</span>
      {isActive && !collapsed && <span className="main-menu__dot" aria-hidden="true" />}
    </button>
  );
};
