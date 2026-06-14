import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, CreditCard, ShieldCheck } from 'lucide-react';
import './payment-gateway.css';

interface PaymentGatewayProps {
  amount: number;
  accounts: number;
  addons: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentGateway: React.FC<PaymentGatewayProps> = ({ amount, accounts, addons, onClose, onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate payment processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      // Notify parent after animation shows
      setTimeout(() => {
        onSuccess();
      }, 3000);
    }, 2000);
  };

  if (!mounted) return null;

  return createPortal(
    <div className="payment-gateway-overlay">
      <div className="payment-gateway-modal">
        {!isProcessing && !isSuccess && (
          <button className="payment-close-btn" onClick={onClose} aria-label="Close Payment Gateway">
            <X size={20} />
          </button>
        )}

        <div className="payment-content">
          {isSuccess ? (
            <div className="payment-success-view">
              <div className="success-animation">
                <CheckCircle size={80} color="#10b981" strokeWidth={1.5} />
              </div>
              <h2>Payment Successful!</h2>
              <p>Your subscription for {accounts} account(s) has been activated.</p>
              <div className="receipt-details">
                <span>Amount Paid:</span>
                <strong>${amount.toFixed(2)}</strong>
              </div>
            </div>
          ) : (
            <>
              <div className="payment-header">
                <h2>Secure Checkout</h2>
                <ShieldCheck size={24} color="#3b82f6" />
              </div>

              <div className="payment-layout">
                <div className="payment-order-summary">
                  <h3>Payment invoice</h3>
                  <div className="summary-row">
                    <span>Base Package x {accounts}</span>
                    <span>${(5 * accounts).toFixed(2)}</span>
                  </div>
                  {addons > 0 && (
                    <div className="summary-row">
                      <span>Add-ons ({addons}) x {accounts}</span>
                      <span>${((amount / accounts) - 5) * accounts}.00</span>
                    </div>
                  )}
                  <div className="summary-divider"></div>
                  <div className="summary-row total">
                    <span>Total</span>
                    <span>${amount.toFixed(2)}</span>
                  </div>
                </div>

                <form className="payment-form" onSubmit={handlePay}>
                  <h3>Payment Details</h3>
                  <div className="form-group">
                    <label>Cardholder Name</label>
                    <input type="text" placeholder="John Doe" required />
                  </div>
                  <div className="form-group">
                    <label>Card Number</label>
                    <div className="card-input-wrapper">
                      <CreditCard size={18} className="card-icon" />
                      <input type="text" placeholder="0000 0000 0000 0000" maxLength={19} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group half">
                      <label>Expiry Date</label>
                      <input type="text" placeholder="MM/YY" maxLength={5} required />
                    </div>
                    <div className="form-group half">
                      <label>CVC</label>
                      <input type="text" placeholder="123" maxLength={4} required />
                    </div>
                  </div>
                  <button type="submit" className="pay-now-btn" disabled={isProcessing}>
                    {isProcessing ? <div className="spinner"></div> : `Pay $${amount.toFixed(2)}`}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
