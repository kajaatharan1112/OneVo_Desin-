import React, { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import organizingProjectsIllustration from '../../../Animation/organizing-projects-animate.svg';
import './apply-demo-form.css';

interface ApplyDemoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export const ApplyDemoForm: React.FC<ApplyDemoFormProps> = ({ isOpen, onClose, onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    country: '',
    companySize: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitSuccess();
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="demo-modal-overlay" onClick={onClose}>
          <motion.div 
            className="demo-modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="demo-modal-close" onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>

            <div className="demo-modal-grid">
              <div className="demo-modal-illustration" aria-hidden="true">
                <div className="demo-illustration-crop">
                  <img
                    src={organizingProjectsIllustration}
                    alt=""
                    className="demo-form-illustration"
                  />
                </div>
              </div>

              <div className="demo-modal-form-column">
                <div className="demo-modal-header">
                  <h3>Apply for a Demo</h3>
                  <p>Experience the future of Enterprise HRMS. Fill out the details below and our team will be in touch.</p>
                </div>

                <form className="demo-modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input 
                  type="text" 
                  id="fullName" 
                  name="fullName" 
                  required 
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Business Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  required 
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="country">Country</label>
                  <input 
                    type="text" 
                    id="country" 
                    name="country" 
                    required 
                    placeholder="United States"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="companySize">Company Size</label>
                  <select 
                    id="companySize" 
                    name="companySize" 
                    required
                    value={formData.companySize}
                    onChange={handleChange}
                  >
                    <option value="" disabled>Select size</option>
                    <option value="1-50">1 - 50 employees</option>
                    <option value="51-200">51 - 200 employees</option>
                    <option value="201-500">201 - 500 employees</option>
                    <option value="501-1000">501 - 1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>
              </div>
              
              <button 
                type="submit" 
                className={`demo-submit-btn ${isSubmitting ? 'loading' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : (
                  <>
                    Request Demo <ArrowRight size={16} />
                  </>
                )}
              </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
