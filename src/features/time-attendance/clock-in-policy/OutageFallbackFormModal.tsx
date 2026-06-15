import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useClockInPolicyStore } from './clockInPolicyStore';
import { EMPTY_OUTAGE_FORM, type OutageEndsMode, type OutageFormValues } from './clockInPolicyTypes';

export const OutageFallbackFormModal: React.FC = () => {
  const { outageForm, closeOutageForm, addOutageFallback } = useClockInPolicyStore();
  const [values, setValues] = useState<OutageFormValues>(EMPTY_OUTAGE_FORM());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (outageForm.open) {
      setValues(EMPTY_OUTAGE_FORM());
      setError(null);
    }
  }, [outageForm.open]);

  if (!outageForm.open) return null;

  const handleSave = () => {
    const result = addOutageFallback(values);
    if (!result.ok) setError(result.error ?? 'Unable to enable fallback.');
  };

  const endsOptions: { mode: OutageEndsMode; label: string }[] = [
    { mode: '1h', label: 'In 1 hour' },
    { mode: '4h', label: 'In 4 hours' },
    { mode: 'eod', label: 'End of day' },
    { mode: 'custom', label: 'Custom date/time' }
  ];

  return (
    <div className="schedules-cfg-modal-overlay" onClick={closeOutageForm}>
      <div
        className="schedules-cfg-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Add outage fallback"
        onClick={e => e.stopPropagation()}
      >
        <header className="schedules-cfg-modal__header">
          <h2>Add Outage Fallback</h2>
          <button type="button" className="org-slideover__close" onClick={closeOutageForm} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="schedules-cfg-modal__body">
          {error && <p className="schedules-cfg-form-error">{error}</p>}

          <div className="org-form-field">
            <label>Affected office/location</label>
            <input
              value={values.location}
              onChange={e => setValues(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g. Colombo Office"
            />
          </div>

          <div className="org-form-field">
            <label>Outage reason</label>
            <input
              value={values.reason}
              onChange={e => setValues(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="e.g. Biometric terminal maintenance"
            />
          </div>

          <div className="org-form-field">
            <label>Starts</label>
            <div className="leave-cfg-segmented">
              <button
                type="button"
                className={`leave-cfg-segmented__btn${values.startsMode === 'now' ? ' leave-cfg-segmented__btn--active' : ''}`}
                onClick={() => setValues(prev => ({ ...prev, startsMode: 'now' }))}
              >
                Now
              </button>
              <button
                type="button"
                className={`leave-cfg-segmented__btn${values.startsMode === 'on-datetime' ? ' leave-cfg-segmented__btn--active' : ''}`}
                onClick={() => setValues(prev => ({ ...prev, startsMode: 'on-datetime' }))}
              >
                On date/time
              </button>
            </div>
            {values.startsMode === 'on-datetime' && (
              <input
                type="datetime-local"
                className="cip-modal-date"
                value={values.startsAt}
                onChange={e => setValues(prev => ({ ...prev, startsAt: e.target.value }))}
              />
            )}
          </div>

          <div className="org-form-field">
            <label>Ends</label>
            <div className="leave-cfg-segmented leave-cfg-segmented--wrap">
              {endsOptions.map(opt => (
                <button
                  key={opt.mode}
                  type="button"
                  className={`leave-cfg-segmented__btn${values.endsMode === opt.mode ? ' leave-cfg-segmented__btn--active' : ''}`}
                  onClick={() => setValues(prev => ({ ...prev, endsMode: opt.mode }))}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {values.endsMode === 'custom' && (
              <input
                type="datetime-local"
                className="cip-modal-date"
                value={values.endsAt}
                onChange={e => setValues(prev => ({ ...prev, endsAt: e.target.value }))}
              />
            )}
          </div>

          <div className="org-form-field">
            <label>Status</label>
            <select
              value={values.status}
              onChange={e =>
                setValues(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <footer className="schedules-cfg-modal__footer">
          <button type="button" className="org-btn org-btn--secondary" onClick={closeOutageForm}>
            Cancel
          </button>
          <button type="button" className="org-btn org-btn--primary" onClick={handleSave}>
            Enable Fallback
          </button>
        </footer>
      </div>
    </div>
  );
};
