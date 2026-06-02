import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
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
  const [addonMonitoring, setAddonMonitoring] = useState<boolean>(false);
  const [addonChat, setAddonChat] = useState<boolean>(false);
  
  const [companyName, setCompanyName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [isSubdomainEdited, setIsSubdomainEdited] = useState(false);
  const [extraStorage, setExtraStorage] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Calculate pricing
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

      {showPopup && (
        <div className="apply-popup-overlay">
          <div className="apply-popup-modal wide">
            <button className="apply-popup-close" onClick={() => setShowPopup(false)} aria-label="Close form">
              <X size={20} />
            </button>
            
            <div className="apply-popup-grid">
              <div className="apply-form-section">
                <div className="apply-form-header">
                  <h3>Application Form</h3>
                  <p>Please fill out your details to get started</p>
                </div>
                <form className="apply-form" onSubmit={handlePay}>
                  <div className="apply-form-body">
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
                        onChange={(e) => setAccounts(parseInt(e.target.value) || 0)} 
                        required 
                      />
                    </div>
                  </div>

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

                  <div className="form-group checkbox-group-container">
                    <label>Storage Options</label>
                    <div className="checkbox-row storage-row">
                      <label className="storage-label">
                        <input type="checkbox" checked readOnly disabled /> 
                        5TB Included
                      </label>
                      <label className="storage-label">
                        <input 
                          type="checkbox" 
                          checked={extraStorage} 
                          onChange={(e) => setExtraStorage(e.target.checked)} 
                        /> 
                        +10TB (+$20)
                      </label>
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group checkbox-group-container">
                      <label>Base Modules (Included)</label>
                      <div className="checkbox-row disabled">
                        <label><input type="checkbox" checked readOnly /> HR Mgmt</label>
                        <label><input type="checkbox" checked readOnly /> Work Mgmt</label>
                      </div>
                    </div>

                    <div className="form-group checkbox-group-container">
                      <label>Select Add-Ons</label>
                      <div className="checkbox-row">
                        <label>
                          <input 
                            type="checkbox" 
                            checked={addonMonitoring} 
                            onChange={(e) => setAddonMonitoring(e.target.checked)} 
                          /> 
                          Monitoring
                        </label>
                        <label>
                          <input 
                            type="checkbox" 
                            checked={addonChat} 
                            onChange={(e) => setAddonChat(e.target.checked)} 
                          /> 
                          Chat
                        </label>
                      </div>
                    </div>
                  </div>
                  </div>

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

              <div className="apply-illustration-section">
                <div className="apply-illustration-crop">
                  <img
                    src={workManagementIllustration}
                    alt="Work management illustration"
                    className="form-illustration"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
