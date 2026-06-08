import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle } from 'lucide-react';
import { PaymentGateway } from '../../../features/payment/payment-gateway';
import workManagementIllustration from '../../../Animation/work managemnt.svg';
import './request-toast.css';

interface RequestToastProps {
  onClose: () => void;
}

export const RequestToast: React.FC<RequestToastProps> = ({ onClose }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // Form states
  const [accounts, setAccounts] = useState<number>(1);
  const [addonMonitoring, setAddonMonitoring] = useState<boolean>(true);
  const [addonChat, setAddonChat] = useState<boolean>(true);
  const [companyName, setCompanyName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [isSubdomainEdited, setIsSubdomainEdited] = useState(false);
  const [extraStorage, setExtraStorage] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Lock body scroll when popup is open
  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showPopup]);

  if (!mounted) return null;

  // Pricing
  const addonsCount = (addonMonitoring ? 1 : 0) + (addonChat ? 1 : 0);
  let pricePerEmployee = 5;
  if (addonsCount === 1) pricePerEmployee = 7;
  else if (addonsCount === 2) pricePerEmployee = 8;

  let totalPrice = pricePerEmployee * (accounts || 1);
  if (extraStorage) totalPrice += 20;

  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCompanyName(value);
    if (!isSubdomainEdited) {
      setSubdomain(value.toLowerCase().replace(/[^a-z0-9]/g, ''));
    }
  };

  const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubdomain(e.target.value);
    setIsSubdomainEdited(true);
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setShowPopup(false);
    onClose();
  };

  return createPortal(
    <>
      {/* ── Toast Notification ── */}
      <div className="request-toast-container">
        <button className="request-toast-close" onClick={onClose} aria-label="Close toast">
          <X size={16} />
        </button>
        <div className="request-toast-content">
          <h4>Apply for Main Application</h4>
          <p>Get full access to all the main application features by applying now!</p>
          <button className="apply-now-btn" onClick={() => setShowPopup(true)}>
            Apply Now
          </button>
        </div>
      </div>

      {/* ── Application Form Modal ── */}
      {showPopup && (
        <div className="apply-popup-overlay">
          <div className="apply-popup-modal wide">
            <button
              className="apply-popup-close"
              onClick={() => setShowPopup(false)}
              aria-label="Close form"
            >
              <X size={18} />
            </button>

            <div className="apply-popup-grid">

              {/* ── LEFT: Form ── */}
              <div className="apply-form-section">
                <div className="apply-form-header">
                  <h3>Application Form</h3>
                  <p>Please fill out your details to get started</p>
                </div>

                <form className="apply-form" onSubmit={handlePay}>
                  <div className="apply-form-body">

                    {/* Row 1: Company Name + Registered Number */}
                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Company Name</label>
                        <input
                          type="text"
                          placeholder="Your Company Name"
                          value={companyName}
                          onChange={handleCompanyNameChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Company Registered Number</label>
                        <input type="text" placeholder="Registration No." required />
                      </div>
                    </div>

                    {/* Row 2: Position + Employee Count */}
                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Your Position</label>
                        <input type="text" placeholder="e.g., HR Manager" required />
                      </div>
                      <div className="form-group">
                        <label>Employee count</label>
                        <input
                          type="number"
                          min="1"
                          value={accounts}
                          onChange={(e) => setAccounts(parseInt(e.target.value) || 1)}
                          required
                        />
                      </div>
                    </div>

                    {/* Row 3: Workspace Subdomain */}
                    <div className="form-group">
                      <label>Workspace Subdomain</label>
                      <div className="subdomain-input-wrapper">
                        <input
                          type="text"
                          placeholder="company"
                          value={subdomain}
                          onChange={handleSubdomainChange}
                          required
                          className="subdomain-input"
                        />
                        <span className="subdomain-suffix">.onevo.com</span>
                      </div>
                    </div>

                    {/* Row 4: Storage Options */}
                    <div className="form-group checkbox-group-container">
                      <label>Storage Options</label>
                      <div className="checkbox-row storage-row">
                        <label className="storage-label">
                          <input type="checkbox" checked readOnly disabled /> 5TB Included
                        </label>
                        <label className="storage-label">
                          <input
                            type="checkbox"
                            checked={extraStorage}
                            onChange={(e) => setExtraStorage(e.target.checked)}
                          /> +10TB (+$20)
                        </label>
                      </div>
                    </div>

                    {/* Row 5: Base Modules + Add-Ons */}
                    <div className="form-row-2">
                      <div className="form-group checkbox-group-container">
                        <label>Base Modules (Included)</label>
                        <div className="module-badges">
                          <div className="module-badge disabled selected">
                            <CheckCircle size={14} />
                            <span>HR Mgmt</span>
                          </div>
                          <div className="module-badge disabled selected">
                            <CheckCircle size={14} />
                            <span>Work Mgmt</span>
                          </div>
                        </div>
                      </div>
                      <div className="form-group checkbox-group-container">
                        <label>Select Add-Ons</label>
                        <div className="module-badges">
                          <div 
                            className={`module-badge ${addonMonitoring ? 'selected' : ''}`}
                            onClick={() => setAddonMonitoring(!addonMonitoring)}
                          >
                            <CheckCircle size={14} />
                            <span>Monitoring</span>
                          </div>
                          <div 
                            className={`module-badge ${addonChat ? 'selected' : ''}`}
                            onClick={() => setAddonChat(!addonChat)}
                          >
                            <CheckCircle size={14} />
                            <span>Chat</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>{/* end apply-form-body */}

                  {/* ── Footer: Pricing + Submit ── */}
                  <div className="apply-form-footer">
                    <div className="pricing-summary-block">
                      <div className="pricing-row">
                        <span>Price per account</span>
                        <strong>${pricePerEmployee}.00</strong>
                      </div>
                      {extraStorage && (
                        <div className="pricing-row">
                          <span>Extra Storage (10TB)</span>
                          <strong>$20.00</strong>
                        </div>
                      )}
                      <div className="pricing-row total">
                        <span>Total Estimated Cost</span>
                        <strong>${totalPrice.toFixed(2)}</strong>
                      </div>
                    </div>
                    <button type="submit" className="submit-application-btn">
                      Pay Now
                    </button>
                  </div>
                </form>
              </div>

              {/* ── RIGHT: Illustration ── */}
              <div className="apply-illustration-section">
                <div className="apply-illustration-crop">
                  <img
                    src={workManagementIllustration}
                    alt="Work management illustration"
                    className="form-illustration"
                  />
                </div>
              </div>

            </div>{/* end apply-popup-grid */}
          </div>
        </div>
      )}

      {/* ── Payment Gateway ── */}
      {showPayment && (
        <PaymentGateway
          amount={totalPrice}
          accounts={accounts || 1}
          addons={addonsCount}
          onClose={() => setShowPayment(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>,
    document.body
  );
};
