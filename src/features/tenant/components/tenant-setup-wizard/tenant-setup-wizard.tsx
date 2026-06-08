import { useEffect, useState } from 'react';
import { Building2, Clock, Mail, User } from 'lucide-react';
import softwareIllustration from '../../../../Animation/Software.svg';
import './tenant-setup-wizard.css';

type MemberAccess = 'permanent' | 'temporary';
type TemporaryDuration = '12hours' | '1day' | '5days';

interface TenantSetupWizardProps {
  onFinish?: () => void;
  onCancel?: () => void;
  overlay?: 'content' | 'fullscreen';
}

export function TenantSetupWizard({
  onFinish,
  onCancel,
  overlay = 'content'
}: TenantSetupWizardProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [accessType, setAccessType] = useState<MemberAccess>('permanent');
  const [duration, setDuration] = useState<TemporaryDuration>('12hours');

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const overlayClass =
    overlay === 'fullscreen'
      ? 'tenant-wizard-overlay'
      : 'tenant-wizard-overlay tenant-wizard-overlay--content';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFinish?.();
  };

  return (
    <div
      className={overlayClass}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tenant-setup-title"
      aria-describedby="tenant-setup-desc"
    >
      <div className="tenant-wizard-modal tenant-wizard-modal--split">
        <button
          type="button"
          className="wizard-close"
          onClick={onCancel}
          aria-label="Close invitation form"
        >
          &times;
        </button>

        <div className="tenant-wizard-split">
          <div className="tenant-wizard-form-panel">
            <header className="tenant-wizard-form-header">
              <div className="tenant-wizard-form-header__text">
                <h2 id="tenant-setup-title" className="wizard-title">
                  Send member invitation
                </h2>
                <p id="tenant-setup-desc" className="tenant-wizard-form-subtitle">
                  Invite a global member to your organization by email
                </p>
              </div>
              <button type="button" className="wizard-btn btn-create-org">
                <Building2 size={15} aria-hidden />
                Create organization
              </button>
              <p className="tenant-wizard-form-hint">
                Need a new org first? Create one, then send invitations.
              </p>
            </header>

            <form id="tenant-wizard-form" className="tenant-wizard-form" onSubmit={handleSubmit}>
              <section className="tenant-wizard-form-card">
                <header className="tenant-wizard-form-card__head">
                  <h3 className="tenant-wizard-form-heading">Invitation details</h3>
                  <p className="tenant-wizard-form-card__desc">
                    The member will receive an email with a link to join your workspace
                  </p>
                </header>

                <div className="tenant-wizard-form-body">
                  <div className="form-row">
                    <div className="form-field">
                      <label htmlFor="wizard-member-email">Member email</label>
                      <div className="form-input-wrap">
                        <Mail size={15} className="form-input-icon" aria-hidden />
                        <input
                          id="wizard-member-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="colleague@company.com"
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <div className="form-field">
                      <label htmlFor="wizard-member-name">Member name</label>
                      <div className="form-input-wrap">
                        <User size={15} className="form-input-icon" aria-hidden />
                        <input
                          id="wizard-member-name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Name shown on the invitation"
                          autoComplete="name"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-field form-field--access">
                    <span className="form-field__label" id="access-type-label">
                      Invitation access
                    </span>
                    <p className="form-field__hint">
                      Permanent members stay until removed. Temporary access expires automatically.
                    </p>
                    <div
                      className="wizard-access-tabs"
                      role="radiogroup"
                      aria-labelledby="access-type-label"
                    >
                      <label
                        className={`wizard-access-tab${
                          accessType === 'permanent' ? ' wizard-access-tab--active' : ''
                        }`}
                      >
                        <input
                          type="radio"
                          name="accessType"
                          value="permanent"
                          checked={accessType === 'permanent'}
                          onChange={() => setAccessType('permanent')}
                        />
                        <span>Permanent</span>
                      </label>
                      <label
                        className={`wizard-access-tab${
                          accessType === 'temporary' ? ' wizard-access-tab--active' : ''
                        }`}
                      >
                        <input
                          type="radio"
                          name="accessType"
                          value="temporary"
                          checked={accessType === 'temporary'}
                          onChange={() => setAccessType('temporary')}
                        />
                        <span>Temporary</span>
                      </label>
                    </div>

                    {accessType === 'temporary' && (
                      <div className="form-field form-field--nested">
                        <label htmlFor="wizard-member-duration">Access expires after</label>
                        <div className="form-input-wrap">
                          <Clock size={15} className="form-input-icon" aria-hidden />
                          <select
                            id="wizard-member-duration"
                            value={duration}
                            onChange={(e) =>
                              setDuration(e.target.value as TemporaryDuration)
                            }
                          >
                            <option value="12hours">12 hours</option>
                            <option value="1day">One day</option>
                            <option value="5days">5 days</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="tenant-wizard-form-note">
                    By sending, you agree to invite this person as a global member of your
                    organization.
                  </p>
                </div>
              </section>

              <footer className="tenant-wizard-form-footer">
                <button type="button" className="wizard-btn btn-secondary" onClick={onCancel}>
                  Cancel
                </button>
                <button type="submit" className="wizard-btn btn-primary">
                  Send invitation
                </button>
              </footer>
            </form>
          </div>

          <div className="tenant-wizard-visual-panel" aria-hidden>
            <div className="tenant-wizard-illustration-wrap">
              <img
                src={softwareIllustration}
                alt=""
                className="tenant-wizard-illustration"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
