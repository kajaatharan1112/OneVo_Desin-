import { useState } from 'react';
import './tenant-setup-wizard.css';

interface TenantSetupWizardProps {
  onFinish?: () => void;
  onCancel?: () => void;
}

export function TenantSetupWizard({ onFinish, onCancel }: TenantSetupWizardProps) {
  const [slide, setSlide] = useState<number>(1);

  const handleNext = () => {
    if (slide < 3) setSlide(slide + 1);
  };

  const handleBack = () => {
    if (slide > 1) setSlide(slide - 1);
  };

  const handleFinish = () => {
    if (onFinish) onFinish();
  };

  return (
    <div className="tenant-wizard-overlay">
      <div className="tenant-wizard-modal">
        <div className="wizard-header">
          <h2 className="wizard-title">Tenant Setup</h2>
          <button className="wizard-close" onClick={onCancel} aria-label="Close setup">
            &times;
          </button>
        </div>

        <div className="wizard-progress">
          <div className={`progress-step ${slide >= 1 ? 'active' : ''}`}>1</div>
          <div className={`progress-line ${slide >= 2 ? 'active' : ''}`}></div>
          <div className={`progress-step ${slide >= 2 ? 'active' : ''}`}>2</div>
          <div className={`progress-line ${slide >= 3 ? 'active' : ''}`}></div>
          <div className={`progress-step ${slide >= 3 ? 'active' : ''}`}>3</div>
        </div>

        <div className="wizard-body">
          {slide === 1 && (
            <div className="wizard-slide slide-1">
              <h3>Welcome to Enterprise Nexus</h3>
              <p>Let's get your workspace set up in just a few steps. First, we need some basic information.</p>
              <div className="wizard-placeholder-form">
                <div className="form-group">
                  <label>Company Name</label>
                  <input type="text" placeholder="e.g. Acme Corp" />
                </div>
              </div>
            </div>
          )}

          {slide === 2 && (
            <div className="wizard-slide slide-2">
              <h3>Configure Workspace</h3>
              <p>Choose your workspace preferences and region.</p>
              <div className="wizard-placeholder-form">
                <div className="form-group">
                  <label>Data Region</label>
                  <select>
                    <option>US East (N. Virginia)</option>
                    <option>EU (Frankfurt)</option>
                    <option>Asia Pacific (Singapore)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {slide === 3 && (
            <div className="wizard-slide slide-3">
              <h3>Almost Done!</h3>
              <p>Review your settings before we provision your tenant space.</p>
              <div className="wizard-summary">
                <p><strong>Company:</strong> Not provided</p>
                <p><strong>Region:</strong> US East</p>
              </div>
            </div>
          )}
        </div>

        <div className="wizard-footer">
          <div className="footer-left">
            {slide > 1 && (
              <button className="wizard-btn btn-secondary" onClick={handleBack}>
                Back
              </button>
            )}
          </div>
          <div className="footer-right">
            {slide < 3 && (
              <button className="wizard-btn btn-primary" onClick={handleNext}>
                Next
              </button>
            )}
            {slide === 3 && (
              <button className="wizard-btn btn-success" onClick={handleFinish}>
                Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
