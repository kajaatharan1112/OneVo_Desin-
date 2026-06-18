import React, { useEffect } from 'react';
import type { GeneratedAccessGrant } from './accessTypes';
import { formatGrantSummary, scopeLabel } from './accessUtils';
import { getPositionAccessTemplate } from './positionAccessConfigStore';

interface PositionAccessSectionProps {
  targetPositionId: string;
  canEdit: boolean;
  grants: GeneratedAccessGrant[];
  onChange: (grants: GeneratedAccessGrant[]) => void;
}

export const PositionAccessSection: React.FC<PositionAccessSectionProps> = ({
  targetPositionId,
  canEdit,
  grants,
  onChange
}) => {
  useEffect(() => {
    if (targetPositionId) {
      onChange(getPositionAccessTemplate(targetPositionId));
    }
  }, [targetPositionId, onChange]);

  if (!targetPositionId) return null;

  if (!canEdit) {
    return (
      <div className="access-section access-section--readonly">
        <label className="schedules-cfg-form-section__label">Position access preview</label>
        <p className="access-section__notice">
          This change includes access updates and requires approval.
        </p>
      </div>
    );
  }

  return (
    <div className="access-section">
      <label className="schedules-cfg-form-section__label">Position access preview</label>

      {grants.length === 0 ? (
        <p className="access-section__empty">No elevated access generated for this position.</p>
      ) : (
        <ul className="access-section__list">
          {grants.map((grant, index) => (
            <li key={`${grant.roleId}-${index}`} className="access-grant-row access-grant-row--preview">
              <div className="access-grant-row__fields">
                <div className="org-form-field">
                  <label>Role granted</label>
                  <input readOnly className="settings-readonly" value={grant.roleName} />
                </div>
                <div className="org-form-field">
                  <label>Can access employees in</label>
                  <input readOnly className="settings-readonly" value={scopeLabel(grant.accessArea)} />
                </div>
                {grant.accessArea === 'selected_departments' && grant.departmentNames?.length ? (
                  <div className="org-form-field">
                    <label>Selected departments</label>
                    <input readOnly className="settings-readonly" value={grant.departmentNames.join(', ')} />
                  </div>
                ) : null}
                {grant.accessArea === 'selected_positions' && grant.positionNames?.length ? (
                  <div className="org-form-field">
                    <label>Selected positions</label>
                    <input readOnly className="settings-readonly" value={grant.positionNames.join(', ')} />
                  </div>
                ) : null}
                <div className="org-form-field">
                  <label>Requires approval</label>
                  <input
                    readOnly
                    className="settings-readonly"
                    value={grant.requiresApproval ? 'Required' : 'Not required'}
                  />
                </div>
              </div>
              <p className="access-grant-row__summary">{formatGrantSummary(grant)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
