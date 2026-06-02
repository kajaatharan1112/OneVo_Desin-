import React from 'react';

interface AppBrandProps {
  onClick?: () => void;
}

export const AppBrand: React.FC<AppBrandProps> = ({ onClick }) => {
  return (
    <div 
      className="app-brand" 
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="app-logo" title="OneVo HRMS" aria-label="OneVo HRMS">
        V
      </div>
      <span className="app-title">OneVo HRMS</span>
    </div>
  );
};
