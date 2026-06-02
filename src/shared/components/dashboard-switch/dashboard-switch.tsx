import React from 'react';

interface DashboardSwitchProps {
  currentView: 'employee' | 'tenant';
  onToggle: () => void;
}

export const DashboardSwitch: React.FC<DashboardSwitchProps> = ({ currentView, onToggle }) => {
  const isTenant = currentView === 'tenant';

  return (
    <div className="dashboard-switch-container">
      <button
        type="button"
        onClick={onToggle}
        className={`switch-btn${isTenant ? ' switch-btn--tenant' : ' switch-btn--employee'}`}
        aria-label="Toggle dashboard view"
      >
        <span
          className={`switch-knob${isTenant ? ' switch-knob--tenant' : ' switch-knob--employee'}`}
          aria-hidden="true"
        />
      </button>
    </div>
  );
};
