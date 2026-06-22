import React from 'react';
import { X } from 'lucide-react';
import { useBulkOnboardingStore } from '../../../store/bulkOnboardingStore';
import { Step1UploadFile } from './steps/Step1UploadFile';
import { Step2MapColumns } from './steps/Step2MapColumns';
import { Step3ResolveOrganization } from './steps/Step3ResolveOrganization';
import { Step4ReviewAccess } from './steps/Step4ReviewAccess';
import { Step5ValidateRows } from './steps/Step5ValidateRows';
import { Step6ConfirmImport } from './steps/Step6ConfirmImport';
import { Step7SendInvitations } from './steps/Step7SendInvitations';
import './bulkOnboarding.css';

const STEP_LABELS: Record<string, string> = {
  upload: '1. Upload File',
  'map-columns': '2. Map Columns',
  'resolve-organization': '3. Resolve Organization',
  'review-access': '4. Review Access Impact',
  'validate-rows': '5. Validate Rows',
  'confirm-import': '6. Confirm Import',
  'send-invitations': '7. Send Invitations'
};

interface BulkOnboardingModalProps {
  onClose: () => void;
}

export const BulkOnboardingModal: React.FC<BulkOnboardingModalProps> = ({ onClose }) => {
  const { step, reset } = useBulkOnboardingStore();

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <div className="checklist-template-modal-overlay" onClick={handleClose}>
      <div className="checklist-template-modal bulk-onboard-modal" role="dialog" aria-modal="true" aria-label="Bulk Onboard" onClick={e => e.stopPropagation()}>
        <header className="checklist-template-modal__header">
          <h2>Bulk Onboard — {STEP_LABELS[step]}</h2>
          <button type="button" className="org-slideover__close" onClick={handleClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="checklist-template-modal__body bulk-onboard-modal__body">
          {step === 'upload' && <Step1UploadFile />}
          {step === 'map-columns' && <Step2MapColumns />}
          {step === 'resolve-organization' && <Step3ResolveOrganization />}
          {step === 'review-access' && <Step4ReviewAccess />}
          {step === 'validate-rows' && <Step5ValidateRows />}
          {step === 'confirm-import' && <Step6ConfirmImport />}
          {step === 'send-invitations' && <Step7SendInvitations onDone={handleClose} />}
        </div>
      </div>
    </div>
  );
};
