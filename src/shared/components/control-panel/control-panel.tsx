import React, { useState, useRef, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { DashboardSwitch } from '../dashboard-switch/dashboard-switch';
import { FullscreenToggle } from '../fullscreen-toggle/fullscreen-toggle';
import { TenantSetupWizard } from '../../../features/tenant/components/tenant-setup-wizard';
import { RequestToast } from '../request-toast/request-toast';
import './control-panel.css';

interface ControlPanelProps {
  currentView: 'employee' | 'tenant';
  onToggle: () => void;
  onGoToLandingPage?: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ currentView, onToggle, onGoToLandingPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [showRequestToast, setShowRequestToast] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="control-panel-container" ref={panelRef}>
      <button 
        className={`control-panel-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open Control Panel"
        aria-expanded={isOpen}
      >
        <Settings size={20} />
      </button>

      {isOpen && (
        <div className="control-panel-toast">
          <div className="control-panel-header">
            <h4>Quick Controls</h4>
          </div>
          <div className="control-panel-body">
            <div className="control-panel-item">
              <span className="control-label">Fullscreen</span>
              <FullscreenToggle />
            </div>
            <div className="control-panel-item">
              <span className="control-label">Workspace View</span>
              <DashboardSwitch currentView={currentView} onToggle={onToggle} />
            </div>
            
            {currentView === 'tenant' && (
              <div className="control-panel-item">
                <span className="control-label">Tenant Setup</span>
                <button 
                  className="control-panel-action-btn"
                  onClick={() => { setIsWizardOpen(true); setIsOpen(false); }}
                >
                  Open Wizard
                </button>
              </div>
            )}
            
            <div className="control-panel-item">
              <span className="control-label">Landing Page</span>
              <button 
                className="control-panel-action-btn secondary"
                onClick={() => {
                  setIsOpen(false);
                  if (onGoToLandingPage) onGoToLandingPage();
                }}
              >
                Go
              </button>
            </div>
            
            <div className="control-panel-item">
              <span className="control-label">Main Application</span>
              <button 
                className="control-panel-action-btn secondary"
                onClick={() => {
                  setIsOpen(false);
                  setShowRequestToast(true);
                }}
              >
                Request Access
              </button>
            </div>
          </div>
        </div>
      )}

      {showRequestToast && (
        <RequestToast onClose={() => setShowRequestToast(false)} />
      )}

      {isWizardOpen && (
        <TenantSetupWizard 
          onFinish={() => setIsWizardOpen(false)}
          onCancel={() => setIsWizardOpen(false)}
        />
      )}
    </div>
  );
};
